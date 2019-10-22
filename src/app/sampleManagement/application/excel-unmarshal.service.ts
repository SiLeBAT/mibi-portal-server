import { SampleFactory } from './../domain/sample.factory';
import { APPLICATION_TYPES } from './../../application.types';
import { Analysis } from './../model/sample.model';
import { WorkBook, WorkSheet, read, utils, CellObject } from 'xlsx';
import * as _ from 'lodash';
import * as moment from 'moment';
import 'moment/locale/de';
import {
    SampleSet,
    AnnotatedSampleDataEntry,
    Sample,
    SampleData,
    Address
} from '../model/sample.model';

import {
    ExcelUnmarshalService,
    EinsendebogenMetaData,
    EinsendebogenAnalysis
} from '../model/excel.model';
import { Urgency, NRL_ID } from '../domain/enums';
import { injectable, inject } from 'inversify';
import {
    VALID_SHEET_NAME,
    META_ANALYSIS_SPECIES_CELL,
    META_ANALYSIS_TOXIN_CELL,
    META_ANALYSIS_OTHER_CELL,
    META_SENDER_DEPARTMENT_CELL,
    META_SENDER_STREET_CELL,
    META_SENDER_ZIP_CITY_CELL,
    META_SENDER_TELEPHONE_CELL,
    META_SENDER_EMAIL_CELL,
    META_URGENCY_CELL,
    META_NRL_CELL,
    FORM_PROPERTIES,
    META_ANALYSIS_RESISTANCE_CELL,
    META_ANALYSIS_VACCINATION_CELL,
    META_ANALYSIS_MOLECULARTYPING_CELL,
    META_ANALYSIS_ESBLAMPCCARBAPENEMASEN_CELL,
    META_ANALYSIS_COMPAREHUMAN_BOOL_CELL,
    META_SENDER_INSTITUTENAME_CELL,
    META_ANALYSIS_SEROLOGICAL_CELL,
    META_SENDER_CONTACTPERSON_CELL,
    META_ANALYSIS_COMPAREHUMAN_TEXT_CELL,
    EMPTY_META,
    META_ANALYSIS_ZOONOSENISOLATE_CELL,
    META_ANALYSIS_PHAGETYPING_CELL
} from '../domain/constants';
import { DefaultNRLService } from './nrl.service';

@injectable()
export class DefaultExcelUnmarshalService implements ExcelUnmarshalService {
    constructor(
        @inject(APPLICATION_TYPES.SampleFactory) private factory: SampleFactory
    ) {}

    async convertExcelToJSJson(
        buffer: Buffer,
        fileName: string
    ): Promise<SampleSet> {
        try {
            const sampleSheet: WorkSheet = await this.fromFileToWorkSheet(
                buffer
            );
            const data: Sample[] = this.fromWorksheetToData(sampleSheet);
            const meta: EinsendebogenMetaData = this.getMetaDataFromFileData(
                sampleSheet,
                fileName
            );

            return {
                samples: this.isForSingleSpecifiedNRL(data, meta)
                    ? this.addCorrectMetaData(data, meta)
                    : data,
                meta: {
                    sender: meta.sender,
                    fileName: meta.fileName
                }
            };
        } catch (error) {
            throw error;
        }
    }

    private async fromFileToWorkSheet(buffer: Buffer): Promise<WorkSheet> {
        return new Promise<WorkSheet>((resolve, reject) => {
            const workbook: WorkBook = read(buffer, {
                type: 'buffer',
                cellDates: true,
                cellText: false,
                cellStyles: true,
                cellNF: true
            });
            const worksheetName: string = workbook.SheetNames[0];
            const sampleSheet: WorkSheet = workbook.Sheets[worksheetName];
            if (worksheetName === VALID_SHEET_NAME) {
                resolve(sampleSheet);
            } else {
                reject(
                    `Not a valid excel sheet, name of first sheet must be ${VALID_SHEET_NAME}`
                );
            }
        });
    }

    private getMetaDataFromFileData(
        workSheet: WorkSheet,
        fileName: string
    ): EinsendebogenMetaData {
        const meta: EinsendebogenMetaData = {
            nrl: this.getNRLFromWorkSheet(workSheet),
            urgency: this.getUrgencyFromWorkSheet(workSheet),
            sender: this.getSenderFromWorkSheet(workSheet),
            analysis: this.getAnalysisFromWorkSheet(workSheet),
            fileName
        };

        return meta;
    }

