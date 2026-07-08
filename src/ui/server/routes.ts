import { Router } from 'express';
import { uploadToMemory } from './middleware/file-upload.middleware';
import { Controllers } from './server.factory';

/**
 * Builds the application router from the already-constructed controllers.
 *
 * Handlers forward to the controller methods. Express 5 forwards both
 * synchronous throws and rejected promises returned by async handlers to the
 * error middleware, so no explicit try/catch wrapper is required here.
 */
export function buildControllerRouter(controllers: Controllers): Router {
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
    router.get('/v2', (req, res) => {
        versionRoot.getAPIDefinition(res);
    });

    // System info
    router.get('/v2/info', (req, res) => {
        systemInfo.getSystemInfo(res);
    });

    // Institutes
    router.get('/v2/institutes', async (req, res) => {
        await institutes.getInstitutes(req, res);
    });

    // Client dashboard
    router.get('/v2/client-dashboard-info', async (req, res) => {
        await clientDashboard.getDashboardInfo(req, res);
    });

    // NRLs
    router.get('/v2/nrls', async (req, res) => {
        await nrls.getNRLs(req, res);
    });

    // Orders
    router.get('/v2/orders', async (req, res) => {
        await orders.getOrders(req, res);
    });
    router.post('/v2/orders/samples-with-results', async (req, res) => {
        await orders.getSamplesWithResults(req, res);
    });

    // Tokens
    router.post('/v2/tokens', (req, res) => {
        tokens.postTokens(req, res);
    });

    // Zomo plan files
    router.get('/v2/zomo-plan-file', async (req, res) => {
        await zomoPlanFiles.getZomoPlanFileInfo(req, res);
    });
    router.put('/v2/zomo-plan-file/download', async (req, res) => {
        await zomoPlanFiles.downloadZomoPlanFile(req, res);
    });

    // Samples
    router.put('/v2/samples', uploadToMemory, async (req, res) => {
        await samples.putSamples(req, res);
    });
    router.put('/v2/samples/validated', async (req, res) => {
        await samples.putValidated(req, res);
    });
    router.post('/v2/samples/submitted', async (req, res) => {
        await samples.postSubmitted(req, res);
    });

    // Users
    router.put('/v2/users/reset-password-request', async (req, res) => {
        await users.putResetPasswordRequest(req, res);
    });
    router.patch('/v2/users/reset-password/:token', async (req, res) => {
        await users.patchResetPassword(String(req.params.token), req, res);
    });
    router.post('/v2/users/login', async (req, res) => {
        await users.postLogin(req, res);
    });
    router.patch('/v2/users/verification/:token', async (req, res) => {
        await users.patchVerification(String(req.params.token), res);
    });
    router.patch('/v2/users/activation/:token', async (req, res) => {
        await users.patchActivation(String(req.params.token), res);
    });
    router.post('/v2/users/registration', (req, res) => {
        users.postRegistration(req, res);
    });
    router.patch('/v2/users/consent', async (req, res) => {
        await users.patchConsent(req, res);
    });
    router.patch('/v2/users/email-notifications', async (req, res) => {
        await users.patchEmailNotificationSettings(req, res);
    });

    // Keycloak admin
    router.get('/v2/admin/actors/pending', async (req, res) => {
        await keycloakAdmin.getPendingActors(req, res);
    });
    router.post('/v2/admin/actors/:sub/enable', async (req, res) => {
        await keycloakAdmin.postEnableActor(req, res);
    });
    router.post('/v2/admin/actors/:sub/disable', async (req, res) => {
        await keycloakAdmin.postDisableActor(req, res);
    });

    // Keycloak auth
    router.get('/v2/auth/login', async (req, res) => {
        await keycloakAuth.getLogin(req, res);
    });
    router.get('/v2/auth/callback', async (req, res) => {
        await keycloakAuth.getCallback(req, res);
    });
    router.get('/v2/auth/me', async (req, res) => {
        await keycloakAuth.getMe(req, res);
    });
    router.post('/v2/auth/logout', async (req, res) => {
        await keycloakAuth.postLogout(req, res);
    });

    return router;
}
