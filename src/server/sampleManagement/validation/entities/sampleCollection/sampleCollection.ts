import { ISample } from './../sample';

export interface ISampleCollection {
    getSamples(): ISample[];
    setSamples(samples: ISample[]): void;
}

function createSampleCollection(data: ISample[]): ISampleCollection {
    return new SampleCollection(data);
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

export {
    createSampleCollection
}