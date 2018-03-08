import { ISample } from './../sample';

export interface ISampleCollection {
    getSamples(): ISample[];
    setSamples(samples: ISample[]): void;
}

class SampleCollection implements ISampleCollection {

    constructor(private samples: ISample[]) { }

    getSamples() {
        return this.samples;
    }

    setSamples(samples: ISample[]) {
        this.samples = samples;
    }
}

function createSampleCollection(data: ISample[]): ISampleCollection {
    return new SampleCollection(data);
}

export {
    createSampleCollection
};
