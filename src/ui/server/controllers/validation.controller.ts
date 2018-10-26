import * as path from 'path';
import * as fs from 'fs';
import * as moment from 'moment';
import * as _ from 'lodash';
import * as rootDir from 'app-root-dir';
import * as unirest from 'unirest';
import * as config from 'config';
import { Request, Response } from 'express';
import { logger } from '../../../aspects';
import { IFormValidatorPort, IFormAutoCorrectionPort, IController, ISampleCollection, Sample, createSample, createSampleCollection } from '../../../app/ports';
import { ApplicationSystemError } from '../../../app/sharedKernel/errors';
import { IValidationOptions } from '../../../app/sampleManagement/application';
import { CorrectionSuggestions, EditValue } from '../../../app/sampleManagement/domain';

moment.locale('de');

interface ValidationRequestMeta {
    state: string;
    nrl: string;
}

interface ValidationRequest {
    data: SampleDTO[];
    meta: ValidationRequestMeta;
}

interface ValidationResponseDTO {
    data: SampleDTO;
    errors: ErrorResponseDTO;
    corrections: CorrectionSuggestions[];
    edits: Record<string, EditValue>;
}

interface SampleDTO {
    sample_id: string;
    sample_id_avv: string;
    pathogen_adv: string;
    pathogen_text: string;
    sampling_date: string;
    isolation_date: string;
    sampling_location_adv: string;
    sampling_location_zip: string;
    sampling_location_text: string;
    topic_adv: string;
    matrix_adv: string;
    matrix_text: string;
    process_state_adv: string;
    sampling_reason_adv: string;
    sampling_reason_text: string;
    operations_mode_adv: string;
    operations_mode_text: string;
    vvvo: string;
    comment: string;
}

interface KnimeConfig {
    user: string;
    pass: string;
    urlJobId: string;
    urlResult: string;
}

interface ErrorDTO {
    code: number;
    level: number;
    message: string;
}

interface ErrorResponseDTO {
    [key: string]: ErrorDTO[];
}

const knimeConfig: KnimeConfig = config.get('knime');
const appRootDir = rootDir.get();

export interface ValidationController extends IController {
    validateSamples(req: Request, res: Response): Promise<void>;
}

class DefaultValidationController implements ValidationController {

    constructor(private formValidationService: IFormValidatorPort, private formAutoCorrectionService: IFormAutoCorrectionPort) { }

    async validateSamples(req: Request, res: Response) {

        if (req.is('application/json')) {
            try {
                const sampleCollection: ISampleCollection = this.fromDTOToSamples(req.body);
                const validationOptions: IValidationOptions = this.fromDTOToOptions(req.body.meta);
                // Auto-correction needs to happen before validation?
                const autocorrectedSamples = await this.formAutoCorrectionService.applyAutoCorrection(sampleCollection);
                const validationResult = await this.formValidationService.validateSamples(autocorrectedSamples, validationOptions);
                const validationResultsDTO = this.fromErrorsToDTO(validationResult);
                logger.info('ValidationController.validateSamples, Response sent', validationResultsDTO);
                res
                    .status(200)
                    .json(validationResultsDTO);
            } catch (err) {
                res
                    .status(500).end();
                throw err;
            }

        } else {
            const uploadedFilePath = path.join(appRootDir, req.file.path);
            this.getKnimeJobId(req, res, uploadedFilePath);
        }

        return res.end();

    }

    private fromErrorsToDTO(sampleCollection: ISampleCollection): ValidationResponseDTO[] {

        return sampleCollection.samples.map((sample: Sample) => {
            const errors: ErrorResponseDTO = {};

            _.forEach(sample.getErrors(), (e, i) => {
                errors[i] = e.map(f => ({
                    code: f.code,
                    level: f.level,
                    message: f.message
                }));
            });
            return {
                data: sample.getData(),
                errors: errors,
                corrections: sample.correctionSuggestions,
                edits: sample.edits
            };

        });
    }

    private fromDTOToSamples(dto: ValidationRequest): ISampleCollection {
        if (!Array.isArray(dto.data)) {
            throw new ApplicationSystemError(`Invalid input: Array expected, dto.data${dto.data}`);
        }
        const samples = dto.data.map(s => createSample({ ...s }));

        return createSampleCollection(samples);
    }

    private fromDTOToOptions(meta: ValidationRequestMeta): IValidationOptions {
        let nrl: string = '';

        // TODO: Should this mapping be elsewhere?
        switch (meta.nrl) {
            case 'NRL Überwachung von Bakterien in zweischaligen Weichtieren':
                nrl = 'NRL-Vibrio';
                break;

            case 'NRL Escherichia coli einschließlich verotoxinbildende E. coli':
                nrl = 'NRL-VTEC';
                break;

            case 'Bacillus spp.':
            case 'Clostridium spp. (C. difficile)':
                nrl = 'Sporenbildner';
                break;
            case 'NRL koagulasepositive Staphylokokken einschließlich Staphylococcus aureus':
                nrl = 'NRL-Staph';
                break;

            case 'NRL Salmonellen(Durchführung von Analysen und Tests auf Zoonosen)':
                nrl = 'NRL-Salm';
                break;
            case 'NRL Listeria monocytogenes':
                nrl = 'NRL-Listeria';
                break;
            case 'NRL Campylobacter':
                nrl = 'NRL-Campy';
                break;
            case 'NRL Antibiotikaresistenz':
                nrl = 'NRL-AR';
                break;
            case 'Yersinia':
                nrl = 'KL-Yersinia';
                break;
            default:

        }
        return {
            state: meta.state,
            nrl
        };
    }

    private getKnimeJobId(req: Request, res: Response, filePath: string) {
        logger.info('ValidationController.getKnimeJobId, Retrieving Knime Job ID.');

        const urlJobId = knimeConfig.urlJobId;
        const user = knimeConfig.user;
        const pass = knimeConfig.pass;

        unirest
            .post(urlJobId)
            .auth({
                user: user,
                pass: pass
            })
            // tslint:disable-next-line
            .end((response: any) => {
                if (response.error) {
                    logger.error('knime id error: ', response.error);

                    return res
                        .status(400)
                        .json({
                            title: 'knime id error',
                            obj: response.error
                        });
                }

                const jobId = response.body['id'];
                this.doKnimeValidation(req, res, jobId, filePath);
            });

    }

    private doKnimeValidation(req: Request, res: Response, jobId: string, filePath: string) {

        const urlResult = knimeConfig.urlResult + jobId;
        const user = knimeConfig.user;
        const pass = knimeConfig.pass;

        unirest
            .post(urlResult)
            .headers({
                'content-type': 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW'
            })
            .auth({
                user: user,
                pass: pass
            })
            .attach({
                'file-upload-210': fs.createReadStream(filePath)
            })
            // tslint:disable-next-line
            .end((response: any) => {
                if (response.error) {
                    logger.error('knime validation error: ', response.error);

                    return res
                        .status(400)
                        .json({
                            title: 'knime validation error',
                            obj: response.error
                        });
                }

                return res
                    .status(200)
                    .json({
                        title: 'file upload and knime validation ok',
                        obj: response.raw_body
                    });
            });
    }

}

export function createController(validationService: IFormValidatorPort, autocorrectionService: IFormAutoCorrectionPort) {
    return new DefaultValidationController(validationService, autocorrectionService);
}
