import fs from 'fs';
import { inject, injectable } from 'inversify';
import _ from 'lodash';
import { APPLICATION_TYPES } from '../../application.types';
import { FileBuffer } from '../../core/model/file.model';
import { PDFService } from '../../pdf/pdf.model';
import { NRL_ID, Urgency } from '../domain/enums';
import {
    PDFConfigProviderService,
    PDFCreatorService
} from '../model/pdf.model';
import {
    SampleSheet,
    SampleSheetAnalysis,
    SampleSheetAnalysisOption,
    SampleSheetMetaData
} from '../model/sample-sheet.model';
import { Address, Sample, SampleData } from '../model/sample.model';

@injectable()
export class DefaultPDFCreatorService implements PDFCreatorService {
    private readonly FILE_EXTENSION = '.pdf';
    private readonly MIME_TYPE = 'application/pdf';

    private readonly config = this.configProvider.config;
    private readonly strings = this.configProvider.strings;

    private logo: string;

    private get EMPTY(): {} {
        return { text: ' ' };
    }

    constructor(
        @inject(APPLICATION_TYPES.PDFService)
        private pdfService: PDFService,
        @inject(APPLICATION_TYPES.PDFConfigProviderService)
        private configProvider: PDFConfigProviderService
    ) {
        this.loadLogo();
    }

    async createPDF(sampleSheet: SampleSheet): Promise<FileBuffer> {
        const docDefinition = this.createDocDefinition(sampleSheet);

        const buffer = await this.pdfService.createPDF(
            docDefinition,
            this.configProvider.tableLayouts
        );

        return {
            buffer: buffer,
            mimeType: this.MIME_TYPE,
            extension: this.FILE_EXTENSION
        };
    }

    private loadLogo() {
        this.logo = fs.readFileSync(this.config.svgLogoPath, 'utf8').toString();
    }

    private createDocDefinition(sampleSheet: SampleSheet): {} {
        return {
            info: { ...this.config.fileInfo },
            ...this.createPageConfig(),
            defaultStyle: this.configProvider.defaultStyle,
            styles: this.configProvider.styles,
            content: this.createContent(sampleSheet),
            footer: (currentPage: number, pageCount: number) =>
                this.createFooter(currentPage, pageCount)
        };
    }

    private createPageConfig(): {} {
        const pageConfig = this.config.page;
        const margins = pageConfig.margins;
        return {
            pageSize: pageConfig.size,
            pageOrientation: pageConfig.orientation,
            pageMargins: [
                margins.left,
                margins.top,
                margins.right,
                margins.bottom
            ]
        };
    }

    private createContent(sampleSheet: SampleSheet): {}[] {
        return [
            {
                ...this.createMeta(sampleSheet.meta),
                pageBreak: 'after'
            },
            this.createSamples(sampleSheet.samples)
        ];
    }

    // Meta content

    private createMeta(metaData: SampleSheetMetaData): {} {
        return {
            stack: [
                this.createMetaMainRow(
                    this.createMetaHeader(),
                    this.EMPTY,
                    this.createMetaLogo()
                ),
                this.EMPTY,
                this.EMPTY,
                this.createMetaMainRow(
                    this.createMetaRecipient(metaData.nrl),
                    this.EMPTY,
                    this.createMetaStamp(metaData.customerRefNumber)
                ),
                this.EMPTY,
                this.createMetaMainRow(
                    this.createMetaSender(metaData.sender),
                    this.createMetaAnalysis(metaData.analysis),
                    this.EMPTY
                ),
                this.EMPTY,
                this.EMPTY,
                this.createMetaMainRow(
                    this.createMetaSignature(
                        this.strings.meta.signature.date,
                        metaData.signatureDate
                    ),
                    this.createMetaUrgency(metaData.urgency),
                    this.EMPTY
                ),
                this.EMPTY,
                this.createMetaSignatureDataProcessing(),
                this.EMPTY,
                this.createMetaMainRow(
                    this.createMetaSignature(
                        this.strings.meta.signature.signature
                    ),
                    this.EMPTY,
                    this.EMPTY
                ),
                this.EMPTY,
                this.EMPTY,
                this.createInstructions()
            ]
        };
    }

