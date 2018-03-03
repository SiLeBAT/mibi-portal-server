import * as express from 'express';
import { recovery } from './../controllers';

export const router = express.Router();

router.route('/')
    .post(recovery);