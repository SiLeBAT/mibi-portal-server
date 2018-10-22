import { createSampleCollection } from '../sample-collection.entity';

describe('SampleCollection class', () => {
    it('should be created', () => {
        const sampleCollection = createSampleCollection([]);
        expect(sampleCollection).toBeTruthy();
    });
});
