/// <reference types='jest' />

var mockReq = require('mock-express-request');
var mockRes = require('mock-express-response');
import { Container } from 'inversify';
import { rebindMocks } from '../../../../__mocks__/util';
import { APPLICATION_TYPES } from '../../../../app/application.types';
import { getApplicationContainerModule } from '../../../../app/ports';
import { createContainer } from '../../../../aspects/container/container';
import { mockPersistenceContainerModule } from '../../../../infrastructure/persistence/__mocks__/persistence-mock.module';
import { SamplesController } from '../../model/controller.model';
import { SampleSetDTO } from '../../model/shared-dto.model';
import { getServerContainerModule } from '../../server.module';
import { SERVER_TYPES } from '../../server.types';

// tslint:disable
describe('Sample controller', () => {
    let sampleSetDTO: SampleSetDTO;
    let controller: SamplesController;
    let container: Container;
    beforeEach(() => {
        container = createContainer();
        container.load(
            getServerContainerModule({
                port: 1,
                apiRoot: '',
                publicAPIDoc: {},
                jwtSecret: 'test',
                logLevel: 'info',
                supportContact: 'test',
                parseAPI: '',
                appId: ''
            }),
            getApplicationContainerModule({
                appName: 'test',
                jobRecipient: 'test',
                login: {
                    threshold: 0,
                    secondsDelay: 0
                },
                clientUrl: 'test',
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
                        partial_sample_id: {
                            value: 'string',
                            oldValue: 'string'
                        },
                        pathogen_avv: {
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
                        sampling_location_avv: {
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
                        animal_avv: {
                            value: 'string',
                            oldValue: 'string'
                        },
                        matrix_avv: {
                            value: 'string',
                            oldValue: 'string'
                        },
                        animal_matrix_text: {
                            value: 'string',
                            oldValue: 'string'
                        },
                        primary_production_avv: {
                            value: 'string',
                            oldValue: 'string'
                        },
                        control_program_avv: {
                            value: 'string',
                            oldValue: 'string'
                        },
                        sampling_reason_avv: {
                            value: 'string',
                            oldValue: 'string'
                        },
                        program_reason_text: {
                            value: 'string',
                            oldValue: 'string'
                        },
                        operations_mode_avv: {
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
                        program_avv: {
                            value: 'string',
                            oldValue: 'string'
                        },
                        comment: {
                            value: 'string',
                            oldValue: 'string'
                        }
                    },
                    sampleMeta: {
                        analysis: {
                            compareHuman: {
                                active: false,
                                value: ''
                            },
                            esblAmpCCarbapenemasen: false,
                            molecularTyping: false,
                            other: '',
                            resistance: false,
                            sample: false,
                            serological: false,
                            species: false,
                            toxin: false,
                            vaccination: false
                        },
                        nrl: 'NRL-AR',
                        urgency: 'NORMAL'
                    }
                }
            ],
            meta: {
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
                version: '17'
            }
        };
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