    private createMetaHeader(): {} {
        const strings = this.strings.meta.header;
        return {
            stack: [
                this.createSuperScriptedText(
                    strings.title,
                    strings.titleSup,
                    ['title'],
                    'titleSupScript'
                ),
                { text: strings.subtitle, style: 'comment', noWrap: true },
                {
                    text: strings.version + ' ' + this.config.version.toString(),
                    style: 'version'
                }
            ]
        };
    }

    private createMetaLogo(): {} {
        return {
            stack: [{ svg: this.logo, alignment: 'right' }]
        };
    }

    private createMetaRecipient(nrl: NRL_ID): {} {
        const strings = this.strings.meta.recipient;
        const nrlString = this.strings.nrl[nrl];
        return {
            stack: [
                { text: strings.title, style: 'heading1' },
                { text: strings.institute, style: 'elevated' },
                this.createMetaTable({
                    widths: ['auto', '*'],
                    body: [
                        [
                            {
                                text: strings.nrl,
                                style: 'heading3',
                                border: [false, false, true, false]
                            },
                            {
                                text: nrlString,
                                style: ['elevated', 'markedCell']
                            }
                        ]
                    ]
                }),
                { text: strings.street },
                { text: strings.place }
            ]
        };
    }

    private createMetaStamp(customerRefNumber: string): {} {
        const strings = this.strings.meta.stamp;
        return this.createMetaTable({
            widths: [0, '100%'],
            body: [
                [
                    {
                        text: strings.receiptDate,
                        style: 'heading2',
                        noWrap: true,
                        alignment: 'right',
                        border: [false, false, true, false]
                    },
                    this.EMPTY
                ],
                [
                    {
                        text: strings.customerRefNumber,
                        style: 'heading2',
                        noWrap: true,
                        alignment: 'right',
                        border: [false, false, true, false]
                    },
                    {
                        text: customerRefNumber ? customerRefNumber : ' ',
                        style: 'markedCell'
                    }
                ]
            ]
        });
    }

    private createMetaSender(address: Address): {} {
        const strings = this.strings.meta.sender;
        let place = ' ';
        const zip = address.zip;
        const city = address.city;
        if (zip !== '' && city !== '') {
            place = zip + ', ' + city;
        } else if (zip !== '') {
            place = zip;
        } else if (city !== '') {
            place = city;
        }
        return {
            stack: [
                { text: strings.title, style: 'heading1' },
                this.createMetaTable(
                    {
                        widths: ['auto', '*'],
                        body: [
                            [
                                {
                                    text: strings.instituteName,
                                    style: 'heading3'
                                },
                                { text: address.instituteName }
                            ],
                            [
                                { text: strings.department, style: 'heading3' },
                                { text: address.department }
                            ],
                            [
                                { text: strings.street, style: 'heading3' },
                                { text: address.street }
                            ],
                            [
                                { text: strings.place, style: 'heading3' },
                                { text: place }
                            ],
                            [
                                {
                                    text: strings.contactPerson,
                                    style: 'heading3'
                                },
                                { text: address.contactPerson }
                            ],
                            [
                                { text: strings.telephone, style: 'heading3' },
                                { text: address.telephone }
                            ],
                            [
                                { text: strings.email, style: 'heading3' },
                                { text: address.email }
                            ]
                        ]
                    },
                    ['markedCell']
                )
            ]
        };
    }

