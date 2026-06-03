/**
 * End-to-end smoke test for migrate-users-to-keycloak.ts.
 *
 * Spins up a throwaway Mongo container, seeds varied fixture users,
 * runs the migration script as a subprocess, then verifies each
 * created user can authenticate via OIDC password grant.
 *
 * Cleans up the Mongo container and all created Keycloak users at the end
 * (including on failure / Ctrl-C).
 *
 * Requires: a running Keycloak instance with the mibi-portal realm
 * (the dev compose stack at keycloak/docker-compose.yml is fine).
 *
 * Run from the main checkout (needs node_modules):
 *   npx ts-node scripts/smoke-test-keycloak-migration.ts
 */

import { spawn } from 'child_process';
import { MongoClient } from 'mongodb';
import * as argon2 from 'argon2';
import * as path from 'path';

const MONGO_CONTAINER = 'mibi-kc-migration-smoke-mongo';
const MONGO_PORT = 27018;
const MONGO_URI = `mongodb://localhost:${MONGO_PORT}`;
const MONGO_DB = 'mibi-smoke';
const MONGO_COLLECTION = 'users';

const KC_URL = process.env.KC_URL ?? 'http://localhost:8080';
const KC_REALM = process.env.KC_REALM ?? 'mibi-portal';
const KC_ADMIN_USER = process.env.KC_ADMIN_USER ?? 'admin';
const KC_ADMIN_PASS = process.env.KC_ADMIN_PASS ?? 'admin';

type Fixture = {
    label: string;
    email?: string;
    firstName: string;
    lastName: string;
    password?: string;
    plain?: string;
    enabled: boolean;
    adminEnabled: boolean;
    expect:
        | { kind: 'created'; loginOk: true }
        | { kind: 'skip-filtered' } // filtered out by Mongo query, never seen by script
        | { kind: 'skip-bad-hash' }
        | { kind: 'skip-incomplete' };
};

const ALICE_PASS = 'AliceP@ss123!';
const BOB_PASS = 'BobSecret_99';

async function buildFixtures(): Promise<Fixture[]> {
    // Alice: legacy-default argon2id params (m=65536, t=3, p=4)
    const aliceHash = await argon2.hash(ALICE_PASS, {
        type: argon2.argon2id,
        memoryCost: 65536,
        timeCost: 3,
        parallelism: 4,
        hashLength: 32,
        version: 0x13
    });
    // Bob: deliberately non-default params to prove per-credential params work
    const bobHash = await argon2.hash(BOB_PASS, {
        type: argon2.argon2id,
        memoryCost: 4096,
        timeCost: 2,
        parallelism: 1,
        hashLength: 32,
        version: 0x13
    });

    return [
        {
            label: 'alice (happy path, default params)',
            email: 'alice@example.test',
            firstName: 'Alice',
            lastName: 'A',
            password: aliceHash,
            plain: ALICE_PASS,
            enabled: true,
            adminEnabled: true,
            expect: { kind: 'created', loginOk: true }
        },
        {
            label: 'bob (happy path, non-default params)',
            email: 'bob@example.test',
            firstName: 'Bob',
            lastName: 'B',
            password: bobHash,
            plain: BOB_PASS,
            enabled: true,
            adminEnabled: true,
            expect: { kind: 'created', loginOk: true }
        },
        {
            label: 'carol (enabled=false, should be filtered at Mongo)',
            email: 'carol@example.test',
            firstName: 'Carol',
            lastName: 'C',
            password: aliceHash,
            enabled: false,
            adminEnabled: true,
            expect: { kind: 'skip-filtered' }
        },
        {
            label: 'dave (adminEnabled=false, should be filtered at Mongo)',
            email: 'dave@example.test',
            firstName: 'Dave',
            lastName: 'D',
            password: aliceHash,
            enabled: true,
            adminEnabled: false,
            expect: { kind: 'skip-filtered' }
        },
        {
            label: 'eve (not an argon2 hash, should skip-bad-hash)',
            email: 'eve@example.test',
            firstName: 'Eve',
            lastName: 'E',
            password: 'not-a-real-hash',
            enabled: true,
            adminEnabled: true,
            expect: { kind: 'skip-bad-hash' }
        },
        {
            label: 'frank (missing email, should skip-incomplete)',
            firstName: 'Frank',
            lastName: 'F',
            password: aliceHash,
            enabled: true,
            adminEnabled: true,
            expect: { kind: 'skip-incomplete' }
        }
    ];
}

