import { NRLRepository, NRL } from '../../../app/ports';

export function getMockNRLRepository(): NRLRepository {
    return {
        getAllNRLs: jest.fn(() =>
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
                    ],
                    email: 'fakeNRL@nrl.com'
                }
            ])
        )
    };
}
