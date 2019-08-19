interface AddressDTO {
    instituteName: string;
    department?: string;
    street: string;
    zip: string;
    city: string;
    contactPerson: string;
    telephone: string;
    email: string;
}

interface AnalysisDTO {
    species: boolean;
    serological: boolean;
    phageTyping: boolean;
    resistance: boolean;
    vaccination: boolean;
    molecularTyping: boolean;
    toxin: boolean;
    zoonosenIsolate: boolean;
    esblAmpCCarbapenemasen: boolean;
    other: string;
    compareHuman: boolean;
}
export interface SampleSetMetaDTO {
    nrl: string;
    sender: AddressDTO;
    analysis: AnalysisDTO;
    urgency: string;
    fileName?: string;
}

interface SampleValidationErrorDTO {
    code: number;
    level: number;
    message: string;
}

export interface SampleDataEntryDTO {
    value: string;
    errors?: SampleValidationErrorDTO[];
    correctionOffer?: string[];
    oldValue?: string;
}
export interface SampleDataDTO {
    [key: string]: SampleDataEntryDTO;
}

export interface SampleMetaDTO {
    nrl: string;
}

export interface SampleDTO {
    sampleData: SampleDataDTO;
    sampleMeta: SampleMetaDTO;
}

export interface SampleSetDTO {
    samples: SampleDTO[];
    meta: SampleSetMetaDTO;
}

export interface OrderDTO {
    sampleSet: SampleSetDTO;
}
