import { getRouter as getLoginRouter } from './authentication/login';
import { getRouter as getValidationRouter } from './samples/validation';
import { getRouter as getResetRouter } from './authentication/reset';
import { getRouter as getRegisterRouter } from './authentication/registration';
import { getRouter as getDatasetRouter } from './samples/datasets';
import { getRouter as getJobRouter } from './samples/job';
import { getRouter as getActivateRouter } from './authentication/activation';
import { getRouter as getInstitutionsRouter } from './institution';
import { getRouter as getRecoveryRouter } from './authentication/recovery';
import { IControllerFactory } from '../sharedKernel';

export enum RouterType {
    LOGIN, VALIDATE, DATASET, REGISTER, RESET, ACTIVATE, INSTITUTIONS, RECOVERY, JOB
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
        case RouterType.DATASET:
            return getDatasetRouter(controllerFactory);
        case RouterType.JOB:
            return getJobRouter(controllerFactory);
        case RouterType.ACTIVATE:
            return getActivateRouter(controllerFactory);
        case RouterType.INSTITUTIONS:
            return getInstitutionsRouter(controllerFactory);
        case RouterType.RECOVERY:
            return getRecoveryRouter(controllerFactory);
        default:
            throw new Error(`Unknown RouterType, type=${type}`);
    }
}

export {
    getRouter
};
