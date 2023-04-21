import { ParseNRLRepository, NRL_ID } from '../../../app/ports';

export function getMockNRLRepository(): ParseNRLRepository {
    return {
        retrieve: jest.fn(() =>
            Promise.resolve([
                {
                    id: NRL_ID.NRL_AR,
                    selectors: [
                        '^.*enterococ.*$',
                        '^Escherichia coli$',
                        '^Escherichia coli AmpC-bildend$',
                        '^Escherichia coli Carbapenemase-bildend$',
                        '^Escherichia coli ESBL-bildend$',
                        '^Escherichia coli ESBL/AmpC-bildend$',
                        '^Enterobacteriaceae Carbapenemase-bildend$'
                    ],
                    email: 'fakeNRL@nrl.com',
                    standardProcedures: [],
                    optionalProcedures: []
                }
            ])
        )
    };
}
