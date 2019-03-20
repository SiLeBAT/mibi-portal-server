import {
    LoginService,
    PasswordService
} from '../../authentication/model/login.model';
import { RegistrationService } from '../../authentication/model/registration.model';
import {
    FormValidatorService,
    AVVFormatProvider,
    NRLSelectorProvider,
    ValidationErrorProvider
} from '../../sampleManagement/model/validation.model';
import { CatalogService } from '../../sampleManagement/model/catalog.model';
import { DatasetService } from '../../sampleManagement/model/sample.model';
import { FormAutoCorrectionService } from '../../sampleManagement/model/autocorrection.model';
import { getNotificationService } from '../application/notification.service';
import { InstituteService } from './../../authentication/model/institute.model';
import { createService as createInstitutionService } from './../../authentication/application/institute.service';
import { createService as createCatalogService } from './../../sampleManagement/application/catalog.service';
import { createService as createNRLSelectorProvider } from './../../sampleManagement/application/nrl-selector-provider.service';
import { createService as createAVVFormatProvider } from './../../sampleManagement/application/avv-format-provider.service';
import { createService as createDatasetService } from './../../sampleManagement/application/dataset.service';
import { createService as createRegistrationService } from './../../authentication/application/registration.service';
import { createService as createValidationErrorProvider } from './../../sampleManagement/application/validation-error-provider.service';
import { createService as createLoginService } from './../../authentication/application/login.service';
import { createService as createFormValidationService } from './../../sampleManagement/application/form-validation.service';
import { createService as createPasswordService } from './../../authentication/application/password.service';
import { createService as createFormAutoCorrectionService } from './../../sampleManagement/application/form-auto-correction.service';
import { ApplicationSystemError } from '../domain/technical.error';
import {
    CatalogRepository,
    NRLRepository,
    StateRepository,
    InstituteRepository,
    UserRepository,
    TokenRepository,
    ValidationErrorRepository,
    SearchAliasRepository
} from '../../ports';

interface RepositoryOptions {
    catalogRepository: CatalogRepository;
    nrlRepository: NRLRepository;
    stateRepository: StateRepository;
    institutionRepository: InstituteRepository;
    userRepository: UserRepository;
    tokenRepository: TokenRepository;
    validationErrorRepository: ValidationErrorRepository;
    searchAliasRepository: SearchAliasRepository;
}

export interface ServiceFactory {
    // tslint:disable-next-line:no-any
    getService(serviceName: string): any;
}

class DefaultServiceFactory implements ServiceFactory {
    private loginService: LoginService;
    private institutionService: InstituteService;
    private registrationService: RegistrationService;
    private passwordService: PasswordService;
    private validationService: FormValidatorService;
    private catalogService: CatalogService;
    private datasetService: DatasetService;
    private autoCorrectionService: FormAutoCorrectionService;
    private avvFormatProvider: AVVFormatProvider;
    private nrlSelectorProvider: NRLSelectorProvider;
    private validationErrorProvider: ValidationErrorProvider;

    constructor(repositories: RepositoryOptions) {
        const {
            catalogRepository,
            nrlRepository,
            stateRepository,
            institutionRepository,
            userRepository,
            tokenRepository,
            validationErrorRepository,
            searchAliasRepository
        } = repositories;
        this.catalogService = createCatalogService(
            catalogRepository,
            searchAliasRepository
        );
        this.nrlSelectorProvider = createNRLSelectorProvider(nrlRepository);
        this.avvFormatProvider = createAVVFormatProvider(stateRepository);
        this.validationErrorProvider = createValidationErrorProvider(
            validationErrorRepository
        );
        this.datasetService = createDatasetService(
            getNotificationService(),
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
            getNotificationService()
        );
        this.passwordService = createPasswordService(
            userRepository,
            tokenRepository,
            getNotificationService()
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

function createFactory(config: RepositoryOptions): ServiceFactory {
    return new DefaultServiceFactory(config);
}

export { createFactory };
