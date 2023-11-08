import { sampleSheetConfig } from '../domain/sample-sheet/sample-sheet.config';
import {
    sampleSheetMetaStrings,
    sampleSheetSamplesStrings,
    sampleSheetNRLStrings
} from '../domain/sample-sheet/sample-sheet.strings';
import { NRL_ID, Urgency } from '../domain/enums';
import { Address, SampleSet, Sample } from './sample.model';

export type SampleSheetConfig = typeof sampleSheetConfig;
export type SampleSheetMetaStrings = typeof sampleSheetMetaStrings;
export type SampleSheetSamplesStrings = typeof sampleSheetSamplesStrings;
export type SampleSheetNRLStrings = typeof sampleSheetNRLStrings;

export interface SampleSheetConstants {
    readonly config: SampleSheetConfig;
    readonly defaultStyle: {};
    readonly styles: {};
    readonly metaStrings: SampleSheetMetaStrings;
    readonly samplesStrings: SampleSheetSamplesStrings;
    readonly nrlStrings: SampleSheetNRLStrings;
}

export enum SampleSheetAnalysisOption {
    OMIT,
    ACTIVE,
    STANDARD
}

export interface SampleSheetAnalysis {
    species: SampleSheetAnalysisOption;
    serological: SampleSheetAnalysisOption;
    phageTyping: SampleSheetAnalysisOption;
    resistance: SampleSheetAnalysisOption;
    vaccination: SampleSheetAnalysisOption;
    molecularTyping: SampleSheetAnalysisOption;
    toxin: SampleSheetAnalysisOption;
    zoonosenIsolate: SampleSheetAnalysisOption;
    esblAmpCCarbapenemasen: SampleSheetAnalysisOption;
    other: SampleSheetAnalysisOption;
    otherText: string;
    compareHuman: SampleSheetAnalysisOption;
    compareHumanText: string;
}

export interface SampleSheetMetaData {
    nrl: NRL_ID;
    sender: Address;
    analysis: SampleSheetAnalysis;
    urgency: Urgency;
    fileName: string;
    customerRefNumber: string;
    signatureDate: string;
    version: string;
}

export interface SampleSheet {
    samples: Sample[];
    meta: SampleSheetMetaData;
}

export interface SampleSheetService {
    fromSampleSetToSampleSheet(sampleSet: SampleSet): SampleSheet;
    fromSampleSheetToSampleSet(sampleSheet: SampleSheet): SampleSet;
}
