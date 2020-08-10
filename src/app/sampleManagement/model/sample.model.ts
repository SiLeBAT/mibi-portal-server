import { Institute } from '../../authentication/model/institute.model';
import { User } from '../../authentication/model/user.model';
import { NRL_ID, ReceiveAs, Urgency } from '../domain/enums';
import { EditValue } from './autocorrection.model';
import { ExcelFileInfo } from './excel.model';
import { NRLService } from './nrl.model';
import { ValidationError, ValidationErrorCollection } from './validation.model';

export type SampleDataValues = Record<SampleProperty, string>;
export type SampleProperty = keyof SampleData;
export type SampleDataEntries = Record<SampleProperty, SampleDataEntry>;
export interface SampleDataEntry {
    value: string;
}

export interface AnnotatedSampleDataEntry extends SampleDataEntry {
    errors: SampleValidationError[];
    correctionOffer: string[];
    oldValue?: string;
}

export interface SampleData {
    sample_id: AnnotatedSampleDataEntry;
    sample_id_avv: AnnotatedSampleDataEntry;
    pathogen_adv: AnnotatedSampleDataEntry;
    pathogen_text: AnnotatedSampleDataEntry;
    sampling_date: AnnotatedSampleDataEntry;
    isolation_date: AnnotatedSampleDataEntry;
    sampling_location_adv: AnnotatedSampleDataEntry;
    sampling_location_zip: AnnotatedSampleDataEntry;
    sampling_location_text: AnnotatedSampleDataEntry;
    topic_adv: AnnotatedSampleDataEntry;
    matrix_adv: AnnotatedSampleDataEntry;
    matrix_text: AnnotatedSampleDataEntry;
    process_state_adv: AnnotatedSampleDataEntry;
    sampling_reason_adv: AnnotatedSampleDataEntry;
    sampling_reason_text: AnnotatedSampleDataEntry;
    operations_mode_adv: AnnotatedSampleDataEntry;
    operations_mode_text: AnnotatedSampleDataEntry;
    vvvo: AnnotatedSampleDataEntry;
    comment: AnnotatedSampleDataEntry;
    [key: string]: AnnotatedSampleDataEntry;
}

export interface SampleMetaData {
    nrl: NRL_ID;
    urgency: Urgency;
    analysis: Partial<Analysis>;
}

export interface Address {
    instituteName: string;
    department?: string;
    street: string;
    zip: string;
    city: string;
    contactPerson: string;
    telephone: string;
    email: string;
}

export interface Analysis {
    species: boolean;
    serological: boolean;
    resistance: boolean;
    vaccination: boolean;
    molecularTyping: boolean;
    toxin: boolean;
    esblAmpCCarbapenemasen: boolean;
    sample: boolean;
    other: string;
    compareHuman: {
        value: string;
        active: boolean;
    };
}

export interface SampleSetMetaData {
    sender: Address;
    fileName: string;
    customerRefNumber: string;
    signatureDate: string;
}

export interface SampleSet {
    samples: Sample[];
    meta: SampleSetMetaData;
}

export interface SampleValidationError {
    code: number;
    level: number;
    message: string;
}

export interface Sample {
    readonly pathogenIdAVV?: string;
    readonly pathogenId?: string;
    readonly meta: SampleMetaData;
    getUrgency(): Urgency;
    setUrgency(urgency: Urgency): void;
    setNRL(nrlService: NRLService, nrl: NRL_ID): void;
    getNRL(): NRL_ID;
    getAnalysis(): Partial<Analysis>;
    setAnalysis(nrlService: NRLService, analysis: Partial<Analysis>): void;
    getValueFor(property: SampleProperty): string;
    getEntryFor(property: SampleProperty): AnnotatedSampleDataEntry;
    getOldValues(): Record<SampleProperty, EditValue>;
    clone(): Sample;
    getAnnotatedData(): SampleData;
    getDataEntries(): SampleDataEntries;
    addErrorTo(property: SampleProperty, errors: ValidationError): void;
    addCorrectionTo(property: SampleProperty, correctionOffer: string[]): void;
    isValid(): boolean;
    addErrors(errors: ValidationErrorCollection): void;
    isZoMo(): boolean;
    getErrorCount(level: number): number;
    applySingleCorrectionSuggestions(): void;
}

interface RecipientInfo {
    name: string;
    email: string;
}
export interface ApplicantMetaData {
    user: User;
    comment: string;
    receiveAs: ReceiveAs;
}

export interface SamplePort {
    sendSamples(
        sampleSet: SampleSet,
        applicantMetaData: ApplicantMetaData
    ): Promise<void>;
    convertToJson(
        buffer: Buffer,
        fileName: string,
        token: string | null
    ): Promise<SampleSet>;
    convertToExcel(sampleSet: SampleSet): Promise<ExcelFileInfo>;
}

export interface SampleService extends SamplePort {}

export interface OrderNotificationMetaData extends ApplicantMetaData {
    recipient: RecipientInfo;
}

interface BaseDatasetNotificationPayload {
    appName: string;
    comment: string;
}
export interface NewDatasetNotificationPayload
    extends BaseDatasetNotificationPayload {
    firstName: string;
    lastName: string;
    email: string;
    institution: Institute;
}

export interface NewDatasetCopyNotificationPayload
    extends BaseDatasetNotificationPayload {
    name: string;
}

export interface SampleFactory {
    createSample(data: SampleData): Sample;
}
