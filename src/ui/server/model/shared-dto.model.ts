interface AddressDTO {
    instituteName: string;
    department?: string;
    street: string;
    zipCity: string;
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
    version?: string;
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
    nrlData?: string;
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

/**
 * MPS-312: the sample sheet as parsed by the browser and sent to PUT /v2/samples
 * instead of a raw .xlsx upload. Mirrors mibi-portal-client's `ParsedSampleSheet`.
 * Deliberately carries no per-sample meta (nrl/analysis/urgency) — the cloud fills
 * those in during NRL enrichment, which needs database-backed data.
 */
export interface ParsedSampleSheetAnalysisDTO {
    species: number;
    serological: number;
    resistance: number;
    vaccination: number;
    molecularTyping: number;
    toxin: number;
    esblAmpCCarbapenemasen: number;
    other: number;
    otherText: string;
    compareHuman: number;
    compareHumanText: string;
}

export interface ParsedSampleSheetMetaDTO {
    nrl: string;
    urgency: string;
    sender: AddressDTO;
    analysis: ParsedSampleSheetAnalysisDTO;
    fileName: string;
    customerRefNumber: string;
    signatureDate: string;
    version: string;
}

export interface ParsedSampleDTO {
    data: SampleDataDTO;
}

export interface ParsedSampleSheetDTO {
    samples: ParsedSampleDTO[];
    meta: ParsedSampleSheetMetaDTO;
}
