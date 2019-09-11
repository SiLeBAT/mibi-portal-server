/// <reference types='jest' />

import * as mockReq from 'mock-express-request';
import * as mockRes from 'mock-express-response';
import * as fs from 'fs';
import { SamplesController } from '../../model/controller.model';
import { SampleSetDTO } from '../../model/shared-dto.model';
import { Container } from 'inversify';
import { getServerContainerModule } from '../../server.module';
import {
    getApplicationContainerModule,
    FileRepository
} from '../../../../app/ports';
import { mockPersistenceContainerModule } from '../../../../infrastructure/persistence/__mocks__/persistence-mock.module';
import SERVER_TYPES from '../../server.types';
import { rebindMocks } from '../../../../__mocks__/util';
import { APPLICATION_TYPES } from '../../../../app/application.types';
import { getContainer } from '../../../../aspects/container/container';
import { addMulterSingleFileFormToMockRequest } from '../__mocks__/multer.mock';
import { promisify } from 'util';
var mps155JSON = require('../../../../../testData/mps155_timezone_bug.json');
var mps155ValidatedJSON = require('../../../../../testData/mps155_timezone_bug_validated.json');
import { PERSISTENCE_TYPES } from '../../../../infrastructure/persistence/persistence.types';
import { DefaultFileRepository } from '../../../../infrastructure/persistence/repositories/file.repository';
import * as CRC32 from 'crc-32';

