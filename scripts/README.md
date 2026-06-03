# Keycloak user migration

One-shot migration of legacy `mibi-portal-server` users from the Mongo `users`
collection into Keycloak, **preserving existing passwords** — no reset email,
no forced rotation, no second factor of friction for end users.

## Why this is possible

Legacy passwords are stored as **argon2id PHC strings** produced by `node-argon2`
in `mibi-portal-server/src/app/authentication/domain/user.entity.ts`. Keycloak
24+ has a native argon2 password hashing provider, and it stores per-credential
argon2 parameters alongside the hash. That means a legacy hash with any
`(memory, iterations, parallelism)` tuple can be POSTed to Keycloak as-is —
realm-wide password policy is irrelevant to verification.

The local dev compose pins `quay.io/keycloak/keycloak:26.5.4` (see
`keycloak/docker-compose.yml`), which is well above the v24 threshold.

### Why not a UserStorage SPI?

Federation SPI is the textbook "transparent migration" approach (legacy DB acts
as the source of truth until each user logs in for the first time, then they
get rehashed into Keycloak's store). It's a strong option, but:

- It needs a Java/Quarkus extension shipped with Keycloak — a real piece of
  infrastructure to build, deploy, and version with the realm image.
- It only migrates **active** users; the long-tail stays in legacy until the
  EOY 2026 sunset, when we'd have to drop or hand-import the rest anyway.

Given the sunset deadline and a manageable user count, the bulk Admin API
import is simpler, finite, and leaves a cleaner end state.

## Files

| File | Purpose |
|---|---|
| `migrate-users-to-keycloak.ts` | The migration script. Reads legacy Mongo `users`, converts argon2 PHC → Keycloak `secretData`/`credentialData`, POSTs via Admin API. |
| `smoke-test-keycloak-migration.ts` | End-to-end test that spins up a throwaway Mongo on :27018, seeds 6 fixtures, runs the migration, verifies via OIDC password grant, and cleans up. |
| `README.md` | This file. |

## Prerequisites

- Keycloak 24+ running with the `mibi-portal` realm imported. The dev compose
  at `keycloak/docker-compose.yml` provides this.
- Node 18+ (built-in `fetch`).
- Project deps already installed (`mongodb`, `argon2`, `ts-node` — all in
  `mibi-portal-server/package.json`).
- For the smoke test: Docker, plus port `27018` free on the host.

## Quick start: run the smoke test

The smoke test is the safest way to confirm everything works in your local
environment before touching real data.

```bash
# 1. Start the local Keycloak (if it isn't already running)
docker compose -f keycloak/docker-compose.yml up -d

# 2. From mibi-portal-server/, run the smoke test
cd mibi-portal-server
npx ts-node scripts/smoke-test-keycloak-migration.ts
```

Expected: `8/8 checks passed`, throwaway Mongo container removed, all created
Keycloak users deleted.

## Migrating real users

### Configuration

The migration script is configured via environment variables. Only `MONGO_DB`
is required; everything else has a working dev default.

| Var | Default | Notes |
|---|---|---|
| `MONGO_URI` | `mongodb://localhost:27017` | Legacy Mongo connection string. |
| `MONGO_DB` | *(required)* | Database holding the legacy `users` collection. |
| `MONGO_COLLECTION` | `users` | Collection name. |
| `KC_URL` | `http://localhost:8080` | Keycloak base URL. |
| `KC_REALM` | `mibi-portal` | Realm to import users into. |
| `KC_ADMIN_USER` | `admin` | Master-realm admin username. |
| `KC_ADMIN_PASS` | `admin` | Master-realm admin password. |

Flags:

- `--dry-run` — read and parse legacy users, but make no writes to Keycloak.
- `--limit N` — process at most N matching legacy rows. Useful for staged
  rollout (`--limit 5`, inspect, then re-run without).

### Recommended workflow

1. **Dry run a handful of users** to confirm the legacy data looks sane:

   ```bash
   MONGO_DB=mibi-portal npx ts-node scripts/migrate-users-to-keycloak.ts \
     --dry-run --limit 10
   ```

   Look for `[DRY:would-create]` lines and any `[SKIP:bad-hash]` /
   `[SKIP:incomplete]` warnings. Investigate any unexpected skips before
   continuing.

2. **Real run, limited**:

   ```bash
   MONGO_DB=mibi-portal npx ts-node scripts/migrate-users-to-keycloak.ts \
     --limit 10
   ```

   Verify a couple of the affected users can actually log in to Keycloak with
   their original password before scaling up.

3. **Full run**:

   ```bash
   MONGO_DB=mibi-portal npx ts-node scripts/migrate-users-to-keycloak.ts
   ```

The script is **idempotent**: it skips users that already exist in the realm
(matched by Keycloak username, which is set to the legacy `email`). Re-running
is safe.

## Scope filter

Only legacy users matching `{ enabled: true, adminEnabled: true }` are
migrated. Disabled accounts and accounts where the admin hasn't approved the
registration are deliberately excluded. Change the filter in
`migrate-users-to-keycloak.ts:main()` if your migration policy differs.

## What the script does per user

1. Parse the legacy `password` field as an argon2 PHC string:
   `$argon2id$v=19$m=<m>,t=<t>,p=<p>$<saltB64NoPad>$<hashB64NoPad>`.
2. Pad both base64 segments back to standard base64.
3. Build `secretData = JSON.stringify({ value: <hashB64>, salt: <saltB64> })`.
4. Build `credentialData` with per-credential argon2 params:

   ```json
   {
     "hashIterations": <t>,
     "algorithm": "argon2",
     "additionalParameters": {
       "hashLength": ["32"],
       "memory":     ["<m>"],
       "type":       ["id"],
       "version":    ["1.3"],
       "parallelism":["<p>"]
     }
   }
   ```

5. Look up the email in Keycloak (`GET /admin/realms/{realm}/users?username=…&exact=true`).
   If it returns a hit, log `[SKIP:exists]` and move on.
6. Otherwise `POST /admin/realms/{realm}/users` with:

   ```jsonc
   {
     "username": "<legacy.email>",
     "email":    "<legacy.email>",
     "firstName": "<legacy.firstName>",
     "lastName":  "<legacy.lastName>",
     "enabled": true,
     "emailVerified": true,
     "requiredActions": [],
     "credentials": [{ "type": "password", "secretData": "...", "credentialData": "..." }]
   }
   ```

## Gotchas

- **`emailVerified: true` is asserted on Keycloak's behalf.** These users have
  been authenticating with the legacy system, so we trust the email; flipping
  this to `false` would force every migrated user through a verify-email
  redirect on first login, which contradicts the no-friction goal.
- **`requiredActions: []` must be set explicitly.** Keycloak's default for new
  users is `["VERIFY_EMAIL"]`, which causes a `400 invalid_grant "Account is
  not fully set up"` at login. The script sets it to `[]` for every user.
- **`username = email`.** If a legacy user's email has changed over time, the
  email currently in the `users` row is what they'll log in with on Keycloak.
- **Token lifetime.** The Keycloak admin token from the master realm defaults
  to ~60 seconds. The script refreshes automatically, but if you watch the
  output you'll see refreshes mid-run on large migrations — that's expected.

## Verification record

The approach was validated end-to-end before being scripted:

1. Created a probe Keycloak user with a Keycloak-hashed password to read back
   the `credentialData` JSON shape (Keycloak's GET endpoint hides
   `secretData`).
2. Generated a separate legacy-style argon2id hash (m=65536, t=3, p=4) via
   `node-argon2`, POSTed it as `secretData`+`credentialData`, then
   successfully obtained an OIDC access token via password grant — proving
   Keycloak accepts and verifies pre-hashed argon2 credentials with arbitrary
   per-user parameters.
3. The smoke test now performs the same round-trip continuously, including a
   second user (Bob) deliberately hashed with non-default params (m=4096,
   t=2, p=1) to prove per-credential params are honoured.

## Activating Keycloak on the server

The server ships with the full Keycloak BFF/OIDC stack wired up but **dormant**.
A single config flag, `keycloak.enabled`, gates it:

| `keycloak.enabled` | Behaviour |
|---|---|
| `false` (default) | Server boots and runs on the **legacy JWT auth** stack only. It never contacts Keycloak at startup — no admin-client authentication, no pending-actor reminder job — so it boots fine even if no Keycloak server exists yet. The Keycloak routes (`/v2/auth/*`, `/v2/admin/actors/*`) stay registered but are inert. |
| `true` | Full Keycloak integration: admin client authenticates at boot (the server will **fail to start** if Keycloak is unreachable), reminder job runs, OIDC login flow is live. |

Set it via environment variable in deployed environments:

```bash
MIBI_KEYCLOAK_ENABLED=true
```

…or, for local development, add `"enabled": true` to the `keycloak` block in
`config/local.json` (untracked).

**Recommended cutover sequence** once the Keycloak PROD server is up:

1. Migrate users (above) and verify a few can log in directly against Keycloak.
2. Set the Keycloak connection vars (`MIBI_KEYCLOAK_ISSUER_URL`,
   `MIBI_KEYCLOAK_CLIENT_SECRET`, `MIBI_KEYCLOAK_ADMIN_CLIENT_SECRET`, …).
3. Flip `MIBI_KEYCLOAK_ENABLED=true` and restart the server.
4. Switch the frontend over to the BFF login flow (separate `mibi-portal-client`
   change — out of scope here; the legacy token flow keeps working until then).

To roll back, set `MIBI_KEYCLOAK_ENABLED=false` and restart — the legacy auth
path is untouched and remains fully functional.

## Rollback

If something goes wrong during a real run, individual users can be removed
from Keycloak by username:

```bash
KC_URL=http://localhost:8080
REALM=mibi-portal
TOKEN=$(curl -s -X POST "$KC_URL/realms/master/protocol/openid-connect/token" \
  -d 'username=admin&password=admin&grant_type=password&client_id=admin-cli' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  | python -c 'import sys,json;print(json.load(sys.stdin)["access_token"])')

ID=$(curl -s -H "Authorization: Bearer $TOKEN" \
  "$KC_URL/admin/realms/$REALM/users?username=<email>&exact=true" \
  | python -c 'import sys,json;d=json.load(sys.stdin);print(d[0]["id"] if d else "")')

curl -s -X DELETE -H "Authorization: Bearer $TOKEN" \
  "$KC_URL/admin/realms/$REALM/users/$ID"
```

The legacy `users` collection is never modified by the migration script, so
the legacy auth path remains a working fallback.
