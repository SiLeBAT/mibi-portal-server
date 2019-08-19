import { Urgency, NRL } from '../../domain/enums';
import { getContainer } from '../../../../aspects/container/container';
import { createSample } from '../../domain/sample.entity';
import { Sample, SampleData } from '../../../ports';
import { Container } from 'inversify';
import { mockPersistenceContainerModule } from '../../../../infrastructure/persistence/__mocks__/persistence-mock.module';
import { APPLICATION_TYPES } from '../../../application.types';
import { getApplicationContainerModule } from '../../../application.module';
import { NRLService } from '../../model/nrl.model';
import { SampleSetMetaData } from '../../model/sample.model';
import { NRLRepository } from '../../model/repository.model';

describe('NRL Assignment Service', () => {
    let service: NRLService;

    let genericTestSampleCollection: Sample[];
    let meta: SampleSetMetaData;
    let testSampleData: SampleData;
    let genericTestSample: Sample;
    let container: Container | null;
    beforeEach(() => {
        container = getContainer();
        container.load(
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
        service = container.get<NRLService>(APPLICATION_TYPES.NRLService);

        testSampleData = {
            sample_id: { value: '1', errors: [], correctionOffer: [] },
            sample_id_avv: { value: '1-ABC', errors: [], correctionOffer: [] },
            pathogen_adv: {
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
            sampling_location_adv: {
                value: '11000000',
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
            topic_adv: { value: '01', errors: [], correctionOffer: [] },
            matrix_adv: { value: '063502', errors: [], correctionOffer: [] },
            matrix_text: {
                value: 'Hähnchen auch tiefgefroren',
                errors: [],
                correctionOffer: []
            },
            process_state_adv: {
                value: '999',
                errors: [],
                correctionOffer: []
            },
            sampling_reason_adv: {
                value: '10',
                errors: [],
                correctionOffer: []
            },
            sampling_reason_text: {
                value: 'Planprobe',
                errors: [],
                correctionOffer: []
            },
            operations_mode_adv: {
                value: '4010000',
                errors: [],
                correctionOffer: []
            },
            operations_mode_text: {
                value: 'Lebensmitteleinzelhandel',
                errors: [],
                correctionOffer: []
            },
            vvvo: { value: '', errors: [], correctionOffer: [] },
            comment: { value: '', errors: [], correctionOffer: [] }
        };
        meta = {
            nrl: NRL.NRL_AR,
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
            fileName: '',
            urgency: Urgency.NORMAL,
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
        };
        genericTestSample = createSample(testSampleData);
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
        const mockRepo = container!.get<NRLRepository>(
            APPLICATION_TYPES.NRLRepository
        );
        mockRepo.getAllNRLs = jest.fn(() =>
            Promise.resolve([
                {
                    name: NRL.NRL_AR,
                    selectors: [
                        '^.*enterococ.*$',
                        '^Escherichia coli$',
                        '^Escherichia coli AmpC-bildend$',
                        '^Escherichia coli Carbapenemase-bildend$',
                        '^Escherichia coli ESBL-bildend$',
                        '^Escherichia coli ESBL/AmpC-bildend$',
                        '^Enterobacteriaceae Carbapenemase-bildend$'
                    ]
                }
            ])
        );
        const result = service.assignNRLsToSamples(genericTestSampleCollection);
        expect(result[0].nrl).toEqual(NRL.NRL_AR);
    });

    it('should assign sample to unknown NRL', () => {
        // tslint:disable-next-line: no-unnecessary-type-assertion
        const mockRepo = container!.get<NRLRepository>(
            APPLICATION_TYPES.NRLRepository
        );
        mockRepo.getAllNRLs = jest.fn(() =>
            Promise.resolve([
                {
                    name: NRL.NRL_AR,
                    selectors: [
                        '^.*enterococ.*$',
                        '^Escherichia coli$',
                        '^Escherichia coli AmpC-bildend$',
                        '^Escherichia coli Carbapenemase-bildend$',
                        '^Escherichia coli ESBL-bildend$',
                        '^Escherichia coli ESBL/AmpC-bildend$',
                        '^Enterobacteriaceae Carbapenemase-bildend$'
                    ]
                }
            ])
        );
        const specificTestData = { ...testSampleData };
        specificTestData.pathogen_adv = {
            value: 'No idea what this is',
            errors: [],
            correctionOffer: []
        };
        genericTestSampleCollection = [createSample(specificTestData)];
        const result = service.assignNRLsToSamples(genericTestSampleCollection);
        expect(result[0].nrl).toEqual(NRL.UNKNOWN);
    });
});
