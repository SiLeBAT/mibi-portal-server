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
import { ParseDefaultUserConsentRepository } from '../parse.user-consent.repository';

describe('ParseDefaultUserConsentRepository.saveConsentByEmail', () => {
    const user = { id: 'user-1' };
    let userInfoSet: jest.Mock;
    let userInfo: { set: jest.Mock; save: jest.Mock };

    beforeEach(() => {
        jest.clearAllMocks();
        userInfoSet = jest.fn();
        userInfo = {
            set: userInfoSet,
            save: jest.fn().mockResolvedValue({
                get: (key: string) => (key === 'dataSaveViewed' ? true : false)
            })
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

    it('persists the withdrawn consent flag', async () => {
        const repo = new ParseDefaultUserConsentRepository();

        const result = await repo.saveConsentByEmail('user@example.com', false);

        expect(userInfoSet).toHaveBeenCalledWith('dataSaveAgreed', false);
        expect(userInfoSet).toHaveBeenCalledWith('dataSaveViewed', true);
        expect(userInfo.save).toHaveBeenCalledTimes(1);
        expect(result.dataSaveViewed).toBe(true);
    });

    it('persists the granted consent flag', async () => {
        const repo = new ParseDefaultUserConsentRepository();

        await repo.saveConsentByEmail('user@example.com', true);

        expect(userInfoSet).toHaveBeenCalledWith('dataSaveAgreed', true);
        expect(userInfoSet).toHaveBeenCalledWith('dataSaveViewed', true);
    });
});
