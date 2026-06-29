import * as Parse from 'parse/node';
import {
    UserConsent,
    UserConsentRepository
} from '../../../../app/authentication/model/consent.model';
import { logger } from '../../../../aspects';

const DATA_SAVE_AGREED = 'dataSaveAgreed';
const DATA_SAVE_VIEWED = 'dataSaveViewed';
const ORDER_CLASS = 'Order';
const MARKED_FOR_DELETION = 'markedForDeletion';
const MARKED_FOR_DELETION_AT = 'markedForDeletionAt';

export class ParseDefaultUserConsentRepository
    implements UserConsentRepository
{
    async getConsentByEmail(email: string): Promise<UserConsent> {
        const user = await this.findUser(email);
        const userInfo = user
            ? await this.findUserInfoForUser(user)
            : undefined;
        return toConsent(userInfo);
    }

    async saveConsentByEmail(
        email: string,
        dataSaveAgreed: boolean
    ): Promise<UserConsent> {
        const user = await this.findUser(email);
        if (!user) {
            throw new Error(
                `No _User found for ${email}; cannot save data-save consent.`
            );
        }
        const userInfo = await this.findUserInfoForUser(user);
        if (!userInfo) {
            // Existing accounts always have a User_Info row; a missing one means
            // the user pre-dates the related-info migration or the row was lost.
            throw new Error(
                `No User_Info found for user ${email}; cannot save data-save consent.`
            );
        }
        userInfo.set(DATA_SAVE_AGREED, dataSaveAgreed);
        userInfo.set(DATA_SAVE_VIEWED, true);
        const saved = await userInfo.save(null, { useMasterKey: true });

        // Withdrawing consent marks the user's already-stored orders for
        // deletion: they are hidden from the user's order list and surfaced in
        // the dashboard for removal.
        if (!dataSaveAgreed) {
            await this.markOrdersForDeletion(user);
        }

        return toConsent(saved);
    }

    private async findUser(email: string): Promise<Parse.User | undefined> {
        const user = await new Parse.Query(Parse.User)
            .equalTo('username', email)
            .first({ useMasterKey: true });
        if (!user) {
            logger.warn(
                `${ParseDefaultUserConsentRepository.name}.findUser, no _User found for ${email}`
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

    private async markOrdersForDeletion(user: Parse.User): Promise<void> {
        const orders = await new Parse.Query(ORDER_CLASS)
            .equalTo('user', user)
            .notEqualTo(MARKED_FOR_DELETION, true)
            .limit(10000)
            .find({ useMasterKey: true });
        if (orders.length === 0) {
            return;
        }
        const now = new Date();
        orders.forEach(order => {
            order.set(MARKED_FOR_DELETION, true);
            order.set(MARKED_FOR_DELETION_AT, now);
        });
        await Parse.Object.saveAll(orders, { useMasterKey: true });
        logger.info(
            `${ParseDefaultUserConsentRepository.name}.markOrdersForDeletion, marked ${orders.length} order(s) for deletion for user ${user.id}`
        );
    }
}

function toConsent(userInfo?: Parse.Object): UserConsent {
    return {
        dataSaveAgreed: userInfo?.get(DATA_SAVE_AGREED) ?? false,
        dataSaveViewed: userInfo?.get(DATA_SAVE_VIEWED) ?? false
    };
}
