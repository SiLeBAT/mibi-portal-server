import {
    IRegistrationService,
    IPasswordService,
    createRegistrationService, createPasswordService, ILoginService, createLoginService, createInstitutionService, IInstitutionService
} from '../../authentication/application';
import {
    FormValidatorService,
    createFormValidationService,
    ICatalogService,
    createCatalogService,
    IDatasetService,
    createDatasetService, createFormAutoCorrectionService, IFormAutoCorrectionService, IAVVFormatProvider, createAVVFormatProvider, ValidationErrorProvider, createValidationErrorProvider, INRLSelectorProvider, createNRLSelectorProvider
} from '../../sampleManagement/application';
import { ApplicationSystemError } from '../errors';
import { INotificationService, createNotificationService } from '../application';
// TODO: IS this the right way to get the dependency?
import { catalogRepository, nrlRepository, stateRepository, institutionRepository, userRepository, tokenRepository, validationErrorRepository } from '../../../infrastructure';

export interface IServiceFactory {
    // tslint:disable-next-line
    getService(serviceName: string): any;
}

export class ServiceFactory implements IServiceFactory {
    private loginService: ILoginService;
    private institutionService: IInstitutionService;
    private registrationService: IRegistrationService;
    private passwordService: IPasswordService;
    private notificationService: INotificationService;
    private validationService: FormValidatorService;
    private catalogService: ICatalogService;
    private datasetService: IDatasetService;
    private autoCorrectionService: IFormAutoCorrectionService;
    private avvFormatProvider: IAVVFormatProvider;
    private nrlSelectorProvider: INRLSelectorProvider;
    private validationErrorProvider: ValidationErrorProvider;

    constructor() {

        this.catalogService = createCatalogService(catalogRepository);
        this.nrlSelectorProvider = createNRLSelectorProvider(nrlRepository);
        this.avvFormatProvider = createAVVFormatProvider(stateRepository);
        this.validationErrorProvider = createValidationErrorProvider(validationErrorRepository);
        this.notificationService = createNotificationService();
        this.datasetService = createDatasetService(this.notificationService);
        this.institutionService = createInstitutionService(institutionRepository);
        this.registrationService = createRegistrationService(userRepository, tokenRepository, institutionRepository, this.notificationService);
        this.passwordService = createPasswordService(userRepository, tokenRepository, this.notificationService);
        this.loginService = createLoginService(userRepository, this.registrationService);
        this.autoCorrectionService = createFormAutoCorrectionService(this.catalogService, this.validationErrorProvider);
        this.validationService = createFormValidationService(this.catalogService, this.avvFormatProvider, this.validationErrorProvider, this.nrlSelectorProvider);

    }

    getService(serviceName: string) {
        switch (serviceName) {
            case 'LOGIN':
                return this.loginService;
            case 'INSTITUTION':
                return this.institutionService;
            case 'REGISTRATION':
                return this.registrationService;
            case 'PASSWORD':
                return this.passwordService;
            case 'NOTIFICATION':
                return this.notificationService;
            case 'VALIDATION':
                return this.validationService;
            case 'DATASET':
                return this.datasetService;
            case 'AUTOCORRECTION':
                return this.autoCorrectionService;
            case 'AVVFORMATPROVIDER':
                return this.avvFormatProvider;
            case 'VALIDATIONERRORPROVIDER':
                return this.validationErrorProvider;
            case 'NRLSELECTORPROVIDER':
                return this.nrlSelectorProvider;
            default:
                throw new ApplicationSystemError(`Unknown serviceName, serviceName=${serviceName}`);
        }
    }
}
