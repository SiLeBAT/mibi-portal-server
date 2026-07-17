import { sign } from 'jsonwebtoken';
import { rebindMocks } from '../../../../__mocks__/util';
import {
    TestContainer,
    createTestContainer
} from '../../../../__mocks__/test-container';
import { APPLICATION_TYPES } from '../../../application.types';
import { getMockNotificationService } from '../../../core/application/__mocks__/notification.service';
import { TokenType } from '../../domain/enums';
import { PasswordService } from '../../model/login.model';
import { getMockTokenService } from '../__mocks__/token.service';
import { getMockUserService } from '../__mocks__/user.service';

describe('Reset Password Use Case', () => {
    let service: PasswordService;
    let token: string;
    let password: string;
    let container: TestContainer | null;
    beforeEach(() => {
        container = createTestContainer({
            appConfig: {
                appName: 'test',
                jobRecipient: 'test',
                login: {
                    threshold: 0,
                    secondsDelay: 0
                },
                clientUrl: 'test',
                supportContact: 'test',
                jwtSecret: 'test'
            }
        });
        service = container.get<PasswordService>(
            APPLICATION_TYPES.PasswordService
        );

        token = sign({ subject: 'test' }, 'test', { subject: 'test' });
        password = 'test';
    });

    afterEach(() => {
        container = null;
    });

    it('should return a promise', () => {
        const result = service.resetPassword(token, password);
        expect(result).toBeInstanceOf(Promise);
        // The container-backed token repository yields an activation token,
        // which resetPassword now rejects; swallow it so the floating promise
        // does not surface as an unhandled rejection.
        return result.catch(() => undefined);
    });

    it('should update the user password', () => {
        const mockTokenService = getMockTokenService(TokenType.RESET);
        const mockUserService = getMockUserService();

        service = rebindMocks<PasswordService>(
            container,
            APPLICATION_TYPES.PasswordService,
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

        expect.assertions(1);
        const updatePassword = jest.fn();
        (mockUserService.getUserById as jest.Mock).mockReturnValueOnce({
            updatePassword
        });
        return service
            .resetPassword(token, password)
            .then(result => expect(updatePassword.mock.calls.length).toBe(1));
    });
    it('should call the user Repository to update the user', () => {
        const mockTokenService = getMockTokenService(TokenType.RESET);
        const mockUserService = getMockUserService();

        service = rebindMocks<PasswordService>(
            container,
            APPLICATION_TYPES.PasswordService,
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
        expect.assertions(1);
        return service
            .resetPassword(token, password)
            .then(result =>
                expect(
                    (mockUserService.updateUser as jest.Mock).mock.calls.length
                ).toBe(1)
            );
    });
    it('should call the token Repository to delete the token', () => {
        const mockTokenService = getMockTokenService(TokenType.RESET);
        service = rebindMocks<PasswordService>(
            container,
            APPLICATION_TYPES.PasswordService,
            [
                {
                    id: APPLICATION_TYPES.TokenService,
                    instance: mockTokenService
                }
            ]
        );
        expect.assertions(1);
        return service
            .resetPassword(token, password)
            .then(result =>
                expect(
                    (mockTokenService.deleteTokenForUser as jest.Mock).mock
                        .calls.length
                ).toBe(1)
            );
    });
    it('should call the notification Service with a new notification', () => {
        const mockTokenService = getMockTokenService(TokenType.RESET);
        const mockNotificationService = getMockNotificationService();

        service = rebindMocks<PasswordService>(
            container,
            APPLICATION_TYPES.PasswordService,
            [
                {
                    id: APPLICATION_TYPES.TokenService,
                    instance: mockTokenService
                },
                {
                    id: APPLICATION_TYPES.NotificationService,
                    instance: mockNotificationService
                }
            ]
        );
        expect.assertions(1);
        return service
            .resetPassword(token, password)
            .then(result =>
                expect(
                    (mockNotificationService.sendNotification as jest.Mock).mock
                        .calls.length
                ).toBe(1)
            );
    });
    it('should reject a non-reset token and not change the password (MPS-341)', () => {
        const mockTokenService = getMockTokenService(TokenType.ACTIVATE);
        const mockUserService = getMockUserService();

        service = rebindMocks<PasswordService>(
            container,
            APPLICATION_TYPES.PasswordService,
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
        const updatePassword = jest.fn();
        (mockUserService.getUserById as jest.Mock).mockReturnValue({
            updatePassword
        });
        expect.assertions(3);
        return service.resetPassword(token, password).then(
            () => {
                throw new Error('expected resetPassword to reject');
            },
            err => {
                expect(err).toBeTruthy();
                expect(updatePassword.mock.calls.length).toBe(0);
                expect(
                    (mockTokenService.deleteTokenForUser as jest.Mock).mock.calls
                        .length
                ).toBe(0);
            }
        );
    });
    it('should be throw an error because user is faulty', () => {
        const mockTokenService = getMockTokenService(TokenType.RESET);
        const mockNotificationService = getMockNotificationService();
        const mockUserService = getMockUserService();

        service = rebindMocks<PasswordService>(
            container,
            APPLICATION_TYPES.PasswordService,
            [
                {
                    id: APPLICATION_TYPES.TokenService,
                    instance: mockTokenService
                },
                {
                    id: APPLICATION_TYPES.NotificationService,
                    instance: mockNotificationService
                },
                {
                    id: APPLICATION_TYPES.UserService,
                    instance: mockUserService
                }
            ]
        );
        mockUserService.getUserById = jest.fn(() => {
            throw new Error();
        });
        expect.assertions(1);
        return service.resetPassword(token, password).then(
            result =>
                expect(
                    (mockNotificationService.sendNotification as jest.Mock).mock
                        .calls.length
                ).toBe(0),
            err => expect(err).toBeTruthy()
        );
    });
});
