export { LoginResult } from '../authentication/domain/enums';

export * from './../core/domain/enums';

const getConfigurationService = () => ({
    getGeneralConfiguration: jest.fn()
});

export { getConfigurationService };