// tslint:disable
describe('Sample controller', () => {
    let sampleSetDTO: SampleSetDTO;
    let controller: SamplesController;
    let container: Container;
    beforeEach(() => {
        container = getContainer();
        container.load(
            getServerContainerModule({
                port: 1,
                publicAPIDoc: {},
                jwtSecret: 'test',
                logLevel: 'info',
                supportContact: 'test'
            }),
            getApplicationContainerModule({
                appName: 'test',
                jobRecipient: 'test',
                login: {
                    threshold: 0,
                    secondsDelay: 0
                },
                apiUrl: 'test',
                supportContact: 'test',
                jwtSecret: 'test'
            }),
            mockPersistenceContainerModule
        );
        controller = container.get<SamplesController>(
            SERVER_TYPES.SamplesController
        );

        sampleSetDTO = {
            samples: [
                {
                    sampleData: {
                        sample_id: {
                            value: 'string',
                            oldValue: 'string'
                        },
                        sample_id_avv: {
                            value: 'string',
                            oldValue: 'string'
                        },
                        pathogen_adv: {
                            value: 'string',
                            oldValue: 'string'
                        },
                        pathogen_text: {
                            value: 'string',
                            oldValue: 'string'
                        },
                        sampling_date: {
                            value: 'string',
                            oldValue: 'string'
                        },
                        isolation_date: {
                            value: 'string',
                            oldValue: 'string'
                        },
                        sampling_location_adv: {
                            value: 'string',
                            oldValue: 'string'
                        },
                        sampling_location_zip: {
                            value: 'string',
                            oldValue: 'string'
                        },
                        sampling_location_text: {
                            value: 'string',
                            oldValue: 'string'
                        },
                        topic_adv: {
                            value: 'string',
                            oldValue: 'string'
                        },
                        matrix_adv: {
                            value: 'string',
                            oldValue: 'string'
                        },
                        matrix_text: {
                            value: 'string',
                            oldValue: 'string'
                        },
                        process_state_adv: {
                            value: 'string',
                            oldValue: 'string'
                        },
                        sampling_reason_adv: {
                            value: 'string',
                            oldValue: 'string'
                        },
                        sampling_reason_text: {
                            value: 'string',
                            oldValue: 'string'
                        },
                        operations_mode_adv: {
                            value: 'string',
                            oldValue: 'string'
                        },
                        operations_mode_text: {
                            value: 'string',
                            oldValue: 'string'
                        },
                        vvvo: {
                            value: 'string',
                            oldValue: 'string'
                        },
                        comment: {
                            value: 'string',
                            oldValue: 'string'
                        }
                    }
                }
            ],
            meta: {
                nrl: 'string',
                sender: {
                    instituteName: '',
                    department: '',
                    street: '',
                    zip: '',
                    city: '',
                    contactPerson: '',
                    telephone: '',
                    email: ''
                },
                urgency: 'NORMAL',
                analysis: {
                    species: false,
                    serological: false,
                    phageTyping: false,
                    resistance: false,
                    vaccination: false,
                    molecularTyping: false,
                    toxin: false,
                    zoonosenIsolate: false,
                    esblAmpCCarbapenemasen: false,
                    other: '',
                    compareHuman: false
                }
            }
        };
    });

    describe('root', () => {
        it('should respond with error if incorrect payload', function () {
            const req = new mockReq({
                method: 'PUT',
                headers: {
                    accept: 'application/json',
                    'content-type': 'application/json'
                },
                body: {
                    order: {}
                }
            });
            const res = new mockRes();
            expect.assertions(3);
            return controller.putSamples(req, res).then(success => {
                expect(res.statusCode).toBe(400);
                expect(res._getJSON().message).toEqual('Malformed request');
                expect(res._getJSON().code).toEqual(4);
            });
        });

        it('should convert excel to json', async () => {
            let req = new mockReq({
                method: 'PUT',
                headers: {
                    accept: 'application/json',
                    'content-type': 'multipart/form-data'
                }
            });
            const MPS155 = 'mps155_timezone_bug.xlsx';
            const mps155XLSX = await promisify(fs.readFile)(
                'testData/' + MPS155
            );
            req = addMulterSingleFileFormToMockRequest(
                req,
                'file',
                mps155XLSX,
                MPS155
            );

            const res = new mockRes();
            expect.assertions(2);
            await controller.putSamples(req, res);
            expect(res.statusCode).toBe(200);
            const body = res._getJSON();
            expect(body).toEqual(mps155JSON);
        });

        xit('should convert json to excel', async () => {
            container.unbind(APPLICATION_TYPES.FileRepository);
            container.bind(PERSISTENCE_TYPES.DataDir).toConstantValue('./data');
            container
                .bind<FileRepository>(APPLICATION_TYPES.FileRepository)
                .to(DefaultFileRepository);
            controller = container.get<SamplesController>(
                SERVER_TYPES.SamplesController
            );

            expect.assertions(3);

            let req = new mockReq({
                method: 'PUT',
                headers: {
                    accept: 'multipart/form-data',
                    'content-type': 'application/json'
                },
                body: mps155ValidatedJSON
            });
            let res = new mockRes();
            await controller.putSamples(req, res);

            expect(res.statusCode).toBe(200);
            const body = res._getJSON();
            expect(body).toHaveProperty('data');
            const buf = Buffer.from(body.data, 'base64');
            const mps155ValidatedXLSX = await promisify(fs.readFile)(
                'testData/mps155_timezone_bug_validated.xlsx'
            );
            expect(CRC32.buf(buf)).toEqual(CRC32.buf(mps155ValidatedXLSX));

            container.unbind(PERSISTENCE_TYPES.DataDir);
            container.unbind(APPLICATION_TYPES.FileRepository);
            container.unload(mockPersistenceContainerModule);
            container.load(mockPersistenceContainerModule);
            controller = container.get<SamplesController>(
                SERVER_TYPES.SamplesController
            );
        });

        it('should respond with Order JSON', function () {
            const req = new mockReq({
                method: 'PUT',
                headers: {
                    accept: 'application/json',
                    'content-type': 'application/json'
                },
                body: {
                    order: {
                        sampleSet: sampleSetDTO
                    }
                }
            });
            const res = new mockRes();
            expect.assertions(2);
            return controller.putSamples(req, res).then(success => {
                expect(res.statusCode).toBe(200);
                const body = res._getJSON();
                expect(body).toMatchObject({
                    order: {
                        sampleSet: {
                            samples: [
                                {
                                    sampleData: {
                                        sample_id: {
                                            value: 'string'
                                        },
                                        sample_id_avv: {
                                            value: 'string'
                                        },
                                        pathogen_adv: {
                                            value: 'string'
                                        },
                                        pathogen_text: {
                                            value: 'string'
                                        },
                                        sampling_date: {
                                            value: 'string'
                                        },
                                        isolation_date: {
                                            value: 'string'
                                        },
                                        sampling_location_adv: {
                                            value: 'string'
                                        },
                                        sampling_location_zip: {
                                            value: 'string'
                                        },
                                        sampling_location_text: {
                                            value: 'string'
                                        },
                                        topic_adv: {
                                            value: 'string'
                                        },
                                        matrix_adv: {
                                            value: 'string'
                                        },
                                        matrix_text: {
                                            value: 'string'
                                        },
                                        process_state_adv: {
                                            value: 'string'
                                        },
                                        sampling_reason_adv: {
                                            value: 'string'
                                        },
                                        sampling_reason_text: {
                                            value: 'string'
                                        },
                                        operations_mode_adv: {
                                            value: 'string'
                                        },
                                        operations_mode_text: {
                                            value: 'string'
                                        },
                                        vvvo: {
                                            value: 'string'
                                        },
                                        comment: {
                                            value: 'string'
                                        }
                                    }
                                }
                            ],
                            meta: {
                                nrl: 'Labor nicht erkannt',
                                sender: {
                                    instituteName: '',
                                    department: '',
                                    street: '',
                                    zip: '',
                                    city: '',
                                    contactPerson: '',
                                    telephone: '',
                                    email: ''
                                },
                                urgency: 'NORMAL',
                                analysis: {
                                    species: false,
                                    serological: false,
                                    phageTyping: false,
                                    resistance: false,
                                    vaccination: false,
                                    molecularTyping: false,
                                    toxin: false,
                                    zoonosenIsolate: false,
                                    esblAmpCCarbapenemasen: false,
                                    other: '',
                                    compareHuman: false
                                }
                            }
                        }
                    }
                });
            });
        });
    });
    describe('validate sample', () => {
        it('should respond with error if incorrect payload', function () {
            const req = new mockReq({
                method: 'PUT',
                headers: {
                    accept: 'application/json',
                    'content-type': 'application/json'
                },
                body: {
                    order: {}
                }
            });
            const res = new mockRes();
            expect.assertions(3);
            return controller.putValidated(req, res).then(success => {
                expect(res.statusCode).toBe(400);
                expect(res._getJSON().message).toEqual('Malformed request');
                expect(res._getJSON().code).toEqual(4);
            });
        });

        it('should respond with Order JSON', function () {
            const req = new mockReq({
                method: 'PUT',
                headers: {
                    accept: 'application/json',
                    'content-type': 'application/json'
                },
                body: {
                    order: {
                        sampleSet: {
                            samples: [
                                {
                                    sampleData: {
                                        sample_id: {
                                            value: 'string'
                                        },
                                        sample_id_avv: {
                                            value: 'string'
                                        },
                                        pathogen_adv: {
                                            value: 'string'
                                        },
                                        pathogen_text: {
                                            value: 'string'
                                        },
                                        sampling_date: {
                                            value: 'string'
                                        },
                                        isolation_date: {
                                            value: 'string'
                                        },
                                        sampling_location_adv: {
                                            value: 'string'
                                        },
                                        sampling_location_zip: {
                                            value: 'string'
                                        },
                                        sampling_location_text: {
                                            value: 'string'
                                        },
                                        topic_adv: {
                                            value: 'string'
                                        },
                                        matrix_adv: {
                                            value: 'string'
                                        },
                                        matrix_text: {
                                            value: 'string'
                                        },
                                        process_state_adv: {
                                            value: 'string'
                                        },
                                        sampling_reason_adv: {
                                            value: 'string'
                                        },
                                        sampling_reason_text: {
                                            value: 'string'
                                        },
                                        operations_mode_adv: {
                                            value: 'string'
                                        },
                                        operations_mode_text: {
                                            value: 'string'
                                        },
                                        vvvo: {
                                            value: 'string'
                                        },
                                        comment: {
                                            value: 'string'
                                        }
                                    }
                                }
                            ],
                            meta: {
                                nrl: 'string',
                                sender: {
                                    instituteName: '',
                                    department: '',
                                    street: '',
                                    zip: '',
                                    city: '',
                                    contactPerson: '',
                                    telephone: '',
                                    email: ''
                                },
                                urgency: 'NORMAL',
                                analysis: {
                                    species: false,
                                    serological: false,
                                    phageTyping: false,
                                    resistance: false,
                                    vaccination: false,
                                    molecularTyping: false,
                                    toxin: false,
                                    zoonosenIsolate: false,
                                    esblAmpCCarbapenemasen: false,
                                    other: '',
                                    compareHuman: false
                                }
                            }
                        }
                    }
                }
            });
            const res = new mockRes();
            expect.assertions(2);
            return controller.putValidated(req, res).then(success => {
                expect(res.statusCode).toBe(200);
                const body = res._getJSON();
                expect(body).toMatchObject({
                    order: {
                        sampleSet: {
                            samples: [
                                {
                                    sampleData: {
                                        sample_id: {
                                            value: 'string'
                                        },
                                        sample_id_avv: {
                                            value: 'string'
                                        },
                                        pathogen_adv: {
                                            value: 'string'
                                        },
                                        pathogen_text: {
                                            value: 'string'
                                        },
                                        sampling_date: {
                                            value: 'string'
                                        },
                                        isolation_date: {
                                            value: 'string'
                                        },
                                        sampling_location_adv: {
                                            value: 'string'
                                        },
                                        sampling_location_zip: {
                                            value: 'string'
                                        },
                                        sampling_location_text: {
                                            value: 'string'
                                        },
                                        topic_adv: {
                                            value: 'string'
                                        },
                                        matrix_adv: {
                                            value: 'string'
                                        },
                                        matrix_text: {
                                            value: 'string'
                                        },
                                        process_state_adv: {
                                            value: 'string'
                                        },
                                        sampling_reason_adv: {
                                            value: 'string'
                                        },
                                        sampling_reason_text: {
                                            value: 'string'
                                        },
                                        operations_mode_adv: {
                                            value: 'string'
                                        },
                                        operations_mode_text: {
                                            value: 'string'
                                        },
                                        vvvo: {
                                            value: 'string'
                                        },
                                        comment: {
                                            value: 'string'
                                        }
                                    },
                                    sampleMeta: {
                                        nrl: 'Labor nicht erkannt'
                                    }
                                }
                            ],
                            meta: {
                                nrl: 'Labor nicht erkannt',
                                sender: {
                                    instituteName: '',
                                    department: '',
                                    street: '',
                                    zip: '',
                                    city: '',
                                    contactPerson: '',
                                    telephone: '',
                                    email: ''
                                },
                                urgency: 'NORMAL',
                                analysis: {
                                    species: false,
                                    serological: false,
                                    phageTyping: false,
                                    resistance: false,
                                    vaccination: false,
                                    molecularTyping: false,
                                    toxin: false,
                                    zoonosenIsolate: false,
                                    esblAmpCCarbapenemasen: false,
                                    other: '',
                                    compareHuman: false
                                }
                            }
                        }
                    }
                });
            });
        });
    });
    describe('submit sample', () => {
        it('should be return a promise', () => {
            const req = new mockReq({
                body: {
                    email: 'test'
                }
            });
            const res = new mockRes();
            const result = controller.postSubmitted(req, res);
            expect(result).toBeInstanceOf(Promise);
        });
        it('should be return a 400 response', () => {
            const req = new mockReq({
                body: {
                    email: 'test'
                }
            });
            req.file = true;
            const res = new mockRes();
            expect.assertions(1);
            return controller
                .postSubmitted(req, res)
                .then(success => expect(res.statusCode).toBe(400));
        });
        it('should be return a 500 response', () => {
            const mockValidationService = {
                validateSamples: jest.fn(() => {
                    throw new Error('Error for testing');
                })
            };
            controller = rebindMocks<SamplesController>(
                container,
                SERVER_TYPES.SamplesController,
                [
                    {
                        id: APPLICATION_TYPES.FormValidatorService,
                        instance: mockValidationService
                    }
                ]
            );

            const req = new mockReq({
                body: {
                    email: 'test',
                    order: {
                        sampleSet: sampleSetDTO
                    }
                }
            });
            req.file = true;
            const res = new mockRes();
            expect.assertions(1);
            return controller
                .postSubmitted(req, res)
                .then(success => expect(res.statusCode).toBe(500));
        });
    });
});
