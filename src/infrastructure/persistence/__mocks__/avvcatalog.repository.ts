import { AVVCatalog, AVVCatalogRepository } from '../../../app/ports';
const mockFuse = {
    search: jest.fn(() => []),
    setCollection: jest.fn(),
    add: jest.fn(),
    remove: jest.fn(),
    removeAt: jest.fn(),
    getIndex: jest.fn()
};
// tslint:disable-next-line: no-any
const mockCatalog: AVVCatalog<any> = {
    containsEintragWithAVVKode: jest.fn(),
    containsTextEintrag: jest.fn(),
    getEintragWithAVVKode: jest.fn(),
    getAttributeWithAVVKode: jest.fn(),
    containsFacetteWithBegriffsId: jest.fn(),
    getFacettenIdsWithKode: jest.fn(),
    getFacetteWithBegriffsId: jest.fn(),
    getFacettenWertWithBegriffsId: jest.fn(),
    assembleAVVKode: jest.fn(),
    getUniqueId: jest.fn(),
    getFuzzyIndex: jest.fn(() => mockFuse),
    dump: jest.fn()
};

export function getMockAVVCatalogRepository(): AVVCatalogRepository {
    return {
        getAVVCatalog: jest.fn(() => mockCatalog)
    };
}
