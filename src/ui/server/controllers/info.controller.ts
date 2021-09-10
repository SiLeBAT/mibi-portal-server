import { Response } from 'express';
import { logger } from '../../../aspects';
import { SystemInfoController } from '../model/controller.model';
import { SystemInformationDTO } from '../model/response.model';
import { AbstractController } from './abstract.controller';
import { controller, httpGet, response } from 'inversify-express-utils';
import { inject } from 'inversify';
import { API_ROUTE } from '../model/enums';
import { SERVER_TYPES } from '../server.types';
import { AppServerConfiguration } from '../model/server.model';
import { UnknownPackageConfigurationError } from '../model/domain.error';
const pjson = require('../../../../package.json');

enum INFO_ROUTE {
    ROOT = '/info'
}
@controller(API_ROUTE.V2 + INFO_ROUTE.ROOT)
export class DefaultSystemInfoController
    extends AbstractController
    implements SystemInfoController
{
    private supportContact = '';
    constructor(
        @inject(SERVER_TYPES.AppServerConfiguration)
        configuration: AppServerConfiguration
    ) {
        super();
        this.supportContact = configuration.supportContact;
    }

    @httpGet('/')
    getSystemInfo(@response() res: Response) {
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
                supportContact: this.supportContact
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
