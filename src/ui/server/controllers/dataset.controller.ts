import { Response, Request } from 'express';
import { IController, IDatasetFile, IDatasetPort } from '../../../app/ports';
import { uploadToDisk } from './../middleware';
import { logger } from '../../../aspects';
import { IValidationController } from '.';
import { uploadToMemory } from '../middleware/fileUpload';

export interface IDatasetController extends IController {
    saveDataset(req: Request, res: Response): Promise<void>;
    submitDataset(req: Request, res: Response): Promise<void>;
}

class DatasetController implements IDatasetController {

    constructor(private datasetService: IDatasetPort, private controller: IValidationController) { }
    async saveDataset(req: Request, res: Response) {
        const controller = this.controller;
        uploadToDisk(req, res, function (err: Error) {
            if (err) {
                logger.error('Unable to save Dataset', { error: err });
                return res
                    .status(500)
                    .end();
            }
            // FIXME: Temporary redirect to allow for feature parity with old version
            logger.warn('Redirecting request to different controller');
            return controller.validateSamples(req, res);
        });
    }

    async submitDataset(req: Request, res: Response) {
        const service = this.datasetService;
        uploadToMemory(req, res, function (err: Error) {
            if (err) {
                logger.error('Unable to submit Dataset', { error: err });
                return res
                    .status(500)
                    .end();
            }
            if (!req.file) {
                logger.warn(`No file uploaded.`);
                return res
                    .status(400)
                    .json({
                        error: 'No file for upload supplied.'
                    })
                    .end();
            }
            const file = mapResponseFileToDatasetFile(req.file);
            try {
                service.sendDatasetFile(file);
            } catch (err) {
                logger.error(`Unable to send dataset.`, { error: err });
                return res.status(500).json({
                    error: 'Unable to send dataset.'
                }).end();
            }
            return res.status(200).end();
        });
    }
}

function mapResponseFileToDatasetFile(file: Express.Multer.File): IDatasetFile {
    return {
        buffer: file.buffer,
        encoding: file.encoding,
        mimetype: file.mimetype,
        originalname: file.originalname,
        size: file.size
    };
}

export function createController(service: IDatasetPort, controller: IValidationController) {
    return new DatasetController(service, controller);
}
