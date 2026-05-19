import { NextFunction, Request, Response } from 'express';
import {
    Actor,
    ActorContextService
} from '../../../../app/authentication/model/actor.model';
import { resolveActorContext } from '../actor-context.middleware';

function mockResponse(): jest.Mocked<Response> {
    const res = {} as jest.Mocked<Response>;
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
}

function mockService(
    impl?: ActorContextService['resolveActor']
): jest.Mocked<ActorContextService> {
    return {
        resolveActor: jest.fn(impl ?? (async () => ALICE))
    };
}

const ALICE: Actor = {
    keycloakSub: 'sub-alice',
    instituteId: 'BfR',
    email: 'alice@lab.de',
    displayName: 'alice'
};

describe('resolveActorContext middleware', () => {
    it('passes through when no OIDC session user is present', async () => {
        const svc = mockService();
        const req = { session: {} } as Request;
        const res = mockResponse();
        const next: NextFunction = jest.fn();

        await resolveActorContext(svc)(req, res, next);

        expect(svc.resolveActor).not.toHaveBeenCalled();
        expect(next).toHaveBeenCalledWith();
        expect(res.status).not.toHaveBeenCalled();
    });

    it('attaches currentActor and caches into session on success', async () => {
        const svc = mockService();
        const req = {
            session: {
                user: {
                    sub: ALICE.keycloakSub,
                    email: ALICE.email,
                    preferred_username: ALICE.displayName,
                    groups: ['/institutes/BfR'],
                    roles: []
                }
            }
        } as unknown as Request;
        const res = mockResponse();
        const next: NextFunction = jest.fn();

        await resolveActorContext(svc)(req, res, next);

        expect(req.currentActor).toEqual(ALICE);
        expect(req.session.actor).toEqual(ALICE);
        expect(next).toHaveBeenCalledWith();
    });

    it('fails closed with 500 when actor resolution throws', async () => {
        const svc = mockService(async () => {
            throw new Error(
                'Actor must belong to exactly one institute group, found 0'
            );
        });
        const req = {
            session: {
                user: {
                    sub: 'sub-x',
                    email: 'x@lab.de',
                    preferred_username: 'x',
                    groups: [],
                    roles: []
                }
            }
        } as unknown as Request;
        const res = mockResponse();
        const next: NextFunction = jest.fn();

        await resolveActorContext(svc)(req, res, next);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                message: expect.stringContaining('exactly one institute group')
            })
        );
        expect(next).not.toHaveBeenCalled();
        expect(req.currentActor).toBeUndefined();
    });

    it('skips resolution for /v2/auth/* so a bad session cannot brick login/logout', async () => {
        const svc = mockService(async () => {
            throw new Error('should not be called');
        });
        const req = {
            path: '/v2/auth/login',
            session: {
                user: {
                    sub: 'sub-x',
                    email: 'x@lab.de',
                    preferred_username: 'x',
                    groups: [],
                    roles: []
                }
            }
        } as unknown as Request;
        const res = mockResponse();
        const next: NextFunction = jest.fn();

        await resolveActorContext(svc)(req, res, next);

        expect(svc.resolveActor).not.toHaveBeenCalled();
        expect(next).toHaveBeenCalledWith();
        expect(res.status).not.toHaveBeenCalled();
    });
});
