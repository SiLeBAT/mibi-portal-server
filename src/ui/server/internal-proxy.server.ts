import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { logger } from '../../aspects';

const PORT = '3001';

const app = express();

// Wrap in a sync handler so Express sees a void-returning RequestHandler
// and any rejection surfaces through next(err).
const proxy = createProxyMiddleware({
    target: 'http://127.0.0.1:1337/admin/parse'
});

app.use('/admin/parse', (req, res, next) => {
    proxy(req, res, next).catch(next);
});

app.listen(PORT, () => {
    logger.info(`parse proxy listening on port ${PORT}`);
});
