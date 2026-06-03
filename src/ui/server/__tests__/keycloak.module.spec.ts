import 'reflect-metadata';

// The real admin-client is shipped as ESM and is not transformed by jest; it is
// irrelevant to the disabled stub, so mock it out to keep the module loadable.
jest.mock('@keycloak/keycloak-admin-client', () => ({ default: jest.fn() }));

import { buildDisabledAdminClient } from '../keycloak.module';

describe('buildDisabledAdminClient', () => {
    it('constructs synchronously without contacting Keycloak', () => {
        // No await, no network: this is what lets the server boot in
        // legacy-auth-only mode (keycloak.enabled=false).
        expect(() => buildDisabledAdminClient()).not.toThrow();
    });

    it('rejects every port call with a clear disabled-integration error', async () => {
        // The disabled stub ignores its arguments, so cast away the precise port
        // signatures here — the contract under test is "every call rejects".
        const client = buildDisabledAdminClient() as {
            users: Record<string, (...a: unknown[]) => Promise<unknown>>;
            groups: Record<string, (...a: unknown[]) => Promise<unknown>>;
            roles: Record<string, (...a: unknown[]) => Promise<unknown>>;
        };
        const calls = [
            client.users.create({}),
            client.users.update({}, {}),
            client.users.addToGroup({}),
            client.users.executeActionsEmail({}),
            client.users.find({}),
            client.groups.find({}),
            client.groups.create({}),
            client.roles.findUsersWithRole({})
        ];

        for (const call of calls) {
            await expect(call).rejects.toThrow(
                'Keycloak integration is disabled'
            );
        }
    });
});
