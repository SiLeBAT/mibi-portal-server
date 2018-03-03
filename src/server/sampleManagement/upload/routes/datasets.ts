import * as express from 'express';
import { saveDataset } from './../controllers';

export const router = express.Router();

router.post('/', saveDataset);
