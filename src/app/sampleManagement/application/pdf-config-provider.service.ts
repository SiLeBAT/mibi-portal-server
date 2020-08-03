import {
    PDFConfigProviderService,
    PDFConstants,
    SampleSheetPDFConfig
} from '../model/pdf.model';
import _ from 'lodash';
import { injectable, inject } from 'inversify';
import { APPLICATION_TYPES } from '../../application.types';
import {
    SampleSheetConfig,
    SampleSheetMetaStrings,
    SampleSheetSamplesStrings,
    SampleSheetConstants,
    SampleSheetNRLStrings
} from '../model/sample-sheet.model';

@injectable()
export class DefaultPDFConfigProviderService
    implements PDFConfigProviderService {
    // mmToInch * inchToPixel
    private readonly MM_TO_PIXEL = 0.0393701 * 72;

    private readonly _config = {
        ..._.cloneDeep(this.constants.config),
        ..._.cloneDeep(this.pdfConstants.config)
    };
    private readonly _defaultStyle = _.cloneDeep(this.constants.defaultStyle);
    private readonly _styles = {
        ..._.cloneDeep(this.constants.styles),
        ..._.cloneDeep(this.pdfConstants.styles)
    };
    private _tableLayouts: {};

    get config(): SampleSheetConfig & SampleSheetPDFConfig {
        return this._config;
    }

    get defaultStyle(): {} {
        return this._defaultStyle;
    }

    get styles(): {} {
        return this._styles;
    }

    get tableLayouts(): {} {
        return this._tableLayouts;
    }

    get strings(): {
        meta: SampleSheetMetaStrings;
        samples: SampleSheetSamplesStrings;
        nrl: SampleSheetNRLStrings;
    } {
        return {
            meta: this.constants.metaStrings,
            samples: this.constants.samplesStrings,
            nrl: this.constants.nrlStrings
        };
    }

    constructor(
        @inject(APPLICATION_TYPES.SampleSheetConstants)
        private constants: SampleSheetConstants,
        @inject(APPLICATION_TYPES.PDFConstants)
        private pdfConstants: PDFConstants
    ) {
        this.preProcessStyles();
        this.preProcessConfig();

        this._tableLayouts = {
            metaLayout: this.createMetaTableLayout(),
            samplesLayout: this.createSamplesTableLayout()
        };
    }

    // Preprocessing

    private preProcessStyles() {
        this.preProcessStyle(this.defaultStyle);
        _.forEach(this.styles, v => this.preProcessStyle(v));
    }

    private preProcessStyle(style: {}) {
        if (style.hasOwnProperty('fontSize')) {
            (style as { fontSize: number }).fontSize *= this.config.scale;
        }
    }

    private preProcessConfig() {
        this.preProcessMargins(this.config.page.margins, false);
        this.preProcessMargins(this.config.footer.margins, false);

        this.preProcessMargins(this.config.meta.tableMargins, true);
        this.preProcessMargins(this.config.meta.cellPadding, true);
        this.preProcessMargins(this.config.samples.cellPadding, true);

        const scale = this.MM_TO_PIXEL * this.config.scale;
        this.config.meta.columnGap *= scale;
        this.config.meta.superScriptGap *= scale;
    }

    private preProcessMargins(
        margins: {
            left?: number;
            right?: number;
            top?: number;
            bottom?: number;
        },
        doScaling: boolean
    ) {
        let scale = this.MM_TO_PIXEL;
        if (doScaling) {
            scale *= this.config.scale;
        }

        if (margins.left) {
            margins.left *= scale;
        }
        if (margins.right) {
            margins.right *= scale;
        }
        if (margins.top) {
            margins.top *= scale;
        }
        if (margins.bottom) {
            margins.bottom *= scale;
        }
    }

    // Table layouts

    private createMetaTableLayout(): {} {
        const tableConfig = this.config.table;
        return {
            hLineWidth: () => tableConfig.thinBorder,
            vLineWidth: () => tableConfig.thinBorder,
            ...this.createTableLayoutPaddingFunctions(
                this.config.meta.cellPadding
            )
        };
    }

    private createSamplesTableLayout(): {} {
        const tableConfig = this.config.table;
        const doThickLines = this.config.samples.colThickLines;
        return {
            // tslint:disable-next-line:no-any
            hLineWidth: (i: number, node: any) => {
                if (
                    i === 0 ||
                    i === node.table.body.length ||
                    i === node.table.headerRows
                ) {
                    return tableConfig.thickBorder;
                } else {
                    return tableConfig.thinBorder;
                }
            },
            // tslint:disable-next-line:no-any
            vLineWidth: (i: number, node: any) => {
                if (
                    i === 0 ||
                    i === node.table.widths.length ||
                    doThickLines[i - 1]
                ) {
                    return tableConfig.thickBorder;
                } else {
                    return tableConfig.thinBorder;
                }
            },
            ...this.createTableLayoutPaddingFunctions(
                this.config.samples.cellPadding
            )
        };
    }

    private createTableLayoutPaddingFunctions(padding: {
        left?: number;
        right?: number;
        top?: number;
        bottom?: number;
    }): {} {
        let paddingOps = {};
        if (padding.left !== undefined) {
            paddingOps = { ...paddingOps, paddingLeft: () => padding.left };
        }
        if (padding.right !== undefined) {
            paddingOps = { ...paddingOps, paddingRight: () => padding.right };
        }
        if (padding.top !== undefined) {
            paddingOps = { ...paddingOps, paddingTop: () => padding.top };
        }
        if (padding.bottom !== undefined) {
            paddingOps = { ...paddingOps, paddingBottom: () => padding.bottom };
        }
        return paddingOps;
    }
}
