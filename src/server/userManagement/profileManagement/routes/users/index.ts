// TODO Refactor this route
import * as express from 'express';
import { router as userdata } from './userdata';

export const router = express.Router();
router.use('/', userdata);
