import { getRouter as getLoginRouter } from './authentication/login';
import { getRouter as getValidationRouter } from './samples/validation';
import { getRouter as getResetRouter } from './authentication/reset';
import { getRouter as getRegisterRouter } from './authentication/registration';
import { getRouter as getJobRouter } from './samples/job';
import { getRouter as getActivateRouter } from './authentication/activation';
import { getRouter as getAdminActivateRouter } from './authentication/adminactivation';
import { getRouter as getInstitutionsRouter } from './institution';
import { getRouter as getRecoveryRouter } from './authentication/recovery';
import { getRouter as getUserRouter } from './users';
import { getRouter as getUtilRouter } from './util';
import { getRouter as getSystemInfoRouter } from './util/system-info';
import { IControllerFactory } from '../sharedKernel';

export enum RouterType {
	LOGIN,
	VALIDATE,
	REGISTER,
	RESET,
	ACTIVATE,
	INSTITUTIONS,
	RECOVERY,
	JOB,
	ADMINACTIVATE,
	USER,
	UTIL,
	SYSTEM_INFO
}

function getRouter(type: RouterType, controllerFactory: IControllerFactory) {
	switch (type) {
		case RouterType.LOGIN:
			return getLoginRouter(controllerFactory);
		case RouterType.VALIDATE:
			return getValidationRouter(controllerFactory);
		case RouterType.RESET:
			return getResetRouter(controllerFactory);
		case RouterType.REGISTER:
			return getRegisterRouter(controllerFactory);
		case RouterType.JOB:
			return getJobRouter(controllerFactory);
		case RouterType.ACTIVATE:
			return getActivateRouter(controllerFactory);
		case RouterType.ADMINACTIVATE:
			return getAdminActivateRouter(controllerFactory);
		case RouterType.INSTITUTIONS:
			return getInstitutionsRouter(controllerFactory);
		case RouterType.RECOVERY:
			return getRecoveryRouter(controllerFactory);
		case RouterType.USER:
			return getUserRouter(controllerFactory);
		case RouterType.SYSTEM_INFO:
			return getSystemInfoRouter(controllerFactory);
		case RouterType.UTIL:
			return getUtilRouter(controllerFactory);
		default:
			throw new Error(`Unknown RouterType, type=${type}`);
	}
}

export { getRouter };
