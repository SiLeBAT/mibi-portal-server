// FIXME: Only exists for backward compatibility until the REST interface is cleaned up
import * as express from 'express';
import { loginRouter, registerRouter, recoveryRouter, resetRouter, activateRouter, usersRouter } from './../../userManagement';


export const router = express.Router();

router.use('/login', loginRouter);
router.use('/register', registerRouter);
router.use('/recovery', recoveryRouter);
router.use('/reset', resetRouter);
router.use('/activate', activateRouter);
router.use('/userdata', usersRouter);