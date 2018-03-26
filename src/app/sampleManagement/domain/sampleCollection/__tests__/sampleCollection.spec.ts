import { createSampleCollection } from './../sampleCollection';

describe('SampleCollection class', () => {
    it('should be created', () => {
        const sampleCollection = createSampleCollection([]);
        expect(sampleCollection).toBeTruthy();
    });
});
