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

export interface AnalysisDTO {
    species: boolean;
    serological: boolean;
    resistance: boolean;
    vaccination: boolean;
    molecularTyping: boolean;
    toxin: boolean;
    esblAmpCCarbapenemasen: boolean;
    sample: boolean;
    other: string;
    compareHuman: {
        value: string;
        active: boolean;
    };
}
export interface SampleSetMetaDTO {
    sender: AddressDTO;
    fileName?: string;
    customerRefNumber?: string;
    signatureDate?: string;
}

export interface SampleValidationErrorDTO {
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
    analysis: AnalysisDTO;
    urgency: string;
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
