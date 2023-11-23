import { injectable, inject } from 'inversify';
import { SampleSet, Analysis, Sample } from '../model/sample.model';
import { EMPTY_ANALYSIS } from '../domain/constants';
import _ from 'lodash';
import {
    SampleSheetService,
    SampleSheet,
    SampleSheetMetaData,
    SampleSheetAnalysis,
    SampleSheetAnalysisOption
} from '../model/sample-sheet.model';
import { NRL_ID, Urgency } from '../domain/enums';
import { APPLICATION_TYPES } from '../../application.types';
import { NRLService } from '../model/nrl.model';

@injectable()
export class DefaultSampleSheetService implements SampleSheetService {
    private readonly EMPTY_SAMPLE_SHEET_ANALYSIS: SampleSheetAnalysis = {
        species: SampleSheetAnalysisOption.OMIT,
        serological: SampleSheetAnalysisOption.OMIT,
        resistance: SampleSheetAnalysisOption.OMIT,
        vaccination: SampleSheetAnalysisOption.OMIT,
        molecularTyping: SampleSheetAnalysisOption.OMIT,
        toxin: SampleSheetAnalysisOption.OMIT,
        esblAmpCCarbapenemasen: SampleSheetAnalysisOption.OMIT,
        other: SampleSheetAnalysisOption.OMIT,
        otherText: '',
        compareHuman: SampleSheetAnalysisOption.OMIT,
        compareHumanText: ''
    };

    constructor(
        @inject(APPLICATION_TYPES.NRLService)
        private nrlService: NRLService
    ) {}

    fromSampleSetToSampleSheet(sampleSet: SampleSet): SampleSheet {
        return {
            samples: sampleSet.samples,
            meta: this.getSampleSheetMetaFromSampleSet(sampleSet)
        };
    }

    fromSampleSheetToSampleSet(sampleSheet: SampleSheet): SampleSet {
        const returnNrl = this.tryGetSingleNRL(sampleSheet.samples);
        const isInEnum = Object.values(NRL_ID).includes(returnNrl);
        const isNotUnknown = returnNrl !== NRL_ID.UNKNOWN;

        if (isInEnum && isNotUnknown) {
            this.addMetaDataToSamples(sampleSheet);
        }

        return {
            samples: sampleSheet.samples,
            meta: {
                sender: sampleSheet.meta.sender,
                fileName: sampleSheet.meta.fileName,
                customerRefNumber: sampleSheet.meta.customerRefNumber,
                signatureDate: sampleSheet.meta.signatureDate,
                version: sampleSheet.meta.version
            }
        };
    }

    private getSampleSheetMetaFromSampleSet(
        sampleSet: SampleSet
    ): SampleSheetMetaData {
        let nrl = this.tryGetSingleNRL(sampleSet.samples);
        let analysis = this.EMPTY_SAMPLE_SHEET_ANALYSIS;
        let urgency = Urgency.NORMAL;

        if (nrl !== NRL_ID.UNKNOWN) {
            analysis = this.calcSampleSheetAnalysis(
                nrl,
                sampleSet.samples.map(s => s.getAnalysis())
            );
            urgency = this.calcSampleSheetUrgency(
                sampleSet.samples.map(s => s.getUrgency())
            );
        }

        return {
            nrl,
            analysis,
            sender: sampleSet.meta.sender,
            urgency,
            fileName: sampleSet.meta.fileName,
            customerRefNumber: sampleSet.meta.customerRefNumber,
            signatureDate: sampleSet.meta.signatureDate,
            version: sampleSet.meta.version
        };
    }

