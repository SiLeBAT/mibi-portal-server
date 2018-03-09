import * as express from 'express';
import { login } from './../controllers';

export const router = express.Router();

router.route('/')
    .post(login);
