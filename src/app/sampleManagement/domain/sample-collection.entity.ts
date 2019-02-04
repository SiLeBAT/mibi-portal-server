import { Sample } from './sample.entity';

export interface SampleCollection {
	samples: Sample[];
}

class DefaultSampleCollection implements SampleCollection {
	constructor(public samples: Sample[]) {}
}

function createSampleCollection(data: Sample[]): SampleCollection {
	return new DefaultSampleCollection(data);
}

export { createSampleCollection };
