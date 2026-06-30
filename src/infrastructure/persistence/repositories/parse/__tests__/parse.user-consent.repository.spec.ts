const mockFirst = jest.fn();
const mockFind = jest.fn();
const mockSaveAll = jest.fn();

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
        notEqualTo() {
            return this;
        }
        limit() {
            return this;
        }
        first() {
            return mockFirst(this.target);
        }
        find() {
            return mockFind(this.target);
        }
    }
    return { __esModule: true, User, Query, Object: { saveAll: mockSaveAll } };
});

import * as Parse from 'parse/node';
import { ParseDefaultUserConsentRepository } from '../parse.user-consent.repository';

describe('ParseDefaultUserConsentRepository.saveConsentByEmail', () => {
    const user = { id: 'user-1' };
    let userInfoSet: jest.Mock;
    let userInfo: { set: jest.Mock; save: jest.Mock };
    let orderSet: jest.Mock;
    let orders: { set: jest.Mock }[];

    beforeEach(() => {
        jest.clearAllMocks();
        userInfoSet = jest.fn();
        userInfo = {
            set: userInfoSet,
            save: jest.fn().mockResolvedValue({
                get: (key: string) => (key === 'dataSaveViewed' ? true : false)
            })
        };
        orderSet = jest.fn();
        orders = [{ set: orderSet }, { set: orderSet }];

        mockFirst.mockImplementation((target: unknown) =>
            Promise.resolve(
                target === Parse.User
                    ? user
                    : target === 'User_Info'
                      ? userInfo
                      : undefined
            )
        );
        mockFind.mockImplementation((target: unknown) =>
            Promise.resolve(target === 'Order' ? orders : [])
        );
        mockSaveAll.mockResolvedValue(orders);
    });

    it("marks the user's stored orders for deletion when consent is withdrawn", async () => {
        const repo = new ParseDefaultUserConsentRepository();

        await repo.saveConsentByEmail('user@example.com', false);

        expect(userInfoSet).toHaveBeenCalledWith('dataSaveAgreed', false);
        expect(userInfoSet).toHaveBeenCalledWith('dataSaveViewed', true);
        expect(orderSet).toHaveBeenCalledWith('markedForDeletion', true);
        expect(orderSet).toHaveBeenCalledWith(
            'markedForDeletionAt',
            expect.any(Date)
        );
        expect(mockSaveAll).toHaveBeenCalledTimes(1);
    });

    it('does not touch orders when consent is granted', async () => {
        const repo = new ParseDefaultUserConsentRepository();

        await repo.saveConsentByEmail('user@example.com', true);

        expect(userInfoSet).toHaveBeenCalledWith('dataSaveAgreed', true);
        expect(orderSet).not.toHaveBeenCalled();
        expect(mockSaveAll).not.toHaveBeenCalled();
    });
});
