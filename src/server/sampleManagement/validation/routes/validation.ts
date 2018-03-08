// core
// npm
import * as express from 'express';

// local
import { logger } from './../../../../aspects';
import { validateSamples } from './../controllers';

export const router = express.Router();

router.post('/', validateSamples);
