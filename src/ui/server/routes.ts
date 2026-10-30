import { Router } from 'express';
import { requireApiKey } from './middleware/api-key.middleware';
import { uploadToMemory } from './middleware/file-upload.middleware';
import { Controllers } from './server.factory';

/**
 * Builds the application router from the already-constructed controllers.
 *
 * Handlers forward to the controller methods. Express 5 forwards both
 * synchronous throws and rejected promises returned by async handlers to the
 * error middleware, so no explicit try/catch wrapper is required here.
 *
 * `resultsApiKey` guards the machine-to-machine results import; an empty value
 * makes that single route reject everything (see requireApiKey).
 */
export function buildControllerRouter(
    controllers: Controllers,
    resultsApiKey: string,
    apiVersionRoute: string
): Router {
    // Routes are declared without the version and mounted below the configured
    // one, so a version change only touches the configuration.
    const router = Router();

    const {
        versionRoot,
        systemInfo,
        institutes,
        clientDashboard,
        nrls,
        orders,
        tokens,
        zomoPlanFiles,
        samples,
        users,
        keycloakAuth,
        keycloakAdmin
    } = controllers;

    // Version root
    router.get('/', async (req, res) => {
        await versionRoot.getAPIDefinition(res);
    });

    // System info
    router.get('/info', async (req, res) => {
        await systemInfo.getSystemInfo(res);
    });

    // Institutes
    router.get('/institutes', async (req, res) => {
        await institutes.getInstitutes(req, res);
    });

    // Client dashboard
    router.get('/client-dashboard-info', async (req, res) => {
        await clientDashboard.getDashboardInfo(req, res);
    });

    // NRLs
    router.get('/nrls', async (req, res) => {
        await nrls.getNRLs(req, res);
    });

    // Orders
    router.get('/orders', async (req, res) => {
        await orders.getOrders(req, res);
    });
    router.post('/orders/samples-with-results', async (req, res) => {
        await orders.getSamplesWithResults(req, res);
    });
    // Machine-to-machine: authenticated by a shared API key rather than by a
    // user token, so the guard is mounted here on the route itself.
    router.post(
        '/orders/results',
        requireApiKey(resultsApiKey),
        async (req, res) => {
            await orders.postResults(req, res);
        }
    );
    router.delete('/orders', async (req, res) => {
        await orders.deleteOrders(req, res);
    });

    // Tokens
    router.post('/tokens', async (req, res) => {
        await tokens.postTokens(req, res);
    });

    // Zomo plan files
    router.get('/zomo-plan-file', async (req, res) => {
        await zomoPlanFiles.getZomoPlanFileInfo(req, res);
    });
    router.put('/zomo-plan-file/download', async (req, res) => {
        await zomoPlanFiles.downloadZomoPlanFile(req, res);
    });

    // Samples
    router.put('/samples', uploadToMemory, async (req, res) => {
        await samples.putSamples(req, res);
    });
    router.put('/samples/validated', async (req, res) => {
        await samples.putValidated(req, res);
    });
    router.post('/samples/submitted', async (req, res) => {
        await samples.postSubmitted(req, res);
    });

    // Users
    router.put('/users/reset-password-request', async (req, res) => {
        await users.putResetPasswordRequest(req, res);
    });
    router.patch('/users/reset-password/:token', async (req, res) => {
        await users.patchResetPassword(String(req.params.token), req, res);
    });
    router.post('/users/login', async (req, res) => {
        await users.postLogin(req, res);
    });
    router.patch('/users/verification/:token', async (req, res) => {
        await users.patchVerification(String(req.params.token), res);
    });
    router.patch('/users/activation/:token', async (req, res) => {
        await users.patchActivation(String(req.params.token), res);
    });
    router.post('/users/registration', (req, res) => {
        users.postRegistration(req, res);
    });
    router.patch('/users/consent', async (req, res) => {
        await users.patchConsent(req, res);
    });
    router.patch('/users/email-notifications', async (req, res) => {
        await users.patchEmailNotificationSettings(req, res);
    });

    // Keycloak admin
    router.get('/admin/actors/pending', async (req, res) => {
        await keycloakAdmin.getPendingActors(req, res);
    });
    router.post('/admin/actors/:sub/enable', async (req, res) => {
        await keycloakAdmin.postEnableActor(req, res);
    });
    router.post('/admin/actors/:sub/disable', async (req, res) => {
        await keycloakAdmin.postDisableActor(req, res);
    });

    // Keycloak auth
    router.get('/auth/login', async (req, res) => {
        await keycloakAuth.getLogin(req, res);
    });
    router.get('/auth/callback', async (req, res) => {
        await keycloakAuth.getCallback(req, res);
    });
    router.get('/auth/me', async (req, res) => {
        await keycloakAuth.getMe(req, res);
    });
    router.post('/auth/logout', async (req, res) => {
        await keycloakAuth.postLogout(req, res);
    });

    return Router().use(apiVersionRoute, router);
}
