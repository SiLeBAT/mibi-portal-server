import * as Parse from 'parse/node';
import {
    EmailNotificationFrequency,
    EmailNotificationSettings,
    EmailNotificationWeekOfMonth,
    EmailNotificationWeekday,
    UserEmailNotificationRepository
} from '../../../../app/authentication/model/email-notification.model';
import { logger } from '../../../../aspects';

const ENABLED = 'emailNotificationsEnabled';
const FREQUENCY = 'emailNotificationFrequency';
const WEEKDAY = 'emailNotificationWeekday';
const WEEK_OF_MONTH = 'emailNotificationWeekOfMonth';

export class ParseDefaultUserEmailNotificationRepository
    implements UserEmailNotificationRepository
{
    async getEmailNotificationSettingsByEmail(
        email: string
    ): Promise<EmailNotificationSettings> {
        const user = await this.findUser(email);
        const userInfo = user
            ? await this.findUserInfoForUser(user)
            : undefined;
        return toSettings(userInfo);
    }

    async saveEmailNotificationSettingsByEmail(
        email: string,
        settings: EmailNotificationSettings
    ): Promise<EmailNotificationSettings> {
        const user = await this.findUser(email);
        if (!user) {
            throw new Error(
                `No _User found for ${email}; cannot save email notification settings.`
            );
        }
        const userInfo = await this.findUserInfoForUser(user);
        if (!userInfo) {
            // Existing accounts always have a User_Info row; a missing one means
            // the user pre-dates the related-info migration or the row was lost.
            throw new Error(
                `No User_Info found for user ${email}; cannot save email notification settings.`
            );
        }
        userInfo.set(ENABLED, settings.enabled);
        userInfo.set(FREQUENCY, settings.frequency);
        userInfo.set(WEEKDAY, settings.weekday);
        userInfo.set(WEEK_OF_MONTH, settings.weekOfMonth);
        const saved = await userInfo.save(null, { useMasterKey: true });

        return toSettings(saved);
    }

    private async findUser(email: string): Promise<Parse.User | undefined> {
        const user = await new Parse.Query(Parse.User)
            .equalTo('username', email)
            .first({ useMasterKey: true });
        if (!user) {
            logger.warn(
                `${ParseDefaultUserEmailNotificationRepository.name}.findUser, no _User found for ${email}`
            );
            return undefined;
        }
        return user;
    }

    private async findUserInfoForUser(
        user: Parse.User
    ): Promise<Parse.Object | undefined> {
        return new Parse.Query('User_Info')
            .equalTo('user', user)
            .first({ useMasterKey: true });
    }
}

function toSettings(userInfo?: Parse.Object): EmailNotificationSettings {
    return {
        enabled: userInfo?.get(ENABLED) ?? false,
        frequency: (userInfo?.get(FREQUENCY) ??
            'daily') as EmailNotificationFrequency,
        weekday: (userInfo?.get(WEEKDAY) ??
            'monday') as EmailNotificationWeekday,
        weekOfMonth: (userInfo?.get(WEEK_OF_MONTH) ??
            '1') as EmailNotificationWeekOfMonth
    };
}
