import { Response, Request } from 'express';
import * as _ from 'lodash';
import { DatasetFile, DatasetPort, SenderInfo } from '../../../app/ports';
import { logger } from '../../../aspects';
import { Controller } from '../model/controler.model';
import { uploadToMemory } from '../middleware/fileUpload';

export interface DatasetController extends Controller {
    submitDataset(req: Request, res: Response): Promise<void>;
}

class DefaultDatasetController implements DatasetController {
    constructor(private datasetService: DatasetPort) {}

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

function mapResponseFileToDatasetFile(file: Express.Multer.File): DatasetFile {
    return {
        content: file.buffer,
        encoding: file.encoding,
        contentType: file.mimetype,
        filename: file.originalname,
        size: file.size
    };
}

function mapRequestDTOToSenderInfo(req: Request): SenderInfo {
    const body = req.body;
    return {
        email: body['email'],
        instituteId: body['institution'],
        comment: body['comment'] || '',
        recipient: body['recipient'] || ''
    };
}

export function createController(service: DatasetPort) {
    return new DefaultDatasetController(service);
}
