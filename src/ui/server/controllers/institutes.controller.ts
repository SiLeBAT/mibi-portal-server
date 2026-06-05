import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { Request, Response } from 'express';
import { logger } from '../../../aspects';
import { InstitutesController } from '../model/controller.model';
import { AppServerConfiguration } from '../ports';
import {
    AbstractController,
    ParseCollectionResponse,
    ParseEntityDTO
} from './abstract.controller';

interface ParseInstitutionDTO extends ParseEntityDTO {
    readonly state_short: string;
    readonly name1: string;
    readonly name2: string;
    readonly city: string;
    readonly zip: string;
    readonly phone: string;
    readonly fax: string;
    readonly email: string[];
}

export class DefaultInstituteController
    extends AbstractController
    implements InstitutesController
{
    private redirectionTarget: AxiosInstance;
    constructor(configuration: AppServerConfiguration) {
        super();

        this.redirectionTarget = axios.create({
            baseURL: configuration.parseAPI,
            headers: { 'X-Parse-Application-Id': configuration.appId }
        });
    }

    async getInstitutes(req: Request, res: Response) {
        logger.info(
            `${this.constructor.name}.${this.getInstitutes.name}, Request received`
        );

        try {
            const parseResponse = await this.redirectionTarget.get<
                ParseCollectionResponse<ParseInstitutionDTO>,
                AxiosResponse<ParseCollectionResponse<ParseInstitutionDTO>>,
                ParseInstitutionDTO
            >('classes/institutions');

            const institutes: ParseInstitutionDTO[] =
                parseResponse.data.results;

            const instituteDTOCollection = institutes.map(institution => ({
                id: institution.objectId,
                short: institution.state_short,
                name: institution.name1,
                addendum: institution.name2 || '',
                city: institution.city || '',
                zip: institution.zip || '',
                phone: institution.phone,
                fax: institution.fax || '',
                email: institution.email || []
            }));

            this.ok(res, { institutes: instituteDTOCollection });
        } catch (error) {
            logger.info(
                `${this.constructor.name}.${this.getInstitutes.name} has thrown an error. ${error}`
            );
            this.handleError(res);
        }
    }

    private handleError(res: Response) {
        this.fail(res);
    }
}
