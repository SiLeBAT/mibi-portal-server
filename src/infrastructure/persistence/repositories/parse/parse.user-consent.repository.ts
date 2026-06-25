import * as Parse from 'parse/node';
import {
    UserConsent,
    UserConsentRepository
} from '../../../../app/authentication/model/consent.model';
import { logger } from '../../../../aspects';

const DATA_SAVE_AGREED = 'dataSaveAgreed';
const DATA_SAVE_VIEWED = 'dataSaveViewed';

export class ParseDefaultUserConsentRepository
    implements UserConsentRepository
{
    async getConsentByEmail(email: string): Promise<UserConsent> {
        const userInfo = await this.findUserInfo(email);
        return toConsent(userInfo);
    }

    async saveConsentByEmail(
        email: string,
        dataSaveAgreed: boolean
    ): Promise<UserConsent> {
        const userInfo = await this.findUserInfo(email);
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
        return toConsent(saved);
    }

    private async findUserInfo(
        email: string
    ): Promise<Parse.Object | undefined> {
        const user = await new Parse.Query(Parse.User)
            .equalTo('username', email)
            .first({ useMasterKey: true });
        if (!user) {
            logger.warn(
                `${ParseDefaultUserConsentRepository.name}.findUserInfo, no _User found for ${email}`
            );
            return undefined;
        }
        return new Parse.Query('User_Info')
            .equalTo('user', user)
            .first({ useMasterKey: true });
    }
}

function toConsent(userInfo?: Parse.Object): UserConsent {
    return {
        dataSaveAgreed: userInfo?.get(DATA_SAVE_AGREED) ?? false,
        dataSaveViewed: userInfo?.get(DATA_SAVE_VIEWED) ?? false
    };
}