    private addCorrectMetaData(
        data: Sample[],
        meta: EinsendebogenMetaData
    ): Sample[] {
        return data.map(sample => {
            sample.setAnalysis(
                this.fromEinsendebogenAnalysisToSampleAnalysis(meta.analysis)
            );
            sample.setUrgency(meta.urgency);
            return sample;
        });
    }

    private fromEinsendebogenAnalysisToSampleAnalysis(
        analysis: EinsendebogenAnalysis
    ): Partial<Analysis> {
        return {
            ...EMPTY_META.analysis,
            ...{
                species: analysis.species,
                serological: analysis.serological,
                resistance: analysis.resistance,
                vaccination: analysis.vaccination,
                molecularTyping: analysis.molecularTyping,
                toxin: analysis.toxin,
                esblAmpCCarbapenemasen: analysis.esblAmpCCarbapenemasen,
                other: analysis.other,
                compareHuman: _.cloneDeep(analysis.compareHuman)
            }
        };
    }
    private getAnalysisFromWorkSheet(
        workSheet: WorkSheet
    ): EinsendebogenAnalysis {
        return {
            species:
                !!this.getDataFromCell(workSheet[META_ANALYSIS_SPECIES_CELL]) ||
                false,
            serological:
                !!this.getDataFromCell(
                    workSheet[META_ANALYSIS_SEROLOGICAL_CELL]
                ) || false,
            resistance:
                !!this.getDataFromCell(
                    workSheet[META_ANALYSIS_RESISTANCE_CELL]
                ) || false,
            zoonosenIsolate:
                !!this.getDataFromCell(
                    workSheet[META_ANALYSIS_ZOONOSENISOLATE_CELL]
                ) || false,

            phageTyping:
                !!this.getDataFromCell(
                    workSheet[META_ANALYSIS_PHAGETYPING_CELL]
                ) || false,

            vaccination:
                !!this.getDataFromCell(
                    workSheet[META_ANALYSIS_VACCINATION_CELL]
                ) || false,
            molecularTyping:
                !!this.getDataFromCell(
                    workSheet[META_ANALYSIS_MOLECULARTYPING_CELL]
                ) || false,
            toxin:
                !!this.getDataFromCell(workSheet[META_ANALYSIS_TOXIN_CELL]) ||
                false,
            esblAmpCCarbapenemasen:
                !!this.getDataFromCell(
                    workSheet[META_ANALYSIS_ESBLAMPCCARBAPENEMASEN_CELL]
                ) || false,
            other: (
                '' + this.getDataFromCell(workSheet[META_ANALYSIS_OTHER_CELL])
            ).trim(),
            compareHuman: {
                active:
                    !!this.getDataFromCell(
                        workSheet[META_ANALYSIS_COMPAREHUMAN_BOOL_CELL]
                    ) || false,
                value: (
                    '' +
                    this.getDataFromCell(
                        workSheet[META_ANALYSIS_COMPAREHUMAN_TEXT_CELL]
                    )
                ).trim()
            }
        };
    }

    private getSenderFromWorkSheet(workSheet: WorkSheet): Address {
        return {
            instituteName: (
                '' +
                this.getDataFromCell(workSheet[META_SENDER_INSTITUTENAME_CELL])
            ).trim(),
            department: (
                '' +
                this.getDataFromCell(workSheet[META_SENDER_DEPARTMENT_CELL])
            ).trim(),
            street: (
                '' + this.getDataFromCell(workSheet[META_SENDER_STREET_CELL])
            ).trim(),
            zip: (
                '' + this.getDataFromCell(workSheet[META_SENDER_ZIP_CITY_CELL])
            )
                .split(',')[0]
                .trim(),
            city: (
                this.getDataFromCell(workSheet[META_SENDER_ZIP_CITY_CELL]) + ','
            )
                .split(',')[1]
                .trim(),
            contactPerson: (
                '' +
                this.getDataFromCell(workSheet[META_SENDER_CONTACTPERSON_CELL])
            ).trim(),
            telephone: (
                '' + this.getDataFromCell(workSheet[META_SENDER_TELEPHONE_CELL])
            ).trim(),
            email: (
                '' + this.getDataFromCell(workSheet[META_SENDER_EMAIL_CELL])
            ).trim()
        };
    }

