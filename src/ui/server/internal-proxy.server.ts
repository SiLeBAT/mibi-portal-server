import express from 'express';
import { logger } from '../../aspects';
import { createProxyMiddleware } from 'http-proxy-middleware';

const PORT = '3001';

const app = express();

app.use(
    '/admin/parse',
    createProxyMiddleware({
        target: 'http://127.0.0.1:1337'
    })
);

app.use(
    '/admin',
    createProxyMiddleware({
        target: 'http://127.0.0.1:4040'
    })
);

app.listen(PORT, () => {
    logger.info(`parse proxy listening on port ${PORT}`);
});
