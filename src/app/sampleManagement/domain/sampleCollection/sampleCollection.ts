import { ISample } from './../sample';

export interface ISampleCollection {
    samples: ISample[];
}

class SampleCollection implements ISampleCollection {

    constructor(public samples: ISample[]) { }

}

function createSampleCollection(data: ISample[]): ISampleCollection {
    return new SampleCollection(data);
}

export {
    createSampleCollection
};
