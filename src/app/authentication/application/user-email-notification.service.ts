import {
    EmailNotificationSettings,
    UserEmailNotificationRepository,
    UserEmailNotificationService
} from '../model/email-notification.model';

export class DefaultUserEmailNotificationService
    implements UserEmailNotificationService
{
    constructor(
        private userEmailNotificationRepository: UserEmailNotificationRepository
    ) {}

    async getEmailNotificationSettingsByEmail(
        email: string
    ): Promise<EmailNotificationSettings> {
        return this.userEmailNotificationRepository.getEmailNotificationSettingsByEmail(
            email
        );
    }

    async saveEmailNotificationSettingsByEmail(
        email: string,
        settings: EmailNotificationSettings
    ): Promise<EmailNotificationSettings> {
        return this.userEmailNotificationRepository.saveEmailNotificationSettingsByEmail(
            email,
            settings
        );
    }
}
