
import config from 'config';
import {
    AppConfiguration,
    DataStoreConfiguration,
    GeneralConfiguration,
    LoginConfiguration,
    MailConfiguration,
    ParseConnectionConfiguration,
    ServerConfiguration,
    SystemConfigurationService
} from './main.model';

class DefaultConfigurationService implements SystemConfigurationService {
    private loginConfigurationDefaults: LoginConfiguration = {
        threshold: 5,
        secondsDelay: 300
    };

    private generalConfigurationDefaults: GeneralConfiguration = {
        logLevel: 'info',
        supportContact: '',
        jwtSecret: ''
    };

    getServerConfiguration(): ServerConfiguration {
        return config.get('server');
    }

    getDataStoreConfiguration(): DataStoreConfiguration {
        return config.get('dataStore');
    }

    getParseConnectionConfiguration(): ParseConnectionConfiguration {
        return config.get('parseConnection');
    }

    getMailConfiguration(): MailConfiguration {
        return config.get('mail');
    }

    getApplicationConfiguration(): AppConfiguration {
        const appConfiguration: AppConfiguration = config.get('application');

        if (!config.has('application.jobRecipient')) {
            appConfiguration.jobRecipient = '';
        }

        if (!config.has('application.login')) {
            appConfiguration.login = {
                threshold: this.loginConfigurationDefaults.threshold,
                secondsDelay: this.loginConfigurationDefaults.secondsDelay
            };
        }

        if (!config.has('application.login.threshold')) {
            appConfiguration.login.threshold =
                this.loginConfigurationDefaults.threshold;
        }

        if (!config.has('application.login.secondsDelay')) {
            appConfiguration.login.secondsDelay =
                this.loginConfigurationDefaults.secondsDelay;
        }

        return appConfiguration;
    }

    getGeneralConfiguration(): GeneralConfiguration {
        let generalConfiguration: GeneralConfiguration = config.get('general');

        if (!config.has('general')) {
            generalConfiguration = {
                logLevel: this.generalConfigurationDefaults.logLevel,
                supportContact:
                    this.generalConfigurationDefaults.supportContact,
                jwtSecret: this.generalConfigurationDefaults.jwtSecret
            };
        }

        if (!config.has('general.logLevel')) {
            generalConfiguration.logLevel =
                this.generalConfigurationDefaults.logLevel;
        }

        return generalConfiguration;
    }
}
const configurationService = new DefaultConfigurationService();

export { configurationService };

