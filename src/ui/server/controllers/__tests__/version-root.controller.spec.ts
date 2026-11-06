import mockRes from 'mock-express-response';
import { AppServerConfiguration } from '../../model/server.model';
import { DefaultVersionRootController } from '../version-root.controller';

jest.mock('../../../../aspects', () => ({
    logger: {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        verbose: jest.fn()
    }
}));

function serverConfig(
    overrides: Partial<AppServerConfiguration> = {}
): AppServerConfiguration {
    return {
        port: 1,
        apiRoot: '',
        apiVersion: 'v2',
        publicAPIDoc: {},
        jwtSecret: 'test',
        logLevel: 'info',
        supportContact: 'test',
        parseAPI: '',
        appId: '',
        ...overrides
    };
}

async function getDefinition(config: AppServerConfiguration) {
    const res = new mockRes();
    await new DefaultVersionRootController(config).getAPIDefinition(res);
    return res._getJSON();
}

describe('DefaultVersionRootController', () => {
    it('documents the configured api root and version as base URL', async () => {
        const definition = await getDefinition(
            serverConfig({ apiRoot: '/api', apiVersion: 'v3' })
        );

        expect(definition.servers).toEqual([{ url: '/api/v3' }]);
    });

    it('only reveals the configured paths and operations', async () => {
        const definition = await getDefinition(
            serverConfig({
                publicAPIDoc: { '/info': ['get'], '/orders': ['get'] }
            })
        );

        expect(Object.keys(definition.paths).sort()).toEqual([
            '/info',
            '/orders'
        ]);
        expect(Object.keys(definition.paths['/orders'])).toEqual(['get']);
    });

    it('drops schemas no revealed path uses', async () => {
        const definition = await getDefinition(
            serverConfig({ publicAPIDoc: { '/info': ['get'] } })
        );

        expect(definition.components.schemas.SystemInformation).toBeDefined();
        expect(definition.components.schemas.OrderCollection).toBeUndefined();
    });

    it('keeps only the security schemes the revealed operations use', async () => {
        const definition = await getDefinition(
            serverConfig({ publicAPIDoc: { '/tokens': ['post'] } })
        );

        expect(Object.keys(definition.components.securitySchemes)).toEqual([
            'BearerAuth'
        ]);
    });

    it('does not let one configuration change the definition of another', async () => {
        await getDefinition(serverConfig({ publicAPIDoc: {} }));

        const definition = await getDefinition(
            serverConfig({ publicAPIDoc: { '/info': ['get'] } })
        );

        expect(Object.keys(definition.paths)).toEqual(['/info']);
    });
});