async function sh(
    cmd: string,
    args: string[],
    opts: { env?: NodeJS.ProcessEnv } = {}
): Promise<{ code: number; stdout: string; stderr: string }> {
    return new Promise(resolve => {
        const child = spawn(cmd, args, {
            shell: true,
            env: { ...process.env, ...(opts.env ?? {}) }
        });
        let stdout = '';
        let stderr = '';
        child.stdout.on('data', d => (stdout += d.toString()));
        child.stderr.on('data', d => (stderr += d.toString()));
        child.on('close', code => {
            resolve({ code: code ?? -1, stdout, stderr });
        });
    });
}

async function startMongo(): Promise<void> {
    console.log(`[setup] starting throwaway Mongo container on :${MONGO_PORT}`);
    await sh('docker', ['rm', '-f', MONGO_CONTAINER]); // best-effort cleanup
    const r = await sh('docker', [
        'run',
        '-d',
        '--rm',
        '--name',
        MONGO_CONTAINER,
        '-p',
        `${MONGO_PORT}:27017`,
        'mongo:6'
    ]);
    if (r.code !== 0) throw new Error(`docker run failed: ${r.stderr}`);
    // Wait for Mongo to accept connections
    for (let i = 0; i < 30; i++) {
        try {
            const c = new MongoClient(MONGO_URI, {
                serverSelectionTimeoutMS: 1000
            });
            await c.connect();
            await c.close();
            console.log('[setup] mongo ready');
            return;
        } catch {
            await new Promise(r => setTimeout(r, 1000));
        }
    }
    throw new Error('mongo did not become ready in 30s');
}

async function stopMongo(): Promise<void> {
    console.log('[teardown] stopping mongo container');
    await sh('docker', ['rm', '-f', MONGO_CONTAINER]);
}

async function seedFixtures(fixtures: Fixture[]): Promise<void> {
    console.log(`[setup] seeding ${fixtures.length} fixture users`);
    const client = new MongoClient(MONGO_URI);
    await client.connect();
    await client
        .db(MONGO_DB)
        .collection(MONGO_COLLECTION)
        .insertMany(
            fixtures.map(f => ({
                email: f.email,
                firstName: f.firstName,
                lastName: f.lastName,
                password: f.password,
                enabled: f.enabled,
                adminEnabled: f.adminEnabled
            }))
        );
    await client.close();
}

async function runMigrationScript(): Promise<string> {
    const scriptPath = path.resolve(__dirname, 'migrate-users-to-keycloak.ts');
    console.log(`[run] ${scriptPath}`);
    const r = await sh('npx', ['ts-node', scriptPath], {
        env: {
            MONGO_URI,
            MONGO_DB,
            MONGO_COLLECTION,
            KC_URL,
            KC_REALM,
            KC_ADMIN_USER,
            KC_ADMIN_PASS
        }
    });
    console.log('[run] script stdout:\n' + r.stdout);
    if (r.stderr) console.log('[run] script stderr:\n' + r.stderr);
    if (r.code !== 0) throw new Error(`migration script exited ${r.code}`);
    return r.stdout;
}

async function getAdminToken(): Promise<string> {
    const res = await fetch(
        `${KC_URL}/realms/master/protocol/openid-connect/token`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                username: KC_ADMIN_USER,
                password: KC_ADMIN_PASS,
                grant_type: 'password',
                client_id: 'admin-cli'
            })
        }
    );
    if (!res.ok) throw new Error(`admin token failed: ${res.status}`);
    const j = (await res.json()) as { access_token: string };
    return j.access_token;
}

