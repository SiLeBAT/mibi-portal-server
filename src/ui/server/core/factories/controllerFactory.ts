import { IServiceFactory } from '../../../../app/ports';

import { Controller } from '../../model/controler.model';

import {
    createController as createLoginController,
    LoginController
} from '../../controllers/login.controller';
import {
    createController as createInstitutionController,
    InstitutionController
} from '../../controllers/institution.controller';
import {
    createController as createDatasetController,
    DatasetController
} from '../../controllers/dataset.controller';
import {
    createController as createRecoveryController,
    RecoveryController
} from '../../controllers/recovery.controller';
import {
    createController as createRegistrationController,
    RegistrationController
} from '../../controllers/registration.controller';
import {
    createController as createValidationController,
    ValidationController
} from '../../controllers/validation.controller';
import {
    createController as createResetController,
    ResetController
} from '../../controllers/reset.controller';
import {
    createController as createSystemInfoController,
    SystemInfoController
} from '../../controllers/system-info.controller';
import {
    createController as createAuthorizationController,
    AuthorizationController
} from '../../controllers/authorization.controller';
export interface ControllerFactory {
    // tslint:disable-next-line
    getController(controllerName: string): any;
}

export class DefaultControllerFactory implements ControllerFactory {
    private loginController: LoginController;
    private institutionsController: InstitutionController;
    private datasetController: DatasetController;
    private recoveryController: RecoveryController;
    private registrationController: RegistrationController;
    private resetController: ResetController;
    private validationController: ValidationController;
    private systemInfoController: SystemInfoController;
    private authorizationController: AuthorizationController;

    constructor(private serviceFactory: IServiceFactory) {
        this.validationController = createValidationController(
            this.serviceFactory.getService('VALIDATION'),
            this.serviceFactory.getService('AUTOCORRECTION')
        );
        this.loginController = createLoginController(
            this.serviceFactory.getService('LOGIN')
        );
        this.institutionsController = createInstitutionController(
            this.serviceFactory.getService('INSTITUTION')
        );
        this.datasetController = createDatasetController(
            this.serviceFactory.getService('DATASET')
        );
        this.recoveryController = createRecoveryController(
            this.serviceFactory.getService('PASSWORD')
        );
        this.registrationController = createRegistrationController(
            this.serviceFactory.getService('REGISTRATION')
        );
        this.resetController = createResetController(
            this.serviceFactory.getService('PASSWORD')
        );
        this.systemInfoController = createSystemInfoController();
        this.authorizationController = createAuthorizationController();
    }

    getController(controller: string): Controller {
        switch (controller) {
            case 'LOGIN':
                return this.loginController;
            case 'INSTITUTION':
                return this.institutionsController;
            case 'DATASET':
                return this.datasetController;
            case 'RECOVERY':
                return this.recoveryController;
            case 'REGISTRATION':
                return this.registrationController;
            case 'RESET':
                return this.resetController;
            case 'VALIDATION':
                return this.validationController;
            case 'SYSTEM_INFO':
                return this.systemInfoController;
            case 'AUTHORIZATION':
                return this.authorizationController;
            default:
                throw new Error(`Unknown controller, controller=${controller}`);
        }
    }
}
