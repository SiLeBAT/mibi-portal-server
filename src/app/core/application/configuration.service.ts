// npm
import { inject, injectable } from 'inversify';
import 'reflect-metadata';
import {
    ApplicationConfiguration,
    ConfigurationService
} from '../model/configuration.model';
import { APPLICATION_TYPES } from './../../application.types';

@injectable()
export class DefaultConfigurationService implements ConfigurationService {
    constructor(
        @inject(APPLICATION_TYPES.ApplicationConfiguration)
        private appConfiguration: ApplicationConfiguration
    ) {}

    getApplicationConfiguration(): ApplicationConfiguration {
        return this.appConfiguration;
    }
}
