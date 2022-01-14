import { getContainer } from '../../../../aspects/container/container';
import { LoginService } from '../../model/login.model';
import { getApplicationContainerModule } from '../../../ports';
import { genericUser, getMockUserService } from '../__mocks__/user.service';
import { getMockTokenService } from '../__mocks__/token.service';
import { Container } from 'inversify';
import { mockPersistenceContainerModule } from '../../../../infrastructure/persistence/__mocks__/persistence-mock.module';
import { APPLICATION_TYPES } from '../../../application.types';
import { rebindMocks } from '../../../../__mocks__/util';

describe('Login User Use Case', () => {
    let service: LoginService;
    let container: Container | null;
    beforeEach(() => {
        container = getContainer();
        container.load(
            getApplicationContainerModule({
                appName: 'test',
                jobRecipient: 'test',
                login: {
                    threshold: 0,
                    secondsDelay: 0
                },
                clientUrl: 'test',
                supportContact: 'test',
                jwtSecret: 'test'
            }),
            mockPersistenceContainerModule
        );
        service = container.get<LoginService>(APPLICATION_TYPES.LoginService);
    });
    afterEach(() => {
        container = null;
    });

    it('should return a promise', () => {
        const credentials = {
            email: 'test',
            password: 'test',
            userAgent: 'test',
            host: 'test'
        };
        const result = service.loginUser(credentials);
        // tslint:disable-next-line: no-floating-promises
        expect(result).toBeInstanceOf(Promise);
    });

    it('should be return a login success', () => {
        const mockUser = { ...genericUser };
        mockUser.isAuthorized = jest.fn(() => Promise.resolve(true));
        const mockUserService = getMockUserService();
        const mockTokenService = getMockTokenService();
        service = rebindMocks<LoginService>(
            container,
            APPLICATION_TYPES.LoginService,
            [
                {
                    id: APPLICATION_TYPES.TokenService,
                    instance: mockTokenService
                },
                {
                    id: APPLICATION_TYPES.UserService,
                    instance: mockUserService
                }
            ]
        );
        mockUserService.getUserByEmail = jest.fn(() =>
            Promise.resolve(mockUser)
        );

        const credentials = {
            email: 'test',
            password: 'test',
            userAgent: 'test',
            host: 'test'
        };
        const result = service.loginUser(credentials);
        expect.assertions(1);
        return result.then(data => expect(data.user).toEqual(mockUser));
    });

    it('should be return a login fail because unauthorized', () => {
        const mockUser = { ...genericUser };
        mockUser.isAuthorized = jest.fn(() => Promise.resolve(false));
        const mockUserService = getMockUserService();
        const mockTokenService = getMockTokenService();
        service = rebindMocks<LoginService>(
            container,
            APPLICATION_TYPES.LoginService,
            [
                {
                    id: APPLICATION_TYPES.TokenService,
                    instance: mockTokenService
                },
                {
                    id: APPLICATION_TYPES.UserService,
                    instance: mockUserService
                }
            ]
        );
        mockUserService.getUserByEmail = jest.fn(() =>
            Promise.resolve(mockUser)
        );
        const credentials = {
            email: 'test',
            password: 'test',
            userAgent: 'test',
            host: 'test'
        };

        const result = service.loginUser(credentials);
        expect.assertions(1);
        return result.then(
            data => expect(data).toBe(false),
            err => {
                return expect(err).toBeTruthy();
            }
        );
    });

    it('should be throw an error because inactive user is faulty', () => {
        const mockUser = { ...genericUser };
        mockUser.isVerified = jest.fn(() => false);
        const mockUserService = getMockUserService();
        service = rebindMocks<LoginService>(
            container,
            APPLICATION_TYPES.LoginService,
            [
                {
                    id: APPLICATION_TYPES.UserService,
                    instance: mockUserService
                }
            ]
        );
        mockUserService.getUserByEmail = jest.fn(() =>
            Promise.resolve(mockUser)
        );

        const credentials = {
            email: 'test',
            password: 'test',
            userAgent: 'test',
            host: 'test'
        };
        const result = service.loginUser(credentials);
        expect.assertions(1);
        return result.then(
            data => {
                return true;
            },
            err => {
                return expect(err).toBeTruthy();
            }
        );
    });

    it('should be throw an error because user not activated by admin is faulty', () => {
        const mockUser = { ...genericUser };
        mockUser.isActivated = jest.fn(() => false);
        const mockUserService = getMockUserService();
        service = rebindMocks<LoginService>(
            container,
            APPLICATION_TYPES.LoginService,
            [
                {
                    id: APPLICATION_TYPES.UserService,
                    instance: mockUserService
                }
            ]
        );
        mockUserService.getUserByEmail = jest.fn(() =>
            Promise.resolve(mockUser)
        );

        const credentials = {
            email: 'test',
            password: 'test',
            userAgent: 'test',
            host: 'test'
        };
        const result = service.loginUser(credentials);
        expect.assertions(1);
        return result.then(
            data => {
                return true;
            },
            err => {
                return expect(err).toBeTruthy();
            }
        );
    });

    it('should be throw an error because inactive user and user not activated by admin is faulty', () => {
        const mockUser = { ...genericUser };
        mockUser.isVerified = jest.fn(() => false);
        mockUser.isActivated = jest.fn(() => false);
        const mockUserService = getMockUserService();
        service = rebindMocks<LoginService>(
            container,
            APPLICATION_TYPES.LoginService,
            [
                {
                    id: APPLICATION_TYPES.UserService,
                    instance: mockUserService
                }
            ]
        );
        mockUserService.getUserByEmail = jest.fn(() =>
            Promise.resolve(mockUser)
        );

        const credentials = {
            email: 'test',
            password: 'test',
            userAgent: 'test',
            host: 'test'
        };
        const result = service.loginUser(credentials);
        expect.assertions(1);
        return result.then(
            data => {
                return true;
            },
            err => {
                return expect(err).toBeTruthy();
            }
        );
    });
});
