import { APPLICATION_TYPES } from './../../application.types';
import { WorkBook, WorkSheet, read, utils, CellObject } from 'xlsx';
import * as _ from 'lodash';
import * as moment from 'moment';
import 'moment/locale/de';
import {
    AnnotatedSampleDataEntry,
    Sample,
    SampleData,
    Address,
    SampleFactory
} from '../model/sample.model';

import { ExcelUnmarshalService } from '../model/excel.model';
import { Urgency, NRL_ID } from '../domain/enums';
import { injectable, inject } from 'inversify';
import {
    VALID_SHEET_NAME,
    META_ANALYSIS_SPECIES_CELL,
    META_ANALYSIS_TOXIN_CELL,
    META_ANALYSIS_OTHER_TEXT_CELL,
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
    META_ANALYSIS_ZOONOSENISOLATE_CELL,
    META_ANALYSIS_PHAGETYPING_CELL,
    META_ANAYLSIS_OTHER_BOOL_CELL,
    META_CUSTOMER_REF_NUMBER_CELL,
    META_SIGNATURE_DATE_CELL
} from '../domain/constants';
import { DefaultNRLService } from './nrl.service';
import {
    SampleSheet,
    SampleSheetMetaData,
    SampleSheetAnalysis,
    SampleSheetAnalysisOption
} from '../model/sample-sheet.model';

@injectable()
export class DefaultExcelUnmarshalService implements ExcelUnmarshalService {
    constructor(
        @inject(APPLICATION_TYPES.SampleFactory) private factory: SampleFactory
    ) {}

    async convertExcelToJSJson(
        buffer: Buffer,
        fileName: string
    ): Promise<SampleSheet> {
        const workSheet: WorkSheet = await this.fromFileToWorkSheet(buffer);

        return {
            samples: this.fromWorksheetToData(workSheet),
            meta: this.getMetaDataFromFileData(workSheet, fileName)
        };
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
            const workSheet: WorkSheet = workbook.Sheets[worksheetName];
            if (worksheetName === VALID_SHEET_NAME) {
                resolve(workSheet);
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
    ): SampleSheetMetaData {
        return {
            nrl: this.getNRLFromWorkSheet(workSheet),
            urgency: this.getUrgencyFromWorkSheet(workSheet),
            sender: this.getSenderFromWorkSheet(workSheet),
            analysis: this.getAnalysisFromWorkSheet(workSheet),
            fileName,
            customerRefNumber: this.getStringFromCell(
                workSheet[META_CUSTOMER_REF_NUMBER_CELL]
            ),
            signatureDate: this.getStringFromCell(
                workSheet[META_SIGNATURE_DATE_CELL]
            )
        };
    }

    private getAnalysisFromWorkSheet(
        workSheet: WorkSheet
    ): SampleSheetAnalysis {
        const getOptionFromCell = (
            cell: CellObject
        ): SampleSheetAnalysisOption => {
            return this.getDataFromCell(cell)
                ? SampleSheetAnalysisOption.ACTIVE
                : SampleSheetAnalysisOption.OMIT;
        };

        return {
            species: getOptionFromCell(workSheet[META_ANALYSIS_SPECIES_CELL]),
            serological: getOptionFromCell(
                workSheet[META_ANALYSIS_SEROLOGICAL_CELL]
            ),
            resistance: getOptionFromCell(
                workSheet[META_ANALYSIS_RESISTANCE_CELL]
            ),
            zoonosenIsolate: getOptionFromCell(
                workSheet[META_ANALYSIS_ZOONOSENISOLATE_CELL]
            ),
            phageTyping: getOptionFromCell(
                workSheet[META_ANALYSIS_PHAGETYPING_CELL]
            ),
            vaccination: getOptionFromCell(
                workSheet[META_ANALYSIS_VACCINATION_CELL]
            ),
            molecularTyping: getOptionFromCell(
                workSheet[META_ANALYSIS_MOLECULARTYPING_CELL]
            ),
            toxin: getOptionFromCell(workSheet[META_ANALYSIS_TOXIN_CELL]),
            esblAmpCCarbapenemasen: getOptionFromCell(
                workSheet[META_ANALYSIS_ESBLAMPCCARBAPENEMASEN_CELL]
            ),
            other: getOptionFromCell(workSheet[META_ANAYLSIS_OTHER_BOOL_CELL]),
            otherText: this.getStringFromCell(
                workSheet[META_ANALYSIS_OTHER_TEXT_CELL]
            ),
            compareHuman: getOptionFromCell(
                workSheet[META_ANALYSIS_COMPAREHUMAN_BOOL_CELL]
            ),
            compareHumanText: this.getStringFromCell(
                workSheet[META_ANALYSIS_COMPAREHUMAN_TEXT_CELL]
            )
        };
    }

    private getSenderFromWorkSheet(workSheet: WorkSheet): Address {
        return {
            instituteName: this.getStringFromCell(
                workSheet[META_SENDER_INSTITUTENAME_CELL]
            ),
            department: this.getStringFromCell(
                workSheet[META_SENDER_DEPARTMENT_CELL]
            ),
            street: this.getStringFromCell(workSheet[META_SENDER_STREET_CELL]),
            zip: this.getStringFromCell(workSheet[META_SENDER_ZIP_CITY_CELL])
                .split(',')[0]
                .trim(),
            city: (
                this.getStringFromCell(workSheet[META_SENDER_ZIP_CITY_CELL]) +
                ','
            )
                .split(',')[1]
                .trim(),
            contactPerson: this.getStringFromCell(
                workSheet[META_SENDER_CONTACTPERSON_CELL]
            ),
            telephone: this.getStringFromCell(
                workSheet[META_SENDER_TELEPHONE_CELL]
            ),
            email: this.getStringFromCell(workSheet[META_SENDER_EMAIL_CELL])
        };
    }

    private getUrgencyFromWorkSheet(workSheet: WorkSheet): Urgency {
        const urgency = this.getStringFromCell(workSheet[META_URGENCY_CELL]);

        switch (urgency.toLowerCase()) {
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

    private getStringFromCell(cell: CellObject): string {
        return ('' + this.getDataFromCell(cell)).trim();
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
