import * as express from 'express';
import { reset } from './../controllers';

export const router = express.Router();

router.route('/:token')
    .post(reset);