    private createMetaAnalysis(analysis: SampleSheetAnalysis): {} {
        const strings = this.strings.meta.analysis;
        const getStringFromOption = (
            option: SampleSheetAnalysisOption
        ): string => {
            switch (option) {
                case SampleSheetAnalysisOption.OMIT:
                    return ' ';
                case SampleSheetAnalysisOption.STANDARD:
                    return strings.options.standard;
                case SampleSheetAnalysisOption.ACTIVE:
                    return strings.options.active;
            }
        };
        const getStringFromText = (text: string): string => (text ? text : ' ');
        return {
            stack: [
                this.createSuperScriptedText(
                    strings.title,
                    strings.titleSup,
                    ['heading1'],
                    'heading1SupScript'
                ),
                this.createMetaTable({
                    widths: ['*', this.config.meta.columnGap],
                    body: [
                        [
                            { text: strings.species },
                            {
                                text: getStringFromOption(analysis.species),
                                style: 'markedCell',
                                alignment: 'center'
                            }
                        ],
                        [
                            { text: strings.serological },
                            {
                                text: getStringFromOption(analysis.serological),
                                style: 'markedCell',
                                alignment: 'center'
                            }
                        ],
                        [
                            { text: strings.phageTyping },
                            {
                                text: getStringFromOption(analysis.phageTyping),
                                style: 'markedCell',
                                alignment: 'center'
                            }
                        ],
                        [
                            { text: strings.resistance },
                            {
                                text: getStringFromOption(analysis.resistance),
                                style: 'markedCell',
                                alignment: 'center'
                            }
                        ],
                        [
                            { text: strings.vaccination },
                            {
                                text: getStringFromOption(analysis.vaccination),
                                style: 'markedCell',
                                alignment: 'center'
                            }
                        ],
                        [
                            this.createSuperScriptedText(
                                strings.molecularTyping,
                                strings.molecularTypingSup,
                                []
                            ),
                            {
                                text: getStringFromOption(
                                    analysis.molecularTyping
                                ),
                                style: 'markedCell',
                                alignment: 'center'
                            }
                        ],
                        [
                            { text: strings.toxin },
                            {
                                text: getStringFromOption(analysis.toxin),
                                style: 'markedCell',
                                alignment: 'center'
                            }
                        ],
                        [
                            { text: strings.zoonosenIsolate },
                            {
                                text: getStringFromOption(
                                    analysis.zoonosenIsolate
                                ),
                                style: 'markedCell',
                                alignment: 'center'
                            }
                        ],
                        [
                            { text: strings.esblAmpCCarbapenemasen },
                            {
                                text: getStringFromOption(
                                    analysis.esblAmpCCarbapenemasen
                                ),
                                style: 'markedCell',
                                alignment: 'center'
                            }
                        ],
                        [
                            { text: strings.other },
                            {
                                text: getStringFromOption(analysis.other),
                                style: 'markedCell',
                                alignment: 'center'
                            }
                        ],
                        [
                            {
                                text: getStringFromText(analysis.otherText),
                                colSpan: 2,
                                style: ['markedCell', 'userComment']
                            }
                        ],
                        [
                            this.createSuperScriptedText(
                                strings.compareHuman,
                                strings.compareHumanSup,
                                ['markedCell']
                            ),
                            {
                                text: getStringFromOption(
                                    analysis.compareHuman
                                ),
                                style: 'markedCell',
                                alignment: 'center'
                            }
                        ],
                        [
                            {
                                text: getStringFromText(
                                    analysis.compareHumanText
                                ),
                                colSpan: 2,
                                style: ['markedCell', 'userComment']
                            }
                        ]
                    ]
                })
            ]
        };
    }

    private createMetaSignature(text: string, value?: string): {} {
        return {
            stack: [
                this.createMetaTable({
                    widths: [this.config.meta.col11Width],
                    body: [[{ text: value ? value : ' ', style: 'markedCell' }]]
                }),
                { text: text, style: 'heading2' }
            ]
        };
    }

    private createMetaSignatureDataProcessing(): {} {
        const strings = this.strings.meta.signature;
        return {
            text: [
                { text: strings.dataProcessingText },
                {
                    text: strings.dataProcessingLink,
                    link: strings.dataProcessingLink,
                    style: 'link'
                }
            ]
        };
    }

    private createMetaUrgency(urgency: Urgency): {} {
        const strings = this.strings.meta.urgency;
        return {
            stack: [
                this.createMetaTable({
                    widths: ['auto', 'auto'],
                    body: [
                        [
                            {
                                text: strings.title,
                                style: 'heading1',
                                border: [false, false, true, false]
                            },
                            {
                                text: urgency.toString(),
                                style: ['elevated', 'markedCell']
                            }
                        ]
                    ]
                })
            ]
        };
    }

