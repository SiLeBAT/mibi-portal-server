import { PersistenceRepositories } from '../infrastructure/persistence/persistence.factory';
import { DefaultConfigurationService } from './core/application/configuration.service';
import { DefaultNotificationService } from './core/application/notification.service';
import {
    ApplicationConfiguration,
    ConfigurationService
} from './core/model/configuration.model';
import { NotificationService } from './core/model/notification.model';
import { DefaultActorContextService } from './authentication/application/actor-context.service';
import { DefaultInstituteService } from './authentication/application/institute.service';
import { DefaultLoginService } from './authentication/application/login.service';
import { DefaultPasswordService } from './authentication/application/password.service';
import { DefaultRegistrationService } from './authentication/application/registration.service';
import { DefaultTokenService } from './authentication/application/token.service';
import { DefaultUserService } from './authentication/application/user.service';
import { ActorContextService } from './authentication/model/actor.model';
import { InstituteService } from './authentication/model/institute.model';
import { LoginService, PasswordService } from './authentication/model/login.model';
import { RegistrationService } from './authentication/model/registration.model';
import { TokenService } from './authentication/model/token.model';
import { UserService } from './authentication/model/user.model';

export interface ApplicationServices {
    configurationService: ConfigurationService;
    notificationService: NotificationService;
    userService: UserService;
    instituteService: InstituteService;
    tokenService: TokenService;
    registrationService: RegistrationService;
    passwordService: PasswordService;
    loginService: LoginService;
    actorContextService: ActorContextService;
}

/**
 * Constructs the application services in dependency order.
 *
 * `overrides` lets callers (chiefly tests) substitute individual services;
 * downstream services are then wired with the overridden instance. This
 * replaces the former inversify container rebinding.
 */
export function createApplicationServices(
    appConfiguration: ApplicationConfiguration,
    repositories: PersistenceRepositories,
    overrides: Partial<ApplicationServices> = {}
): ApplicationServices {
    const configurationService =
        overrides.configurationService ??
        new DefaultConfigurationService(appConfiguration);

    const notificationService =
        overrides.notificationService ?? new DefaultNotificationService();

    const userService =
        overrides.userService ??
        new DefaultUserService(repositories.userRepository);

    const instituteService =
        overrides.instituteService ??
        new DefaultInstituteService(repositories.instituteRepository);

    const tokenService =
        overrides.tokenService ??
        new DefaultTokenService(
            configurationService,
            repositories.tokenRepository
        );

    const registrationService =
        overrides.registrationService ??
        new DefaultRegistrationService(
            notificationService,
            tokenService,
            configurationService,
            userService,
            instituteService,
            repositories.instituteRepository
        );

    const passwordService =
        overrides.passwordService ??
        new DefaultPasswordService(
            notificationService,
            tokenService,
            configurationService,
            userService,
            repositories.instituteRepository
        );

    const loginService =
        overrides.loginService ??
        new DefaultLoginService(
            registrationService,
            tokenService,
            configurationService,
            userService,
            repositories.instituteRepository
        );

    const actorContextService =
        overrides.actorContextService ??
        new DefaultActorContextService(repositories.actorRepository);

    return {
        configurationService,
        notificationService,
        userService,
        instituteService,
        tokenService,
        registrationService,
        passwordService,
        loginService,
        actorContextService
    };
}
