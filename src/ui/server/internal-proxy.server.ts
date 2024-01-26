import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { logger } from '../../aspects';

const PORT = '3001';

const app = express();

app.use(
    '/admin/parse',
    createProxyMiddleware({
        target: 'http://127.0.0.1:1337'
    })
);

app.listen(PORT, () => {
    logger.info(`parse proxy listening on port ${PORT}`);
});
