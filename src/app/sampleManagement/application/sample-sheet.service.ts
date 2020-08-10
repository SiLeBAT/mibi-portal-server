import { inject, injectable } from 'inversify';
import _ from 'lodash';
import { APPLICATION_TYPES } from '../../application.types';
import { EMPTY_ANALYSIS } from '../domain/constants';
import { NRL_ID, Urgency } from '../domain/enums';
import { NRLService } from '../model/nrl.model';
import {
    SampleSheet,
    SampleSheetAnalysis,
    SampleSheetAnalysisOption,
    SampleSheetMetaData,
    SampleSheetService
} from '../model/sample-sheet.model';
import { Analysis, Sample, SampleSet } from '../model/sample.model';

@injectable()
export class DefaultSampleSheetService implements SampleSheetService {
    private readonly EMPTY_SAMPLE_SHEET_ANALYSIS: SampleSheetAnalysis = {
        species: SampleSheetAnalysisOption.OMIT,
        phageTyping: SampleSheetAnalysisOption.OMIT,
        zoonosenIsolate: SampleSheetAnalysisOption.OMIT,
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
        if (
            this.tryGetSingleNRL(sampleSheet.samples) === sampleSheet.meta.nrl
        ) {
            this.addMetaDataToSamples(sampleSheet);
        }

        return {
            samples: sampleSheet.samples,
            meta: {
                sender: sampleSheet.meta.sender,
                fileName: sampleSheet.meta.fileName,
                customerRefNumber: sampleSheet.meta.customerRefNumber,
                signatureDate: sampleSheet.meta.signatureDate
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
            signatureDate: sampleSet.meta.signatureDate
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
            phageTyping: SampleSheetAnalysisOption.OMIT,
            zoonosenIsolate: SampleSheetAnalysisOption.OMIT,
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