async function loginWithPasswordGrant(
    username: string,
    password: string
): Promise<boolean> {
    const res = await fetch(
        `${KC_URL}/realms/${KC_REALM}/protocol/openid-connect/token`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                username,
                password,
                grant_type: 'password',
                client_id: 'admin-cli'
            })
        }
    );
    return res.status === 200;
}

async function deleteUserByUsername(
    token: string,
    username: string
): Promise<void> {
    const url = new URL(`${KC_URL}/admin/realms/${KC_REALM}/users`);
    url.searchParams.set('username', username);
    url.searchParams.set('exact', 'true');
    const found = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
    });
    const arr = (await found.json()) as { id: string }[];
    if (!arr[0]) return;
    await fetch(`${KC_URL}/admin/realms/${KC_REALM}/users/${arr[0].id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
    });
}

type Check = { name: string; ok: boolean; detail?: string };

function assertScriptOutput(stdout: string, fixtures: Fixture[]): Check[] {
    const checks: Check[] = [];
    for (const f of fixtures) {
        const id = f.email ?? '<no-email>';
        if (f.expect.kind === 'created') {
            checks.push({
                name: `${f.label}: stdout has [CREATED] ${id}`,
                ok: stdout.includes(`[CREATED] ${id}`)
            });
        } else if (f.expect.kind === 'skip-bad-hash') {
            checks.push({
                name: `${f.label}: stdout has [SKIP:bad-hash] ${id}`,
                ok: stdout.includes(`[SKIP:bad-hash] ${id}`)
            });
        } else if (f.expect.kind === 'skip-incomplete') {
            checks.push({
                name: `${f.label}: stdout has [SKIP:incomplete] <no-email>`,
                ok: stdout.includes('[SKIP:incomplete] <no-email>')
            });
        } else if (f.expect.kind === 'skip-filtered') {
            checks.push({
                name: `${f.label}: not present in script output at all`,
                ok: !!f.email && !stdout.includes(f.email)
            });
        }
    }
    return checks;
}

async function assertLogins(fixtures: Fixture[]): Promise<Check[]> {
    const checks: Check[] = [];
    for (const f of fixtures) {
        if (f.expect.kind !== 'created' || !f.email || !f.plain) continue;
        const ok = await loginWithPasswordGrant(f.email, f.plain);
        checks.push({
            name: `${f.label}: OIDC password grant succeeds`,
            ok,
            detail: ok ? undefined : 'login returned non-200'
        });
    }
    return checks;
}

async function main(): Promise<void> {
    const fixtures = await buildFixtures();
    const createdEmails = fixtures
        .filter(f => f.expect.kind === 'created' && f.email)
        .map(f => f.email!);

    let mongoStarted = false;
    let exitCode = 0;
    try {
        await startMongo();
        mongoStarted = true;
        await seedFixtures(fixtures);
        const stdout = await runMigrationScript();

        const outputChecks = assertScriptOutput(stdout, fixtures);
        const loginChecks = await assertLogins(fixtures);
        const allChecks = [...outputChecks, ...loginChecks];

        console.log('\n[results]');
        for (const c of allChecks) {
            console.log(
                `  ${c.ok ? 'PASS' : 'FAIL'} — ${c.name}` +
                    (c.detail ? ` (${c.detail})` : '')
            );
        }
        const fails = allChecks.filter(c => !c.ok);
        console.log(
            `\n[summary] ${allChecks.length - fails.length}/${allChecks.length} checks passed`
        );
        if (fails.length > 0) exitCode = 1;
    } catch (e) {
        console.error('\n[fatal]', e);
        exitCode = 1;
    } finally {
        try {
            const token = await getAdminToken();
            for (const email of createdEmails) {
                await deleteUserByUsername(token, email);
                console.log(`[teardown] deleted kc user ${email}`);
            }
        } catch (e) {
            console.error('[teardown] could not delete kc users:', e);
        }
        if (mongoStarted) await stopMongo();
    }
    process.exit(exitCode);
}

process.on('SIGINT', () => {
    console.log('\n[signal] SIGINT — cleaning up');
    sh('docker', ['rm', '-f', MONGO_CONTAINER]).finally(() => process.exit(130));
});

main();
