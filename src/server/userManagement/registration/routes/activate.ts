import * as express from 'express';
import { activate } from './../controllers';

export const router = express.Router();

router.route('/:token')
    .post(activate);
