import { SampleDataDTO } from '../src/ui/server/model/shared-dto.model';

/**
 * Shape of the browser-parsed sample sheet sent to PUT /v2/samples since MPS-312,
 * mirroring mibi-portal-client's `ParsedSampleSheet`. It deliberately carries no
 * per-sample meta (nrl/analysis/urgency) — the cloud fills those in during the NRL
 * enrichment, which needs database-backed data.
 *
 * This lives in `test/` rather than alongside the other DTOs in
 * `src/ui/server/model/` because nothing in `src` refers to it: the samples
 * controller reads `req.body.parsedSampleSheet` untyped and forwards it as an opaque
 * payload. It exists purely so the integration tests can build valid request bodies.
 */

interface ParsedSenderDTO {
    instituteName: string;
    department?: string;
    street: string;
    zipCity: string;
    contactPerson: string;
    telephone: string;
    email: string;
}

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
    sender: ParsedSenderDTO;
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

/** Body of PUT /v2/samples when the client sends the browser-parsed sheet. */
export interface PutSamplesParsedSheetRequestDTO {
    readonly parsedSampleSheet: ParsedSampleSheetDTO;
}
