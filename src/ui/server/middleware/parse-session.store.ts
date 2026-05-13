import * as Parse from 'parse/node';
import { SessionData, Store } from 'express-session';

const SESSION_CLASS = 'ExpressSession';

export class ParseSessionStore extends Store {
    constructor(private readonly ttlSeconds: number) {
        super();
    }

    get(
        sid: string,
        callback: (err: unknown, session?: SessionData | null) => void
    ): void {
        new Parse.Query(SESSION_CLASS)
            .equalTo('sid', sid)
            .first({ useMasterKey: true })
            .then(obj => {
                if (!obj) {
                    callback(null, null);
                    return;
                }
                const expiresAt = obj.get('expiresAt') as Date | undefined;
                if (expiresAt && expiresAt.getTime() < Date.now()) {
                    obj.destroy({ useMasterKey: true }).catch(() => undefined);
                    callback(null, null);
                    return;
                }
                const raw = obj.get('data') as string | undefined;
                const parsed = raw ? (JSON.parse(raw) as SessionData) : null;
                callback(null, parsed);
            })
            .catch(err => {
                callback(err);
            });
    }

    set(
        sid: string,
        session: SessionData,
        callback?: (err?: unknown) => void
    ): void {
        const cb = callback ?? (() => undefined);
        new Parse.Query(SESSION_CLASS)
            .equalTo('sid', sid)
            .first({ useMasterKey: true })
            .then(async existing => {
                const obj: Parse.Object =
                    existing ?? new Parse.Object(SESSION_CLASS, { sid });
                obj.set('data', JSON.stringify(session));
                obj.set(
                    'expiresAt',
                    new Date(Date.now() + this.ttlSeconds * 1000)
                );
                await obj.save(null, { useMasterKey: true });
            })
            .then(() => {
                cb();
            })
            .catch(err => {
                cb(err);
            });
    }

    destroy(sid: string, callback?: (err?: unknown) => void): void {
        const cb = callback ?? (() => undefined);
        new Parse.Query(SESSION_CLASS)
            .equalTo('sid', sid)
            .first({ useMasterKey: true })
            .then(async obj => {
                if (obj) {
                    await obj.destroy({ useMasterKey: true });
                }
            })
            .then(() => {
                cb();
            })
            .catch(err => {
                cb(err);
            });
    }

    touch(
        sid: string,
        session: SessionData,
        callback?: (err?: unknown) => void
    ): void {
        this.set(sid, session, callback);
    }
}
