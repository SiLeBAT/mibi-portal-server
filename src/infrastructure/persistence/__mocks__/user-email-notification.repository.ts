import { UserEmailNotificationRepository } from '../../../app/authentication/model/email-notification.model';

const DEFAULT_SETTINGS = {
    enabled: false,
    frequency: 'daily',
    weekday: 'monday',
    weekOfMonth: '1'
};

export function getMockUserEmailNotificationRepository(): UserEmailNotificationRepository {
    return {
        getEmailNotificationSettingsByEmail: jest
            .fn()
            .mockResolvedValue({ ...DEFAULT_SETTINGS }),
        saveEmailNotificationSettingsByEmail: jest
            .fn()
            .mockResolvedValue({ ...DEFAULT_SETTINGS })
    };
}
