import { WorkSheet } from 'xlsx';
import { SampleSet, Address } from './sample.model';
import { FileBuffer } from '../../core/model/file.model';
import { NRL_ID, Urgency } from '../domain/enums';

export interface ExcelUnmarshalService {
    convertExcelToJSJson(buffer: Buffer, fileName: string): Promise<SampleSet>;
}

export interface SampleMetaDataService {}

export interface ExcelUnmarshalPort extends ExcelUnmarshalService {}

export interface ImportedExcelFileDetails {
    workSheet: WorkSheet;
    file: File;
    oriDataLength: number;
}

export interface EinsendebogenMetaData {
    nrl: NRL_ID;
    sender: Address;
    analysis: EinsendebogenAnalysis;
    urgency: Urgency;
    fileName: string;
}

export interface EinsendebogenAnalysis {
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
    compareHuman: {
        value: string;
        active: boolean;
    };
}
export interface ExcelFileInfo {
    data: string;
    fileName: string;
    type: string;
}

export interface JSONMarshalService {
    convertJSONToExcel(data: SampleSet): Promise<FileBuffer>;
}

export interface JSONMarshalPort extends JSONMarshalService {}
