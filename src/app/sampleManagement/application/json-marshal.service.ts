import * as _ from 'lodash';
// @ts-ignore
import * as XlsxPopulate from 'xlsx-populate';
import { JSONMarshalService } from '../model/excel.model';
import { FileRepository } from '../model/repository.model';
import { SampleSet, Sample, SampleSetMetaData } from '../model/sample.model';
import { ApplicationDomainError } from '../../core/domain/domain.error';
import { ApplicationSystemError } from '../../core/domain/technical.error';
import { Urgency } from '../domain/enums';
import { injectable, inject } from 'inversify';
import { APPLICATION_TYPES } from '../../application.types';
import {
    FORM_PROPERTIES,
    VALID_SHEET_NAME,
    META_NRL_CELL,
    META_URGENCY_CELL,
    META_SENDER_INSTITUTENAME_CELL,
    META_SENDER_DEPARTMENT_CELL,
    META_SENDER_STREET_CELL,
    META_SENDER_ZIP_CITY_CELL,
    META_SENDER_CONTACTPERSON_CELL,
    META_SENDER_TELEPHONE_CELL,
    META_SENDER_EMAIL_CELL,
    META_ANALYSIS_SPECIES_CELL,
    META_ANALYSIS_PHAGETYPING_CELL,
    META_ANALYSIS_SEROLOGICAL_CELL,
    META_ANALYSIS_RESISTANCE_CELL,
    META_ANALYSIS_VACCINATION_CELL,
    META_ANALYSIS_MOLECULARTYPING_CELL,
    META_ANALYSIS_TOXIN_CELL,
    META_ANALYSIS_ZOONOSENISOLATE_CELL,
    META_ANALYSIS_ESBLAMPCCARBAPENEMASEN_CELL,
    META_ANALYSIS_OTHER_CELL,
    META_ANALYSIS_COMPAREHUMAN_CELL
} from '../domain/constants';
import { NRLConstants } from '../model/nrl.model';
import { FileBuffer } from '../../core/model/file.model';

type ChangedValueCollection = Record<string, string>;

@injectable()
export class DefaultJSONMarshalService implements JSONMarshalService {
    private readonly TEMPLATE_FILE_NAME = 'Einsendebogen.xlsx';
    private readonly FILE_EXTENSION = '.xlsx';

    constructor(
        @inject(APPLICATION_TYPES.FileRepository)
        private fileRepository: FileRepository,
        @inject(APPLICATION_TYPES.NRLConstants)
        private nrlConstants: NRLConstants
    ) {}

    async convertJSONToExcel(sampleSet: SampleSet): Promise<FileBuffer> {
        const buffer = await this.fileRepository.getFileBuffer(
            this.TEMPLATE_FILE_NAME
        );

        if (!buffer) {
            throw new ApplicationSystemError('No Excel data available.');
        }

        const highlights: Record<string, string>[] = [];
        sampleSet.samples.forEach((sample: Sample) => {
            highlights.push(sample.getOldValues());
        });
        const dataToSave = this.fromDataObjToAOO(sampleSet.samples);
        let workbook = await this.fromFileToWorkbook(buffer);
        workbook = this.addValidatedDataToWorkbook(
            workbook,
            dataToSave,
            highlights
        );
        workbook = this.addMetaDataToWorkbook(workbook, sampleSet.meta);

        const workbookBuffer = await workbook.outputAsync();

        return {
            buffer: workbookBuffer,
            extension: this.FILE_EXTENSION,
            mimeType: XlsxPopulate.MIME_TYPE
        };
    }

    private async fromFileToWorkbook(buffer: Buffer) {
        const workbook = await XlsxPopulate.fromDataAsync(buffer);
        return workbook;
    }

    private fromDataObjToAOO(sampleCollection: Sample[]): string[][] {
        const dataToSave: string[][] = [];

        _.forEach(sampleCollection, (sample: Sample) => {
            const row: string[] = [];
            _.forEach(FORM_PROPERTIES, header => {
                row.push(sample.getValueFor(header));
            });
            dataToSave.push(row);
        });

        return dataToSave;
    }

