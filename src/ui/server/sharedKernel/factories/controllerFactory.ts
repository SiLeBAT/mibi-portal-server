import { IServiceFactory, IController } from '../../../../app/ports';
import {
    ILoginController,
    createLoginController,
    IInstitutionController,
    createInstitutionController,
    createDatasetController,
    IDatasetController,
    createValidationController,
    ValidationController,
    createRecoveryController,
    IRecoveryController,
    createRegistrationController,
    IRegistrationController,
    createResetController,
    IResetController,
    ISystemInfoController,
    createSystemInfoController,
    AuthorizationController,
    createAuthorizationController
} from '../../controllers';

export interface ControllerFactory {
    // tslint:disable-next-line
    getController(controllerName: string): any;
}

export class DefaultControllerFactory implements ControllerFactory {
    private loginController: ILoginController;
    private institutionsController: IInstitutionController;
    private datasetController: IDatasetController;
    private recoveryController: IRecoveryController;
    private registrationController: IRegistrationController;
    private resetController: IResetController;
    private validationController: ValidationController;
    private systemInfoController: ISystemInfoController;
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

    getController(controller: string): IController {
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
