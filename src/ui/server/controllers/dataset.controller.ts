import { Response, Request } from 'express';
import * as _ from 'lodash';
import {
    IController,
    IDatasetFile,
    IDatasetPort,
    ISenderInfo
} from '../../../app/ports';
import { logger } from '../../../aspects';
import { uploadToMemory } from '../middleware';

export interface IDatasetController extends IController {
    submitDataset(req: Request, res: Response): Promise<void>;
}

class DatasetController implements IDatasetController {
    constructor(private datasetService: IDatasetPort) {}

    async submitDataset(req: Request, res: Response) {
        const service = this.datasetService;

        uploadToMemory(req, res, function(err: Error) {
            if (err) {
                logger.error(`Unable to submit Dataset. error=${err}`);
                return res.status(500).end();
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
            if (!_.has(req.body, 'email')) {
                logger.warn(`No sender data uploaded.`);
                return res
                    .status(400)
                    .json({
                        error: 'No sender data supplied.'
                    })
                    .end();
            }

            const file = mapResponseFileToDatasetFile(req.file);
            const senderInfo = mapRequestDTOToSenderInfo(req);

            try {
                service.sendDatasetFile(file, senderInfo);
            } catch (err) {
                logger.error(`Unable to send dataset. error=${err}`);
                return res
                    .status(500)
                    .json({
                        error: 'Unable to send dataset.'
                    })
                    .end();
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

function mapRequestDTOToSenderInfo(req: Request): ISenderInfo {
    const body = req.body;
    return {
        email: body['email'],
        instituteId: body['institution'],
        comment: body['comment'] || '',
        recipient: body['recipient'] || ''
    };
}

export function createController(service: IDatasetPort) {
    return new DatasetController(service);
}
