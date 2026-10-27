import { Response } from 'express';
import moment from 'moment';
import { SystemInfoController } from '../model/controller.model';
import { SystemInformationDTO } from '../model/response.model';
import { AbstractController } from './abstract.controller';
import { AppServerConfiguration } from '../model/server.model';
import { UnknownPackageConfigurationError } from '../model/domain.error';
import { readClientVersion } from '../client-version';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pjson = require('../../../../package.json');

// package.json keeps the date of last change as "2019-04-16 11:25:17 +0200".
// It is sent as ISO 8601 in UTC, the date-time format the API documents.
const LAST_CHANGE_FORMATS = [moment.ISO_8601, 'YYYY-MM-DD HH:mm:ss ZZ'];

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

    async getSystemInfo(res: Response) {
        await this.handleRequest(res, this.getSystemInfo.name, () => {
            if (!(pjson.version && pjson.mibiConfig.lastChange)) {
                throw new UnknownPackageConfigurationError(
                    "Version number or date of last change can't be determined."
                );
            }
            const lastChange = moment(
                pjson.mibiConfig.lastChange,
                LAST_CHANGE_FORMATS,
                true
            );
            if (!lastChange.isValid()) {
                throw new UnknownPackageConfigurationError(
                    `Unreadable date of last change: ${pjson.mibiConfig.lastChange}`
                );
            }
            const dto: SystemInformationDTO = {
                version: pjson.version,
                lastChange: lastChange.toISOString(),
                supportContact: this.supportContact,
                keycloakEnabled: this.keycloakEnabled,
                clientVersion: this.clientVersion
            };
            this.ok(res, dto);
        });
    }

    protected handleError(res: Response) {
        this.fail(res, 'Unable to retrieve system information');
    }
}
