/**
 * One-shot migration of legacy Mongo `users` rows into Keycloak.
 *
 * Reads users from the legacy Mongo collection (argon2 password hashes),
 * converts the PHC-encoded hash into Keycloak's secretData/credentialData
 * shape, and creates one Keycloak user per row via the Admin API.
 *
 * Scope: only rows with enabled=true AND adminEnabled=true.
 * Idempotent: skips users that already exist in Keycloak by username/email.
 *
 * Required env:
 *   MONGO_DB           legacy database name
 *
 * Optional env (with defaults shown):
 *   MONGO_URI          mongodb://localhost:27017
 *   MONGO_COLLECTION   users
 *   KC_URL             http://localhost:8080
 *   KC_REALM           mibi-portal
 *   KC_ADMIN_USER      admin
 *   KC_ADMIN_PASS      admin
 *
 * Flags:
 *   --dry-run          print actions, make no writes
 *   --limit N          process at most N users (useful for staging runs)
 *
 * Run:
 *   npx ts-node scripts/migrate-users-to-keycloak.ts --dry-run --limit 5
 */

import { MongoClient } from 'mongodb';

type LegacyUser = {
    _id: unknown;
    email?: string;
    firstName?: string;
    lastName?: string;
    password?: string;
    enabled?: boolean;
    adminEnabled?: boolean;
};

type KcCredential = {
    type: 'password';
    secretData: string;
    credentialData: string;
};

type KcUserPayload = {
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    enabled: true;
    emailVerified: true;
    requiredActions: [];
    credentials: [KcCredential];
};

type ParsedHash = {
    type: 'id' | 'i' | 'd';
    version: string;
    memory: number;
    iterations: number;
    parallelism: number;
    hashLength: number;
    secretData: string;
    credentialData: string;
};

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const limitIdx = args.indexOf('--limit');
const limit = limitIdx >= 0 ? Number(args[limitIdx + 1]) : Infinity;

const env = (k: string, d?: string): string => {
    const v = process.env[k] ?? d;
    if (v === undefined) {
        console.error(`Missing required env: ${k}`);
        process.exit(2);
    }
    return v;
};

const MONGO_URI = env('MONGO_URI', 'mongodb://localhost:27017');
const MONGO_DB = env('MONGO_DB');
const MONGO_COLLECTION = env('MONGO_COLLECTION', 'users');
const KC_URL = env('KC_URL', 'http://localhost:8080');
const KC_REALM = env('KC_REALM', 'mibi-portal');
const KC_ADMIN_USER = env('KC_ADMIN_USER', 'admin');
const KC_ADMIN_PASS = env('KC_ADMIN_PASS', 'admin');

const padB64 = (s: string): string => s + '='.repeat((4 - (s.length % 4)) % 4);

function parseArgon2Phc(phc: string): ParsedHash {
    // $argon2{id|i|d}$v=19$m=...,t=...,p=...[,...]$[data=...$]<saltB64NoPad>$<hashB64NoPad>
    if (!phc?.startsWith('$argon2')) {
        throw new Error('not an argon2 PHC string');
    }
    const parts = phc.split('$');
    // parts[0] = '', [1] = argon2{id|i|d}, [2] = v=19, [3] = params, [last-1] = salt, [last] = hash
    const algo = parts[1];
    if (algo !== 'argon2id' && algo !== 'argon2i' && algo !== 'argon2d') {
        throw new Error(`unsupported algorithm: ${algo}`);
    }
    const type = algo.replace('argon2', '') as 'id' | 'i' | 'd';

    const vMatch = parts[2]?.match(/^v=(\d+)$/);
    if (!vMatch) throw new Error(`bad version segment: ${parts[2]}`);
    const versionNum = Number(vMatch[1]);
    // Keycloak displays version as the hex-decoded string ("1.3" for 0x13 == 19).
    const versionStr = `${versionNum >> 4}.${versionNum & 0xf}`;

    const paramStr = parts[3] ?? '';
    const paramMap: Record<string, number> = {};
    for (const kv of paramStr.split(',')) {
        const [k, v] = kv.split('=');
        if (k && v) paramMap[k] = Number(v);
    }
    const memory = paramMap.m;
    const iterations = paramMap.t;
    const parallelism = paramMap.p;
    if (!memory || !iterations || !parallelism) {
        throw new Error(`missing params in ${paramStr}`);
    }

    const saltRaw = parts[parts.length - 2];
    const hashRaw = parts[parts.length - 1];
    if (!saltRaw || !hashRaw) throw new Error('missing salt or hash');

    const hashBytes = Buffer.from(padB64(hashRaw), 'base64').length;

    const secretData = JSON.stringify({
        value: padB64(hashRaw),
        salt: padB64(saltRaw)
    });
    const credentialData = JSON.stringify({
        hashIterations: iterations,
        algorithm: 'argon2',
        additionalParameters: {
            hashLength: [String(hashBytes)],
            memory: [String(memory)],
            type: [type],
            version: [versionStr],
            parallelism: [String(parallelism)]
        }
    });

    return {
        type,
        version: versionStr,
        memory,
        iterations,
        parallelism,
        hashLength: hashBytes,
        secretData,
        credentialData
    };
}

