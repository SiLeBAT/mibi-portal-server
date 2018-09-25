import { ILoginService, createService as createLoginService } from './../../../app/authentication/application/login.service';
import { createService as createInstitutionService, IInstitutionService } from './../../../app/authentication/application/institution.service';
import { RepositoryType, IRepositoryFactory } from './repositoryFactory';
import { IRegistrationService, IPasswordService, createRegistrationService, createPasswordService } from '../../authentication/application';
import { IFormValidatorService, createFormValidationService, ICatalogService, createCatalogService, IDatasetService, createDatasetService } from '../../sampleManagement/application';
import { ApplicationSystemError } from '../errors';
import { INotificationService, createNotificationService } from '../application';

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
    private validationService: IFormValidatorService;
    private catalogService: ICatalogService;
    private datasetService: IDatasetService;

    constructor(private repositoryFactory: IRepositoryFactory) {
        const userRepository = this.repositoryFactory.getRepository(RepositoryType.USER);
        const institutionRepository = this.repositoryFactory.getRepository(RepositoryType.INSTITUTION);
        const tokenRepository = this.repositoryFactory.getRepository(RepositoryType.TOKEN);
        const catalogRepository = this.repositoryFactory.getRepository(RepositoryType.CATALOG);

        this.catalogService = createCatalogService(catalogRepository);
        this.notificationService = createNotificationService();
        this.datasetService = createDatasetService(this.notificationService);
        this.institutionService = createInstitutionService(institutionRepository);
        this.registrationService = createRegistrationService(userRepository, tokenRepository, institutionRepository, this.notificationService);
        this.passwordService = createPasswordService(userRepository, tokenRepository, this.notificationService);
        this.loginService = createLoginService(userRepository, this.registrationService);
        this.validationService = createFormValidationService(this.catalogService);

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
            default:
                throw new ApplicationSystemError(`Unknown serviceName, serviceName=${serviceName}`);
        }
    }
}