    private createInstructions(): {} {
        const strings = this.strings.meta.instructions;
        return {
            stack: [
                {
                    text: [
                        { text: strings.sendInstructions },
                        {
                            text: strings.sendInstructionsMail,
                            style: 'elevated'
                        },
                        { text: strings.sendInstructionsPost }
                    ]
                },
                { text: strings.printInstructions }
            ]
        };
    }

    // Meta content helpers

    private createMetaMainRow(col1: {}, col2: {}, col3: {}): {} {
        const metaConfig = this.config.meta;
        return {
            columns: [
                {
                    width: metaConfig.col1Width,
                    ...col1
                },
                {
                    width: metaConfig.col2Width,
                    ...col2
                },
                {
                    width: metaConfig.col3Width,
                    ...col3
                }
            ],
            columnGap: metaConfig.columnGap
        };
    }

    private createMetaTable(table: {}, styles: Array<string> = []): {} {
        const margins = this.config.meta.tableMargins;
        return {
            style: styles.concat(['cell']),
            layout: 'metaLayout',
            margin: [margins.left, margins.top, margins.right, margins.bottom],
            table: table
        };
    }

    private createSuperScriptedText(
        text: string,
        sup: string,
        style: string[],
        supStyle: string = 'defaultSupScript'
    ): {} {
        return {
            columns: [
                { text: text, width: 'auto', style: style },
                { text: sup, style: style.concat(supStyle) }
            ],
            columnGap: this.config.meta.superScriptGap
        };
    }

    // Samples content

    private createSamples(samples: Sample[]): {} {
        const widthFactors = this.config.samples.colWidthIndices.map(v => {
            return this.config.samples.colWidthFactors[v];
        });

        const widthSum = widthFactors.reduce((a: number, b: number) => a + b);
        const widths = widthFactors.map(
            v => ((v / widthSum) * 100).toString() + '%'
        );

        const body = new Array<Array<{}>>();
        body.push(this.createSamplesHeaderRow());
        samples.forEach(sample => {
            body.push(this.createSamplesDataRow(sample.getAnnotatedData()));
        });
        return {
            layout: 'samplesLayout',
            table: {
                headerRows: 1,
                widths: widths,
                body: body,
                dontBreakRows: true
            }
        };
    }

    private createSamplesHeaderRow(): {}[] {
        const titles = this.strings.samples.titles;
        const subTitles = this.strings.samples.subtitles;
        return [
            this.createSamplesHeaderCell(titles.sample_id, subTitles.sample_id),
            this.createSamplesHeaderCell(
                titles.sample_id_avv,
                subTitles.sample_id_avv
            ),
            this.createSamplesHeaderCell(
                titles.pathogen_adv,
                subTitles.pathogen_adv
            ),
            this.createSamplesHeaderCell(
                titles.pathogen_text,
                subTitles.pathogen_text
            ),
            this.createSamplesHeaderCell(
                titles.sampling_date,
                subTitles.sampling_date
            ),
            this.createSamplesHeaderCell(
                titles.isolation_date,
                subTitles.isolation_date
            ),
            this.createSamplesHeaderCell(
                titles.sampling_location_adv,
                subTitles.sampling_location_adv
            ),
            this.createSamplesHeaderCell(
                titles.sampling_location_zip,
                subTitles.sampling_location_zip
            ),
            this.createSamplesHeaderCell(
                titles.sampling_location_text,
                subTitles.sampling_location_text
            ),
            this.createSamplesHeaderCell(titles.topic_adv, subTitles.topic_adv),
            this.createSamplesHeaderCell(
                titles.matrix_adv,
                subTitles.matrix_adv
            ),
            this.createSamplesHeaderCell(
                titles.matrix_text,
                subTitles.matrix_text
            ),
            this.createSamplesHeaderCell(
                titles.process_state_adv,
                subTitles.process_state_adv
            ),
            this.createSamplesHeaderCell(
                titles.sampling_reason_adv,
                subTitles.sampling_reason_adv
            ),
            this.createSamplesHeaderCell(
                titles.sampling_reason_text,
                subTitles.sampling_reason_text
            ),
            this.createSamplesHeaderCell(
                titles.operations_mode_adv,
                subTitles.operations_mode_adv
            ),
            this.createSamplesHeaderCell(
                titles.operations_mode_text,
                subTitles.operations_mode_text
            ),
            this.createSamplesHeaderCell(titles.vvvo, subTitles.vvvo),
            this.createSamplesHeaderCell(titles.comment, subTitles.comment)
        ];
    }

