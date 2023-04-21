import { ParseStateRepository } from '../../../app/ports';

export function getMockStateRepository(): ParseStateRepository {
    return {
        getAllFormats: jest.fn(() => Promise.resolve({}))
    };
}
