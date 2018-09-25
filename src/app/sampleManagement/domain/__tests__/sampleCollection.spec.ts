import { createSampleCollection } from './../sampleCollection.entity';

describe('SampleCollection class', () => {
    it('should be created', () => {
        const sampleCollection = createSampleCollection([]);
        expect(sampleCollection).toBeTruthy();
    });
});
