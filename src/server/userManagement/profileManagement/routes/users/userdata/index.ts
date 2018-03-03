// TODO Refactor this route
import * as express from 'express';
import {
    addUserdata,
    updateUserdata,
    deleteUserdata
} from './../../../controllers';

export const router = express.Router();

router.route('/:id')
    .delete(deleteUserdata)
    .put(updateUserdata);

router.route('/')
    .post(addUserdata);
