import { Container } from 'inversify';
import { createContainer } from '../../../../aspects/container/container';
import { mockPersistenceContainerModule } from '../../../../infrastructure/persistence/__mocks__/persistence-mock.module';
import { getApplicationContainerModule } from '../../../application.module';
import { APPLICATION_TYPES } from '../../../application.types';
import { Sample, SampleData, SampleFactory } from '../../../ports';
import { NRL_ID } from '../../domain/enums';
import { NRLService } from '../../model/nrl.model';
import { ParseNRLRepository } from '../../model/repository.model';

describe('NRL Assignment Service', () => {
    let service: NRLService;

    let genericTestSampleCollection: Sample[];
    let testSampleData: SampleData;
    let genericTestSample: Sample;
    let container: Container | null;
    let factory: SampleFactory;
    beforeEach(() => {
        container = createContainer();
        container.load(
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
        service = container.get<NRLService>(APPLICATION_TYPES.NRLService);
        factory = container.get<SampleFactory>(APPLICATION_TYPES.SampleFactory);

        testSampleData = {
            sample_id: { value: '1', errors: [], correctionOffer: [] },
            sample_id_avv: { value: '1-ABC', errors: [], correctionOffer: [] },
            partial_sample_id: {
                value: '0',
                errors: [],
                correctionOffer: []
            },
            pathogen_avv: {
                value: 'Escherichia coli',
                errors: [],
                correctionOffer: []
            },
            pathogen_text: { value: '', errors: [], correctionOffer: [] },
            sampling_date: {
                value: '01.02.2017',
                errors: [],
                correctionOffer: []
            },
            isolation_date: {
                value: '01.03.2017',
                errors: [],
                correctionOffer: []
            },
            sampling_location_avv: {
                value: '42342|175490|',
                errors: [],
                correctionOffer: []
            },
            sampling_location_zip: {
                value: '10787',
                errors: [],
                correctionOffer: []
            },
            sampling_location_text: {
                value: 'Berlin',
                errors: [],
                correctionOffer: []
            },
            animal_avv: {
                value: '2464|57755|1212-905,1334-1356,63421-1512',
                errors: [],
                correctionOffer: []
            },
            matrix_avv: {
                value: '187036|183974|',
                errors: [],
                correctionOffer: []
            },
            animal_matrix_text: {
                value: 'Tier: Hühner; Art/ Quelle/ Stoff - Haushuhn; Alter - <=16 Wo; Nutzungs- und Produktionsrichtung - Zur Mast',
                errors: [],
                correctionOffer: []
            },
            primary_production_avv: {
                value: '75684|50585|',
                errors: [],
                correctionOffer: []
            },
            control_program_avv: {
                value: '70564|53075|',
                errors: [],
                correctionOffer: []
            },
            sampling_reason_avv: {
                value: '22562|126354|',
                errors: [],
                correctionOffer: []
            },
            program_reason_text: {
                value: 'Planprobe',
                errors: [],
                correctionOffer: []
            },
            operations_mode_avv: {
                value: '10469|57619|63420-4010,63422-10492',
                errors: [],
                correctionOffer: []
            },
            operations_mode_text: {
                value: 'Inverkehrbringen; Endprodukte - Kakao, Schokolade, Schokoladenwaren und Süßwaren; Prozessdetails - Abgeben an Endverbraucher',
                errors: [],
                correctionOffer: []
            },
            vvvo: { value: '', errors: [], correctionOffer: [] },
            program_avv: { value: '', errors: [], correctionOffer: [] },
            comment: { value: '', errors: [], correctionOffer: [] }
        };
        genericTestSample = factory.createSample(testSampleData);
        genericTestSampleCollection = [genericTestSample];
    });
    afterEach(() => {
        container = null;
    });

    it('should return an empty array', () => {
        genericTestSampleCollection = [];
        const result = service.assignNRLsToSamples(genericTestSampleCollection);
        expect(result).toEqual([]);
    });

    it('should assign sample to NRL-AR', () => {
        // tslint:disable-next-line: no-unnecessary-type-assertion
        const mockRepo = container!.get<ParseNRLRepository>(
            APPLICATION_TYPES.ParseNRLRepository
        );
        mockRepo.retrieve = jest.fn(() =>
            Promise.resolve([
                {
                    id: NRL_ID.NRL_AR,
                    selectors: [
                        "^.(Carba|ESBL|mpC).$",
                        "^Enterococcus (spp.|faecalis|faecium)$",
                        "^Escherichia coli$"
                      ],
                    email: 'fakeNRL@nrl.com',
                    standardProcedures: [],
                    optionalProcedures: []
                }
            ])
        );
        const result = service.assignNRLsToSamples(genericTestSampleCollection);
        expect(result[0].getNRL()).toEqual(NRL_ID.NRL_AR);
    });

    it('should assign sample to unknown NRL', () => {
        // tslint:disable-next-line: no-unnecessary-type-assertion
        const mockRepo = container!.get<ParseNRLRepository>(
            APPLICATION_TYPES.ParseNRLRepository
        );
        mockRepo.retrieve = jest.fn(() =>
            Promise.resolve([
                {
                    id: NRL_ID.NRL_AR,
                    selectors: [
                        "^.(Carba|ESBL|mpC).$",
                        "^Enterococcus (spp.|faecalis|faecium)$",
                        "^Escherichia coli$"
                      ],
                    email: 'fakeNRL@nrl.com',
                    standardProcedures: [],
                    optionalProcedures: []
                }
            ])
        );
        const specificTestData = { ...testSampleData };
        specificTestData.pathogen_avv = {
            value: 'No idea what this is',
            errors: [],
            correctionOffer: []
        };
        genericTestSampleCollection = [factory.createSample(specificTestData)];
        const result = service.assignNRLsToSamples(genericTestSampleCollection);
        expect(result[0].getNRL()).toEqual(NRL_ID.UNKNOWN);
    });
});
