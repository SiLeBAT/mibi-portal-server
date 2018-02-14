import * as express from 'express';
import { router as knime } from './knime';
import { router as upload } from './upload';
import { router as institutions } from './institutions';

export const router = express.Router();

router.use('/knime', knime);
router.use('/upload', upload);
router.use('/institutions', institutions);