    private getUrgencyFromWorkSheet(workSheet: WorkSheet): Urgency {
        const urgency: string =
            '' + this.getDataFromCell(workSheet[META_URGENCY_CELL]);

        switch (urgency.trim().toLowerCase()) {
            case 'eilt':
                return Urgency.URGENT;
            case 'normal':
            default:
                return Urgency.NORMAL;
        }
    }
    private getNRLFromWorkSheet(workSheet: WorkSheet): NRL_ID {
        const workSheetNRL: string = workSheet[META_NRL_CELL].v || '';
        return DefaultNRLService.mapNRLStringToEnum(workSheetNRL);
    }

    private getDataFromCell(
        cell: CellObject
    ): string | number | boolean | Date | undefined {
        if (!cell) {
            return '';
        }
        return cell.v;
    }
    private fromWorksheetToData(workSheet: WorkSheet): Sample[] {
        const lineNumber: number = this.getVersionDependentLine(workSheet);
        const data = utils.sheet_to_json<Record<string, string>>(workSheet, {
            header: FORM_PROPERTIES,
            range: lineNumber,
            defval: ''
        });
        const cleanedData = this.fromDataToCleanedSamples(data);
        const formattedData: Sample[] = this.formatData(cleanedData);
        return formattedData;
    }

    private isForSingleSpecifiedNRL(
        samples: Sample[],
        meta: EinsendebogenMetaData
    ): boolean {
        return (
            samples[0].getNRL() === meta.nrl &&
            samples.length ===
                samples.filter(s => s.getNRL() === samples[0].getNRL()).length
        );
    }

    private formatData(data: Record<string, string>[]): Sample[] {
        const formattedData = data.map((sample: Record<string, string>) => {
            const annotatedSampleData: Record<
                string,
                AnnotatedSampleDataEntry
            > = {};
            for (const props in sample) {
                if (this.isDateField(props)) {
                    sample[props] = this.parseDate(sample[props]);
                }
                annotatedSampleData[props] = this.createAnnotatedSampleEntry(
                    sample[props]
                );
            }
            return this.factory.createSample(annotatedSampleData as SampleData);
        });
        return formattedData;
    }

    private createAnnotatedSampleEntry(
        value: string
    ): AnnotatedSampleDataEntry {
        return {
            value,
            errors: [],
            correctionOffer: []
        };
    }

    private parseDate(date: string) {
        date = date.toString();
        let parseOptions = {
            dateFormat: 'DD.MM.YYYY'
        };
        const americanDF = /\d\d?\/\d\d?\/\d\d\d?\d?/;
        if (americanDF.test(date)) {
            parseOptions = {
                dateFormat: 'MM/DD/YYYY'
            };
        }
        try {
            let parsedDate = 'Invalid date';
            if (date.includes('GMT')) {
                const localOffset = moment().utcOffset();
                // parse as localelized date of input timezone
                // this is the date as parsed by xlsx
                parsedDate = moment(date)
                    // convert to utc time and offset to local server timezone
                    // this is the date as interpreted by xlsx before parsing
                    .utcOffset(localOffset)
                    .locale('de')
                    .format('DD.MM.YYYY');
            } else {
                parsedDate = moment(date, parseOptions.dateFormat)
                    .locale('de')
                    .format('DD.MM.YYYY');
            }
            if (parsedDate === 'Invalid date') {
                return date;
            }
            return parsedDate;
        } catch (e) {
            return date;
        }
    }

    private isDateField(field: string) {
        switch (field) {
            case 'sampling_date':
            case 'isolation_date':
                return true;
            default:
                return false;
        }
    }

    private getVersionDependentLine(workSheet: WorkSheet): number {
        let num = 41;
        _.find(workSheet, (o, i) => {
            if (o.v === 'Ihre Probe-nummer') {
                const h = i.replace(/\D/, '');
                num = parseInt(h, 10);
                return true;
            }
            return false;
        });
        return num;
    }

    private fromDataToCleanedSamples(
        data: Record<string, string>[]
    ): Record<string, string>[] {
        const cleanedData: Record<string, string>[] = data.filter(
            sampleObj =>
                Object.keys(sampleObj)
                    .map(key => sampleObj[key])
                    .filter(item => item !== '').length > 0
        );

        return cleanedData;
    }
}
