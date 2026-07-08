/**
 * Email-notification settings for a user. Persisted on the related User_Info
 * object (see the parse-cloud schema). Controls whether — and how often — the
 * user is informed about new BfR analysis results by email. The actual sending
 * of those emails is out of scope of this feature; only the preference is
 * stored here.
 */
export type EmailNotificationFrequency = 'daily' | 'weekly' | 'monthly';

export type EmailNotificationWeekday =
    | 'monday'
    | 'tuesday'
    | 'wednesday'
    | 'thursday'
    | 'friday';

export type EmailNotificationWeekOfMonth = '1' | '2' | '3' | '4' | 'last';

export interface EmailNotificationSettings {
    enabled: boolean;
    frequency: EmailNotificationFrequency;
    weekday: EmailNotificationWeekday;
    weekOfMonth: EmailNotificationWeekOfMonth;
}

export interface UserEmailNotificationPort {
    getEmailNotificationSettingsByEmail(
        email: string
    ): Promise<EmailNotificationSettings>;
    saveEmailNotificationSettingsByEmail(
        email: string,
        settings: EmailNotificationSettings
    ): Promise<EmailNotificationSettings>;
}

export interface UserEmailNotificationService
    extends UserEmailNotificationPort {}

export interface UserEmailNotificationRepository {
    getEmailNotificationSettingsByEmail(
        email: string
    ): Promise<EmailNotificationSettings>;
    saveEmailNotificationSettingsByEmail(
        email: string,
        settings: EmailNotificationSettings
    ): Promise<EmailNotificationSettings>;
}
