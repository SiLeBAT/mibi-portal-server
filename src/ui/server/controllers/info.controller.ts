import { Response } from 'express';
import { logger } from '../../../aspects';
import { SystemInfoController } from '../model/controller.model';
import { SystemInformationDTO } from '../model/response.model';
import { AbstractController } from './abstract.controller';
import { AppServerConfiguration } from '../model/server.model';
import { UnknownPackageConfigurationError } from '../model/domain.error';
import { readClientVersion } from '../client-version';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pjson = require('../../../../package.json');

export class DefaultSystemInfoController
    extends AbstractController
    implements SystemInfoController
{
    private supportContact = '';
    private keycloakEnabled = false;
    // Read once: the deploy pipeline unpacks the client bundle and only then
    // restarts the server, so the deployed version cannot change while we run.
    private clientVersion = '';
    constructor(configuration: AppServerConfiguration) {
        super();
        this.supportContact = configuration.supportContact;
        this.keycloakEnabled = configuration.keycloak?.enabled ?? false;
        this.clientVersion = readClientVersion();
    }

    getSystemInfo(res: Response) {
        logger.info(
            `${this.constructor.name}.${this.getSystemInfo.name}, Request received`
        );
        try {
            if (!(pjson.version && pjson.mibiConfig.lastChange)) {
                throw new UnknownPackageConfigurationError(
                    "Version number or date of last change can't be determined."
                );
            }
            const dto: SystemInformationDTO = {
                version: pjson.version,
                lastChange: pjson.mibiConfig.lastChange,
                supportContact: this.supportContact,
                keycloakEnabled: this.keycloakEnabled,
                clientVersion: this.clientVersion
            };
            logger.info(
                `${this.constructor.name}.${this.getSystemInfo.name}, Response sent`
            );
            this.ok(res, dto);
        } catch (error) {
            logger.info(
                `${this.constructor.name}.${this.getSystemInfo.name} has thrown an error. ${error}`
            );
            this.handleError(res);
        }
    }

    private handleError(res: Response) {
        this.fail(res, 'Unable to retrieve system information');
    }
}
