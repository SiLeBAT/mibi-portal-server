import * as express from 'express';
import { listInstitutions } from './../controllers';

export const router = express.Router();

router.route('/')
  .get(listInstitutions);