    private addMetaDataToWorkbook(
        // tslint:disable-next-line: no-any
        workbook: any,
        meta: SampleSetMetaData
    ) {
        const sheet = workbook.sheet(VALID_SHEET_NAME);
        if (sheet) {
            sheet
                .cell(META_NRL_CELL)
                .value(this.nrlConstants.longNames[meta.nrl]);

            sheet
                .cell(META_URGENCY_CELL)
                .value(this.mapUregencyEnumToString(meta.urgency));

            sheet
                .cell(META_SENDER_INSTITUTENAME_CELL)
                .value(meta.sender.instituteName);
            sheet
                .cell(META_SENDER_DEPARTMENT_CELL)
                .value(meta.sender.department);
            sheet.cell(META_SENDER_STREET_CELL).value(meta.sender.street);
            sheet
                .cell(META_SENDER_ZIP_CITY_CELL)
                .value(meta.sender.zip + ', ' + meta.sender.city);
            sheet
                .cell(META_SENDER_CONTACTPERSON_CELL)
                .value(meta.sender.contactPerson);
            sheet.cell(META_SENDER_TELEPHONE_CELL).value(meta.sender.telephone);
            sheet.cell(META_SENDER_EMAIL_CELL).value(meta.sender.email);

            sheet
                .cell(META_ANALYSIS_SPECIES_CELL)
                .value(this.mapAnalysisBooleanToString(meta.analysis.species));
            sheet
                .cell(META_ANALYSIS_PHAGETYPING_CELL)
                .value(
                    this.mapAnalysisBooleanToString(meta.analysis.phageTyping)
                );
            sheet
                .cell(META_ANALYSIS_SEROLOGICAL_CELL)
                .value(
                    this.mapAnalysisBooleanToString(meta.analysis.serological)
                );
            sheet
                .cell(META_ANALYSIS_RESISTANCE_CELL)
                .value(
                    this.mapAnalysisBooleanToString(meta.analysis.resistance)
                );
            sheet
                .cell(META_ANALYSIS_VACCINATION_CELL)
                .value(
                    this.mapAnalysisBooleanToString(meta.analysis.vaccination)
                );
            sheet
                .cell(META_ANALYSIS_MOLECULARTYPING_CELL)
                .value(
                    this.mapAnalysisBooleanToString(
                        meta.analysis.molecularTyping
                    )
                );
            sheet
                .cell(META_ANALYSIS_TOXIN_CELL)
                .value(this.mapAnalysisBooleanToString(meta.analysis.toxin));
            sheet
                .cell(META_ANALYSIS_ZOONOSENISOLATE_CELL)
                .value(
                    this.mapAnalysisBooleanToString(
                        meta.analysis.zoonosenIsolate
                    )
                );
            sheet
                .cell(META_ANALYSIS_ESBLAMPCCARBAPENEMASEN_CELL)
                .value(
                    this.mapAnalysisBooleanToString(
                        meta.analysis.esblAmpCCarbapenemasen
                    )
                );
            sheet.cell(META_ANALYSIS_OTHER_CELL).value(meta.analysis.other);
            sheet
                .cell(META_ANALYSIS_COMPAREHUMAN_CELL)
                .value(
                    this.mapAnalysisBooleanToString(meta.analysis.compareHuman)
                );
        }

        return workbook;
    }

    private mapAnalysisBooleanToString(analysis: boolean): string {
        return analysis ? 'x' : '';
    }
    private mapUregencyEnumToString(urgency: Urgency): string {
        switch (urgency) {
            case Urgency.URGENT:
                return 'EILT';
            case Urgency.NORMAL:
            default:
                return 'NORMAL';
        }
    }

    private addValidatedDataToWorkbook(
        // tslint:disable-next-line: no-any
        workbook: any,
        dataToSave: string[][],
        highlights: ChangedValueCollection[] = []
    ) {
        const searchTerm = 'Ihre Probe-';
        const sheet = workbook.sheet(VALID_SHEET_NAME);

        if (sheet) {
            const startCol = 'A';
            const endCol = String.fromCharCode(
                startCol.charCodeAt(0) + FORM_PROPERTIES.length
            );
            const result = sheet.find(searchTerm);
            if (result.length > 0) {
                const cell = result[0];
                const rowNumber = cell.row().rowNumber();

                for (
                    let i = rowNumber + 1;
                    i <= rowNumber + dataToSave.length;
                    i++
                ) {
                    for (let j = 1; j <= FORM_PROPERTIES.length; j++) {
                        const cell2 = sheet.row(i).cell(j);
                        cell2.value(undefined);
                    }
                }

                const startRow = rowNumber + 1;
                const startCell = startCol + startRow;
                sheet.cell(startCell).value(dataToSave);
                try {
                    const endCell = endCol + (startRow + dataToSave.length);
                    const rng = sheet.range(startCell + ':' + endCell);
                    rng.style({ fill: 'ffffff' });
                    this.highlightEdits(sheet, highlights, startCol, startRow);
                } catch (e) {
                    throw new ApplicationDomainError(
                        'Unable to apply styling to Excel'
                    );
                }
            }
        }
        return workbook;
    }

    // tslint:disable-next-line: no-any
    private highlightEdits(
        // tslint:disable-next-line: no-any
        sheet: any,
        highlights: ChangedValueCollection[],
        startCol: string,
        startRow: number
    ) {
        _.forEach(highlights, (row, index) => {
            if (!_.isEmpty(row)) {
                _.forEach(row, (v, k) => {
                    const col = _.findIndex(FORM_PROPERTIES, e => e === k);
                    if (col !== -1) {
                        const changedCol = String.fromCharCode(
                            startCol.charCodeAt(0) + col
                        );
                        sheet
                            .cell(changedCol + (startRow + index))
                            .style({ fill: '0de5cf' });
                    }
                });
            }
        });
    }
}
