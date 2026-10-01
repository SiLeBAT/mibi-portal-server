import { EmailNotificationSettings } from '../../../app/ports';
import { OrderDTO } from './shared-dto.model';

export interface ResetRequestDTO {
    readonly email: string;
    readonly legacySystem?: boolean;
}

export interface NewPasswordRequestDTO {
    readonly password: string;
    readonly legacySystem?: boolean;
}
export interface RegistrationDetailsDTO {
    readonly email: string;
    readonly firstName: string;
    readonly instituteId: string;
    readonly lastName: string;
    readonly password: string;
    readonly legacySystem?: boolean;
    readonly userAgent?: string;
    readonly host?: string;
}

export interface UserConsentRequestDTO {
    readonly dataSaveAgreed: boolean;
}

export type UserEmailNotificationRequestDTO = EmailNotificationSettings;

export interface PutSamplesJSONRequestDTO {
    readonly order: OrderDTO;
}

export interface PostSubmittedRequestDTO {
    readonly order: OrderDTO;
    readonly comment?: string;
    readonly receiveAs?: string;
}

export interface RedirectedPostSubmittedRequestDTO
    extends PostSubmittedRequestDTO {
    readonly userEmail: string;
}

export interface PutValidatedRequestDTO {
    readonly order: OrderDTO;
}

export interface RedirectedPutValidatedRequestDTO
    extends PutValidatedRequestDTO {
    readonly userEmail: string | null;
}

export interface RedirectedCreateOrderListRequestDTO {
    readonly userEmail: string;
}

export interface RedirectedGetSamplesWithResultsRequestDTO {
    readonly orderId: string;
    readonly userEmail: string;
}

export interface RedirectedDeleteOrdersRequestDTO {
    readonly userEmail: string;
}

/**
 * Body of POST /v2/orders/results: an array in which each element is one
 * result, keyed by the Parse objectId of the sample it belongs to.
 *
 * An array rather than an object keyed by sample id, because a sample may have
 * more than one result and a JSON object cannot hold the same key twice —
 * duplicate keys are silently dropped when the body is parsed.
 */
export type StoreResultsRequestDTO = Record<string, Record<string, string>>[];

/**
 * Parse cloud function parameters are always an object, so the array is sent
 * wrapped rather than as the top-level value.
 */
export interface RedirectedStoreResultsRequestDTO {
    readonly results: StoreResultsRequestDTO;
}
