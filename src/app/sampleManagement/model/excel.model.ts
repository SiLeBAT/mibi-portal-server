import { WorkSheet } from 'xlsx';
import { FileBuffer } from '../../core/model/file.model';
import { SampleSheet } from './sample-sheet.model';

export interface ImportedExcelFileDetails {
    workSheet: WorkSheet;
    file: File;
    oriDataLength: number;
}

export interface ExcelFileInfo {
    data: string;
    fileName: string;
    type: string;
}

export interface ExcelUnmarshalService {
    convertExcelToJSJson(
        buffer: Buffer,
        fileName: string
    ): Promise<SampleSheet>;
}

export interface ExcelUnmarshalPort extends ExcelUnmarshalService {}

export interface JSONMarshalService {
    createExcel(
        sampleSheet: SampleSheet,
        nrlSampleSheet?: boolean
    ): Promise<FileBuffer>;
}

export interface JSONMarshalPort extends JSONMarshalService {}
