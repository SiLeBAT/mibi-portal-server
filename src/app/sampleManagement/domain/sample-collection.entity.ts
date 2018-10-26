import { Sample } from './sample.entity';

export interface ISampleCollection {
    samples: Sample[];
}

class SampleCollection implements ISampleCollection {

    constructor(public samples: Sample[]) { }

}

function createSampleCollection(data: Sample[]): ISampleCollection {
    return new SampleCollection(data);
}

export {
    createSampleCollection
};
