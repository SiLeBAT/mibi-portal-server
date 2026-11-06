import { Router } from 'express';
import defaultConfig from '../../../../config/default.json';
import openAPI from '../doc/openapi_v2.json';
import { buildControllerRouter } from '../routes';
import { Controllers } from '../server.factory';

interface RouterLayer {
    route?: { path: string; methods: Record<string, boolean> };
    handle: { stack?: RouterLayer[] };
}

const HTTP_METHODS = ['get', 'put', 'post', 'delete', 'patch'];

// Path parameters are named differently in Express (:token) and in the
// document ({reset-password-token}), so only their position is compared.
function normalise(path: string): string {
    return path.replace(/:[^/]+/g, '{}').replace(/\{[^}]+\}/g, '{}');
}

function collectRoutes(stack: RouterLayer[]): string[] {
    return stack.flatMap(layer => {
        if (layer.route) {
            const path = layer.route.path;
            return Object.keys(layer.route.methods).map(
                method => `${method.toUpperCase()} ${normalise(path)}`
            );
        }
        return layer.handle.stack ? collectRoutes(layer.handle.stack) : [];
    });
}

function servedRoutes(): string[] {
    const router: Router = buildControllerRouter(
        {} as Controllers,
        'key',
        '/v2'
    );
    return collectRoutes(router.stack as unknown as RouterLayer[]).sort();
}

function documentedRoutes(): string[] {
    const paths = openAPI.paths as Record<string, Record<string, unknown>>;
    return Object.entries(paths)
        .flatMap(([path, operations]) =>
            Object.keys(operations)
                .filter(method => HTTP_METHODS.includes(method))
                .map(method => `${method.toUpperCase()} ${normalise(path)}`)
        )
        .sort();
}

describe('openapi_v2.json', () => {
    it('documents exactly the routes the server serves', () => {
        expect(documentedRoutes()).toEqual(servedRoutes());
    });

    it('contains every operation the default configuration makes public', () => {
        const publicAPIDoc: Record<string, string[]> =
            defaultConfig.server.publicAPIDoc;
        const documented = documentedRoutes();

        for (const [path, methods] of Object.entries(publicAPIDoc)) {
            for (const method of methods) {
                expect(documented).toContain(
                    `${method.toUpperCase()} ${normalise(path)}`
                );
            }
        }
    });
});