class KcClient {
    private token = '';
    private tokenExpiresAt = 0;

    private async refreshToken(): Promise<void> {
        const res = await fetch(
            `${KC_URL}/realms/master/protocol/openid-connect/token`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                    username: KC_ADMIN_USER,
                    password: KC_ADMIN_PASS,
                    grant_type: 'password',
                    client_id: 'admin-cli'
                })
            }
        );
        if (!res.ok) {
            throw new Error(
                `admin token request failed: ${res.status} ${await res.text()}`
            );
        }
        const j = (await res.json()) as {
            access_token: string;
            expires_in: number;
        };
        this.token = j.access_token;
        this.tokenExpiresAt = Date.now() + (j.expires_in - 5) * 1000;
    }

    private async ensureToken(): Promise<void> {
        if (!this.token || Date.now() >= this.tokenExpiresAt) {
            await this.refreshToken();
        }
    }

    async findUserByUsername(username: string): Promise<{ id: string } | null> {
        await this.ensureToken();
        const url = new URL(`${KC_URL}/admin/realms/${KC_REALM}/users`);
        url.searchParams.set('username', username);
        url.searchParams.set('exact', 'true');
        const res = await fetch(url, {
            headers: { Authorization: `Bearer ${this.token}` }
        });
        if (!res.ok) {
            throw new Error(
                `findUserByUsername failed: ${res.status} ${await res.text()}`
            );
        }
        const arr = (await res.json()) as { id: string }[];
        return arr[0] ?? null;
    }

    async createUser(payload: KcUserPayload): Promise<void> {
        await this.ensureToken();
        const res = await fetch(`${KC_URL}/admin/realms/${KC_REALM}/users`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${this.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        if (res.status === 201) return;
        if (res.status === 409) {
            throw new Error('conflict (user already exists)');
        }
        throw new Error(`createUser failed: ${res.status} ${await res.text()}`);
    }
}

async function main(): Promise<void> {
    console.log(
        `[config] mongo=${MONGO_URI}/${MONGO_DB}.${MONGO_COLLECTION} ` +
            `kc=${KC_URL} realm=${KC_REALM} dryRun=${dryRun} limit=${limit}`
    );

    const mongo = new MongoClient(MONGO_URI);
    await mongo.connect();
    const coll = mongo
        .db(MONGO_DB)
        .collection<LegacyUser>(MONGO_COLLECTION);

    const cursor = coll.find({ enabled: true, adminEnabled: true });
    const kc = new KcClient();

    let total = 0;
    let created = 0;
    let skippedExists = 0;
    let skippedBadHash = 0;
    let errors = 0;

    for await (const u of cursor) {
        if (total >= limit) break;
        total++;
        const email = (u.email ?? '').trim();
        const firstName = (u.firstName ?? '').trim();
        const lastName = (u.lastName ?? '').trim();

        if (!email || !u.password) {
            console.log(`[SKIP:incomplete] ${email || '<no-email>'}`);
            skippedBadHash++;
            continue;
        }

        let parsed: ParsedHash;
        try {
            parsed = parseArgon2Phc(u.password);
        } catch (e) {
            console.log(
                `[SKIP:bad-hash] ${email} reason=${(e as Error).message}`
            );
            skippedBadHash++;
            continue;
        }

        try {
            const existing = await kc.findUserByUsername(email);
            if (existing) {
                console.log(`[SKIP:exists] ${email} kcId=${existing.id}`);
                skippedExists++;
                continue;
            }
        } catch (e) {
            console.log(`[ERROR:lookup] ${email} ${(e as Error).message}`);
            errors++;
            continue;
        }

        const payload: KcUserPayload = {
            username: email,
            email,
            firstName: firstName || email,
            lastName: lastName || email,
            enabled: true,
            emailVerified: true,
            requiredActions: [],
            credentials: [
                {
                    type: 'password',
                    secretData: parsed.secretData,
                    credentialData: parsed.credentialData
                }
            ]
        };

        if (dryRun) {
            console.log(
                `[DRY:would-create] ${email} ` +
                    `argon2${parsed.type} m=${parsed.memory} t=${parsed.iterations} p=${parsed.parallelism}`
            );
            created++;
            continue;
        }

        try {
            await kc.createUser(payload);
            console.log(`[CREATED] ${email}`);
            created++;
        } catch (e) {
            console.log(`[ERROR:create] ${email} ${(e as Error).message}`);
            errors++;
        }
    }

    await mongo.close();
    console.log(
        `\n[summary] total=${total} created=${created} skippedExists=${skippedExists} skippedBadHash=${skippedBadHash} errors=${errors}`
    );
    if (errors > 0) process.exit(1);
}

main().catch(e => {
    console.error('fatal:', e);
    process.exit(1);
});