    private createSamplesHeaderCell(title: string, subTitle: string): {} {
        return {
            style: 'headerCell',
            stack: [{ text: title }, { text: subTitle, style: 'subHeader' }]
        };
    }

    private createSamplesDataRow(sampleData: SampleData): Array<{}> {
        return [
            this.createSamplesDataCell(
                sampleData.sample_id.value,
                !!sampleData.sample_id.oldValue
            ),
            this.createSamplesDataCell(
                sampleData.sample_id_avv.value,
                !!sampleData.sample_id_avv.oldValue
            ),
            this.createSamplesDataCell(
                sampleData.pathogen_adv.value,
                !!sampleData.pathogen_adv.oldValue
            ),
            this.createSamplesDataCell(
                sampleData.pathogen_text.value,
                !!sampleData.pathogen_text.oldValue
            ),
            this.createSamplesDataCell(
                sampleData.sampling_date.value,
                !!sampleData.sampling_date.oldValue
            ),
            this.createSamplesDataCell(
                sampleData.isolation_date.value,
                !!sampleData.isolation_date.oldValue
            ),
            this.createSamplesDataCell(
                sampleData.sampling_location_adv.value,
                !!sampleData.sampling_location_adv.oldValue
            ),
            this.createSamplesDataCell(
                sampleData.sampling_location_zip.value,
                !!sampleData.sampling_location_zip.oldValue
            ),
            this.createSamplesDataCell(
                sampleData.sampling_location_text.value,
                !!sampleData.sampling_location_text.oldValue
            ),
            this.createSamplesDataCell(
                sampleData.topic_adv.value,
                !!sampleData.topic_adv.oldValue
            ),
            this.createSamplesDataCell(
                sampleData.matrix_adv.value,
                !!sampleData.matrix_adv.oldValue
            ),
            this.createSamplesDataCell(
                sampleData.matrix_text.value,
                !!sampleData.matrix_text.oldValue
            ),
            this.createSamplesDataCell(
                sampleData.process_state_adv.value,
                !!sampleData.process_state_adv.oldValue
            ),
            this.createSamplesDataCell(
                sampleData.sampling_reason_adv.value,
                !!sampleData.sampling_reason_adv.oldValue
            ),
            this.createSamplesDataCell(
                sampleData.sampling_reason_text.value,
                !!sampleData.sampling_reason_text.oldValue
            ),
            this.createSamplesDataCell(
                sampleData.operations_mode_adv.value,
                !!sampleData.operations_mode_adv.oldValue
            ),
            this.createSamplesDataCell(
                sampleData.operations_mode_text.value,
                !!sampleData.operations_mode_text.oldValue
            ),
            this.createSamplesDataCell(
                sampleData.vvvo.value,
                !!sampleData.vvvo.oldValue
            ),
            this.createSamplesDataCell(
                sampleData.comment.value,
                !!sampleData.comment.oldValue
            )
        ];
    }

    private createSamplesDataCell(value: string, edited: boolean): {} {
        const style = ['dataCell'];
        if (edited) {
            style.push('editedCell');
        }
        return {
            style: style,
            text: value
        };
    }

    // Footer

    private createFooter(currentPage: number, pageCount: number): {} {
        const strings = this.strings.meta.footer;
        const margins = this.config.footer.margins;
        return {
            columns: [
                { text: strings.validated },
                { text: strings.sop, alignment: 'center' },
                {
                    text:
                        strings.page +
                        ' ' +
                        currentPage.toString() +
                        ' ' +
                        strings.pageOf +
                        ' ' +
                        pageCount.toString(),
                    alignment: 'right'
                }
            ],
            style: 'footer',
            margin: [margins.left, margins.top, margins.right, margins.bottom]
        };
    }
}
