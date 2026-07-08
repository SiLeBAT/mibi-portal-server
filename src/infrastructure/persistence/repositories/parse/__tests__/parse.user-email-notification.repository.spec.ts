const mockFirst = jest.fn();

jest.mock('parse/node', () => {
    class User {}
    class Query {
        target: unknown;
        constructor(target: unknown) {
            this.target = target;
        }
        equalTo() {
            return this;
        }
        first() {
            return mockFirst(this.target);
        }
    }
    return { __esModule: true, User, Query };
});

import * as Parse from 'parse/node';
import { EmailNotificationSettings } from '../../../../../app/authentication/model/email-notification.model';
import { ParseDefaultUserEmailNotificationRepository } from '../parse.user-email-notification.repository';

describe('ParseDefaultUserEmailNotificationRepository', () => {
    const user = { id: 'user-1' };
    const settings: EmailNotificationSettings = {
        enabled: true,
        frequency: 'weekly',
        weekday: 'wednesday',
        weekOfMonth: '1'
    };

    let userInfoStore: Record<string, unknown>;
    let userInfoSet: jest.Mock;
    let userInfo: { set: jest.Mock; save: jest.Mock; get: (k: string) => unknown };

    beforeEach(() => {
        jest.clearAllMocks();
        userInfoStore = {};
        userInfoSet = jest.fn((key: string, value: unknown) => {
            userInfoStore[key] = value;
        });
        userInfo = {
            set: userInfoSet,
            get: (key: string) => userInfoStore[key],
            save: jest.fn().mockImplementation(() => Promise.resolve(userInfo))
        };

        mockFirst.mockImplementation((target: unknown) =>
            Promise.resolve(
                target === Parse.User
                    ? user
                    : target === 'User_Info'
                      ? userInfo
                      : undefined
            )
        );
    });

    it('persists all four email-notification fields on the User_Info row', async () => {
        const repo = new ParseDefaultUserEmailNotificationRepository();

        const result = await repo.saveEmailNotificationSettingsByEmail(
            'user@example.com',
            settings
        );

        expect(userInfoSet).toHaveBeenCalledWith(
            'emailNotificationsEnabled',
            true
        );
        expect(userInfoSet).toHaveBeenCalledWith(
            'emailNotificationFrequency',
            'weekly'
        );
        expect(userInfoSet).toHaveBeenCalledWith(
            'emailNotificationWeekday',
            'wednesday'
        );
        expect(userInfoSet).toHaveBeenCalledWith(
            'emailNotificationWeekOfMonth',
            '1'
        );
        expect(userInfo.save).toHaveBeenCalledTimes(1);
        expect(result).toEqual(settings);
    });

    it('returns default settings when the user has no User_Info row', async () => {
        mockFirst.mockImplementation((target: unknown) =>
            Promise.resolve(target === Parse.User ? user : undefined)
        );
        const repo = new ParseDefaultUserEmailNotificationRepository();

        const result = await repo.getEmailNotificationSettingsByEmail(
            'user@example.com'
        );

        expect(result).toEqual({
            enabled: false,
            frequency: 'daily',
            weekday: 'monday',
            weekOfMonth: '1'
        });
    });
});
