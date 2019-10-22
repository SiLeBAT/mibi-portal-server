import { EditValue } from './autocorrection.model';
import { ValidationError, ValidationErrorCollection } from './validation.model';
import { User } from '../../authentication/model/user.model';
import { Institute } from '../../authentication/model/institute.model';
import { ExcelFileInfo } from './excel.model';
import { Urgency, NRL_ID, ReceiveAs } from '../domain/enums';

export type SamplePropertyValues = Record<SampleProperty, string>;
export type SampleProperty = keyof SampleData;
export type SampleDataValues = Record<SampleProperty, SampleDataEntry>;
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
    getUrgency(): Urgency;
    setUrgency(urgency: Urgency): void;
    setNRL(nrl: NRL_ID): void;
    getNRL(): NRL_ID;
    getAnalysis(): Partial<Analysis>;
    setAnalysis(analysis: Partial<Analysis>): void;
    getValueFor(property: SampleProperty): string;
    getEntryFor(property: SampleProperty): AnnotatedSampleDataEntry;
    getOldValues(): Record<string, EditValue>;
    clone(): Sample;
    getAnnotatedData(): SampleData;
    getDataValues(): SampleDataValues;
    addErrorTo(id: string, errors: ValidationError): void;
    addCorrectionTo(id: string, correctionOffer: string[]): void;
    isValid(): boolean;
    addErrors(errors: ValidationErrorCollection): void;
    isZoMo(): boolean;
    getErrorCount(level: number): number;
    clearSingleCorrectionSuggestions(): void;
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
