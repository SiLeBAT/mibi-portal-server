import { CorrectionSuggestions, EditValue } from './autocorrection.model';
import { ValidationError, ValidationErrorCollection } from './validation.model';
import { User } from '../../authentication/model/user.model';
import { Institute } from '../../authentication/model/institute.model';

export interface SampleData {
    sample_id: string;
    sample_id_avv: string;
    pathogen_adv: string;
    pathogen_text: string;
    sampling_date: string;
    isolation_date: string;
    sampling_location_adv: string;
    sampling_location_zip: string;
    sampling_location_text: string;
    topic_adv: string;
    matrix_adv: string;
    matrix_text: string;
    process_state_adv: string;
    sampling_reason_adv: string;
    sampling_reason_text: string;
    operations_mode_adv: string;
    operations_mode_text: string;
    vvvo: string;
    comment: string;
}

export interface Sample {
    readonly pathogenIdAVV?: string;
    readonly pathogenId?: string;
    correctionSuggestions: CorrectionSuggestions[];
    edits: Record<string, EditValue>;
    clone(): Sample;
    getData(): SampleData;
    correctField(key: keyof SampleData, value: string): void;
    setErrors(errors: ValidationErrorCollection): void;
    addErrorTo(id: string, errors: ValidationError): void;
    getErrors(): ValidationErrorCollection;
    addErrors(errors: ValidationErrorCollection): void;
    isZoMo(): boolean;
}

export interface DatasetFile {
    originalname: string;
    encoding: string;
    mimetype: string;
    size: number;
    buffer: Buffer;
}

export interface SenderInfo {
    email: string;
    instituteId: string;
    comment: string;
    recipient: string;
}

export interface DatasetPort {
    sendDatasetFile(dataset: DatasetFile, senderInfo: SenderInfo): void;
}

export interface DatasetService extends DatasetPort {}

export interface ResolvedSenderInfo {
    user: User;
    institute: Institute;
    comment: string;
    recipient: string;
}

export interface SampleCollection {
    samples: Sample[];
}
