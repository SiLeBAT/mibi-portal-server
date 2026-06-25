import { UserConsentRepository } from '../../../app/authentication/model/consent.model';

export function getMockUserConsentRepository(): UserConsentRepository {
    return {
        getConsentByEmail: jest
            .fn()
            .mockResolvedValue({ dataSaveAgreed: false, dataSaveViewed: false }),
        saveConsentByEmail: jest
            .fn()
            .mockResolvedValue({ dataSaveAgreed: false, dataSaveViewed: true })
    };
}
