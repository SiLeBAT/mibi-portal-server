import { isCsrfExemptPath } from '../express.setup';

describe('isCsrfExemptPath', () => {
    it('exempts the machine-to-machine results import', () => {
        expect(isCsrfExemptPath('', '/v2/orders/results')).toBe(true);
    });

    it('honours a configured api root', () => {
        expect(isCsrfExemptPath('/api', '/api/v2/orders/results')).toBe(true);
        expect(isCsrfExemptPath('/api', '/v2/orders/results')).toBe(false);
    });

    it.each([
        '/v2/orders',
        '/v2/orders/samples-with-results',
        '/v2/samples',
        '/v2/samples/submitted',
        '/v2/samples/validated',
        '/v2/users/login',
        '/v2/users/consent',
        '/v2/auth/logout',
        '/v2/tokens'
    ])('does not exempt %s', path => {
        expect(isCsrfExemptPath('', path)).toBe(false);
    });

    it('matches exactly, so the exemption cannot widen by prefix', () => {
        // A startsWith-style predicate would hand CSRF exemption to anything
        // nested under the results path.
        expect(isCsrfExemptPath('', '/v2/orders/results/extra')).toBe(false);
        expect(isCsrfExemptPath('', '/v2/orders/results2')).toBe(false);
        expect(isCsrfExemptPath('', '/v2/orders/result')).toBe(false);
    });
});
