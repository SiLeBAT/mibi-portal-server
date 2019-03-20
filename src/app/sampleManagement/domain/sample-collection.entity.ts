import { Sample, SampleCollection } from '../model/sample.model';

class DefaultSampleCollection implements SampleCollection {
    constructor(public samples: Sample[]) {}
}

function createSampleCollection(data: Sample[]): SampleCollection {
    return new DefaultSampleCollection(data);
}

export { createSampleCollection };
