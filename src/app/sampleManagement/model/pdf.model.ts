import { FileBuffer } from '../../core/model/file.model';
import { sampleSheetPDFConfig } from '../domain/sample-sheet/sample-sheet-pdf.config';
import {
    SampleSheet,
    SampleSheetConfig,
    SampleSheetMetaStrings,
    SampleSheetNRLStrings,
    SampleSheetSamplesStrings
} from './sample-sheet.model';

export type SampleSheetPDFConfig = typeof sampleSheetPDFConfig;

export interface PDFConstants {
    readonly config: SampleSheetPDFConfig;
    readonly styles: {};
}

export interface PDFConfigProviderService {
    readonly config: SampleSheetConfig & SampleSheetPDFConfig;
    readonly defaultStyle: {};
    readonly styles: {};
    readonly tableLayouts: {};
    readonly strings: {
        meta: SampleSheetMetaStrings;
        samples: SampleSheetSamplesStrings;
        nrl: SampleSheetNRLStrings;
    };
}

export interface PDFCreatorService {
    createPDF(sampleSheet: SampleSheet): Promise<FileBuffer>;
}
