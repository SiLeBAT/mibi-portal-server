import {
    ApplicationConfiguration,
    ConfigurationService
} from '../model/configuration.model';

export class DefaultConfigurationService implements ConfigurationService {
    constructor(private appConfiguration: ApplicationConfiguration) {}

    getApplicationConfiguration(): ApplicationConfiguration {
        return this.appConfiguration;
    }
}
