import * as express from 'express';
import * as controller from './../../controllers/institutions';

export const router = express.Router();

router.route('/')
  .get(controller.list);
