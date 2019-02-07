import {
    RegistrationService,
    PasswordService,
    createRegistrationService,
    createPasswordService,
    LoginService,
    createLoginService,
    createInstitutionService,
    InstitutionService
} from '../../authentication/application';
import {
    FormValidatorService,
    createFormValidationService,
    ICatalogService,
    createCatalogService,
    IDatasetService,
    createDatasetService,
    createFormAutoCorrectionService,
    IFormAutoCorrectionService,
    IAVVFormatProvider,
    createAVVFormatProvider,
    ValidationErrorProvider,
    createValidationErrorProvider,
    INRLSelectorProvider,
    createNRLSelectorProvider
} from '../../sampleManagement/application';
import { ApplicationSystemError } from '../errors';
import {
    INotificationService,
    createNotificationService
} from '../application';
import {
    CatalogRepository,
    NRLRepository,
    StateRepository,
    InstituteRepository,
    UserRepository,
    TokenRepository,
    ValidationErrorRepository
} from '../../ports';

interface RepositoryOptions {
    catalogRepository: CatalogRepository;
    nrlRepository: NRLRepository;
    stateRepository: StateRepository;
    institutionRepository: InstituteRepository;
    userRepository: UserRepository;
    tokenRepository: TokenRepository;
    validationErrorRepository: ValidationErrorRepository;
}
export interface IServiceFactory {
    // tslint:disable-next-line
    getService(serviceName: string): any;
}

export class ServiceFactory implements IServiceFactory {
    private loginService: LoginService;
    private institutionService: InstitutionService;
    private registrationService: RegistrationService;
    private passwordService: PasswordService;
    private notificationService: INotificationService;
    private validationService: FormValidatorService;
    private catalogService: ICatalogService;
    private datasetService: IDatasetService;
    private autoCorrectionService: IFormAutoCorrectionService;
    private avvFormatProvider: IAVVFormatProvider;
    private nrlSelectorProvider: INRLSelectorProvider;
    private validationErrorProvider: ValidationErrorProvider;

    constructor(repositories: RepositoryOptions) {
        const {
            catalogRepository,
            nrlRepository,
            stateRepository,
            institutionRepository,
            userRepository,
            tokenRepository,
            validationErrorRepository
        } = repositories;
        this.catalogService = createCatalogService(catalogRepository);
        this.nrlSelectorProvider = createNRLSelectorProvider(nrlRepository);
        this.avvFormatProvider = createAVVFormatProvider(stateRepository);
        this.validationErrorProvider = createValidationErrorProvider(
            validationErrorRepository
        );
        this.notificationService = createNotificationService();
        this.datasetService = createDatasetService(
            this.notificationService,
            institutionRepository,
            userRepository
        );
        this.institutionService = createInstitutionService(
            institutionRepository
        );
        this.registrationService = createRegistrationService(
            userRepository,
            tokenRepository,
            institutionRepository,
            this.notificationService
        );
        this.passwordService = createPasswordService(
            userRepository,
            tokenRepository,
            this.notificationService
        );
        this.loginService = createLoginService(
            userRepository,
            this.registrationService
        );
        this.autoCorrectionService = createFormAutoCorrectionService(
            this.catalogService,
            this.validationErrorProvider
        );
        this.validationService = createFormValidationService(
            this.catalogService,
            this.avvFormatProvider,
            this.validationErrorProvider,
            this.nrlSelectorProvider
        );
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
                throw new ApplicationSystemError(
                    `Unknown serviceName, serviceName=${serviceName}`
                );
        }
    }
}
