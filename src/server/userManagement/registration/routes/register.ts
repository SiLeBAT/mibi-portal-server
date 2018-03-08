import * as express from 'express';
import { register } from './../controllers';

export const router = express.Router();

router.route('/')
    .post(register);
