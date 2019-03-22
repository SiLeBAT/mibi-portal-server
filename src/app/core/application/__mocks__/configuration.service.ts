import {
    ServerConfiguration,
    ConfigurationService,
    DataStoreConfiguration,
    MailConfiguration,
    ApplicationConfiguration,
    GeneralConfiguration
} from '../../model/configuration.model';

class MockConfigurationService implements ConfigurationService {
    getServerConfiguration(): ServerConfiguration {
        return {
            port: 0,
            jwtSecret: 'secret',
            apiUrl: 'apiURL'
        };
    }

    getDataStoreConfiguration(): DataStoreConfiguration {
        return {
            connectionString: 'connetionString',
            dataDir: 'testData'
        };
    }

    getMailConfiguration(): MailConfiguration {
        return {
            fromAddress: 'test@test.com',
            replyToAddress: 'test@test.com'
        };
    }

    getApplicationConfiguration(): ApplicationConfiguration {
        return {
            login: {
                threshold: 5,
                secondsDelay: 300
            },
            appName: 'Mock',
            jobRecipient: 'test@test.com'
        };
    }

    getGeneralConfiguration(): GeneralConfiguration {
        return {
            logLevel: 'info',
            supportContact: ''
        };
    }
}

const configurationService = new MockConfigurationService();

function getConfigurationService(): ConfigurationService {
    return configurationService;
}
export { getConfigurationService };
