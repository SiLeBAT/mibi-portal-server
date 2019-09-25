import { sampleSheetConfig } from "../domain/sample-sheet/sample-sheet.config";
import { sampleSheetMetaStrings, sampleSheetSamplesStrings } from "../domain/sample-sheet/sample-sheet.strings";

export type SampleSheetConfig = typeof sampleSheetConfig;
export type SampleSheetMetaStrings = typeof sampleSheetMetaStrings;
export type SampleSheetSamplesStrings = typeof sampleSheetSamplesStrings;

export interface SampleSheetConstants {
    readonly config: SampleSheetConfig;
    readonly defaultStyle: {};
    readonly styles: {};
    readonly metaStrings: SampleSheetMetaStrings;
    readonly samplesStrings: SampleSheetSamplesStrings;
};