    // sample specific meta data not implemented yet,
    // so use the first samples analysis
    private calcSampleSheetAnalysis(
        nrl: NRL_ID,
        partialAnalysis: Partial<Analysis>[]
    ): SampleSheetAnalysis {
        const firstAnalysis = partialAnalysis[0];

        // an analysis is valid if it is not undefined
        // other and comparehuman are always undefined (so always optional?)
        const standardAnalysis = this.nrlService.getStandardAnalysisFor(nrl);
        const optionalAnalysis = this.nrlService.getOptionalAnalysisFor(nrl);

        const getOptionFor = (
            key: keyof Analysis
        ): SampleSheetAnalysisOption => {
            if (standardAnalysis[key] !== undefined) {
                return SampleSheetAnalysisOption.STANDARD;
            }
            if (optionalAnalysis[key] === undefined) {
                return SampleSheetAnalysisOption.OMIT;
            }

            // analysis is optional
            return firstAnalysis[key] === true
                ? SampleSheetAnalysisOption.ACTIVE
                : SampleSheetAnalysisOption.OMIT;
        };

        const isCompareHumanActive = firstAnalysis['compareHuman']
            ? firstAnalysis['compareHuman'].active ||
              !!firstAnalysis['compareHuman'].value
            : false;
        const compareHumanText = firstAnalysis['compareHuman']
            ? firstAnalysis['compareHuman'].value
            : '';

        const otherText = firstAnalysis['other'] || '';

        return {
            species: getOptionFor('species'),
            serological: getOptionFor('serological'),
            resistance: getOptionFor('resistance'),
            vaccination: getOptionFor('vaccination'),
            molecularTyping: getOptionFor('molecularTyping'),
            toxin: getOptionFor('toxin'),
            esblAmpCCarbapenemasen: getOptionFor('esblAmpCCarbapenemasen'),
            other: otherText
                ? SampleSheetAnalysisOption.ACTIVE
                : SampleSheetAnalysisOption.OMIT,
            otherText: otherText,
            compareHuman: isCompareHumanActive
                ? SampleSheetAnalysisOption.ACTIVE
                : SampleSheetAnalysisOption.OMIT,
            compareHumanText: compareHumanText
        };
    }

    // sample specific meta data not implemented yet,
    // so use the first samples urgency
    private calcSampleSheetUrgency(urgencies: Urgency[]): Urgency {
        return urgencies[0];
    }

    private tryGetSingleNRL(samples: Sample[]): NRL_ID {
        const nrls = _.uniq(samples.map(s => s.getNRL()));
        return nrls.length === 1 ? nrls[0] : NRL_ID.UNKNOWN;
    }

    private addMetaDataToSamples(sampleSheet: SampleSheet) {
        sampleSheet.samples.forEach(sample => {
            sample.setAnalysis(
                this.nrlService,
                this.fromSampleSheetAnalysisToSampleAnalysis(
                    sampleSheet.meta.analysis
                )
            );
            sample.setUrgency(sampleSheet.meta.urgency);
        });
    }

    private fromSampleSheetAnalysisToSampleAnalysis(
        analysis: SampleSheetAnalysis
    ): Analysis {
        return {
            ...EMPTY_ANALYSIS,
            ...{
                species: analysis.species !== SampleSheetAnalysisOption.OMIT,
                serological:
                    analysis.serological !== SampleSheetAnalysisOption.OMIT,
                resistance:
                    analysis.resistance !== SampleSheetAnalysisOption.OMIT,
                vaccination:
                    analysis.vaccination !== SampleSheetAnalysisOption.OMIT,
                molecularTyping:
                    analysis.molecularTyping !== SampleSheetAnalysisOption.OMIT,
                toxin: analysis.toxin !== SampleSheetAnalysisOption.OMIT,
                esblAmpCCarbapenemasen:
                    analysis.esblAmpCCarbapenemasen !==
                    SampleSheetAnalysisOption.OMIT,
                other: analysis.otherText,
                compareHuman: {
                    active:
                        analysis.compareHuman !==
                            SampleSheetAnalysisOption.OMIT ||
                        analysis.compareHumanText !== '',
                    value: analysis.compareHumanText
                }
            }
        };
    }
}
