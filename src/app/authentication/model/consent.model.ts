/**
 * Data-save consent for a user. Persisted on the related User_Info object
 * (see the parse-cloud schema). `dataSaveViewed` records whether the user has
 * been asked at all; the SPA uses it to decide whether to show the consent
 * popup after login.
 */
export interface UserConsent {
    dataSaveAgreed: boolean;
    dataSaveViewed: boolean;
}

export interface UserConsentPort {
    getConsentByEmail(email: string): Promise<UserConsent>;
    saveConsentByEmail(
        email: string,
        dataSaveAgreed: boolean
    ): Promise<UserConsent>;
}

export interface UserConsentService extends UserConsentPort {}

export interface UserConsentRepository {
    getConsentByEmail(email: string): Promise<UserConsent>;
    saveConsentByEmail(
        email: string,
        dataSaveAgreed: boolean
    ): Promise<UserConsent>;
}
