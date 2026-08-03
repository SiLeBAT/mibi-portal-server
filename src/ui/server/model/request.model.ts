import { EmailNotificationSettings } from '../../../app/ports';
import { OrderDTO, ParsedSampleSheetDTO } from './shared-dto.model';

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

/**
 * MPS-312: body of PUT /v2/samples when the client sends the browser-parsed sample
 * sheet. Raw .xlsx uploads are rejected by DefaultSamplesController.
 */
export interface PutSamplesParsedSheetRequestDTO {
    readonly parsedSampleSheet: ParsedSampleSheetDTO;
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
