import {
    UserConsent,
    UserConsentRepository,
    UserConsentService
} from '../model/consent.model';

export class DefaultUserConsentService implements UserConsentService {
    constructor(private userConsentRepository: UserConsentRepository) {}

    async getConsentByEmail(email: string): Promise<UserConsent> {
        return this.userConsentRepository.getConsentByEmail(email);
    }

    async saveConsentByEmail(
        email: string,
        dataSaveAgreed: boolean
    ): Promise<UserConsent> {
        return this.userConsentRepository.saveConsentByEmail(
            email,
            dataSaveAgreed
        );
    }
}
