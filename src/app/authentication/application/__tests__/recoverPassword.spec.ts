import { createService } from './../password.service';
import { PasswordService, RecoveryData } from '../../model/login.model';
import { generateToken } from './../../domain/token.service';
jest.mock('./../../domain/token.service');
jest.mock('../../../core/application/configuration.service');

describe('Recover Password Use Case', () => {
    let mockUserRepository: any;

    let mockTokenRepository: any;

    let mockNotificationService: any;
    let service: PasswordService;
    let credentials: RecoveryData;
    beforeEach(() => {
        mockUserRepository = {
            findByUsername: jest.fn(() => true)
        };

        mockTokenRepository = {
            hasResetTokenForUser: jest.fn(() => true),
            deleteResetTokenForUser: jest.fn(() => true),
            saveToken: jest.fn(() => true)
        };

        mockNotificationService = {
            sendNotification: jest.fn(() => true)
        };

        (generateToken as any).mockReset();
        credentials = {
            email: 'test',
            userAgent: 'test',
            host: 'test'
        };
        service = createService(
            mockUserRepository,
            mockTokenRepository,
            mockNotificationService
        );
    });

    it('should return a promise', () => {
        const result = service.recoverPassword(credentials);
        expect(result).toBeInstanceOf(Promise);
    });

    it('should trigger notification: sendNotification because user does not exist', () => {
        mockUserRepository.hasUser = jest.fn(() => false);
        expect.assertions(1);
        return service
            .recoverPassword(credentials)
            .then(result =>
                expect(
                    mockNotificationService.sendNotification.mock.calls.length
                ).toBe(1)
            );
    });
    it('should retrieve the user from the user repository', () => {
        expect.assertions(1);
        return service
            .recoverPassword(credentials)
            .then(result =>
                expect(
                    mockUserRepository.findByUsername.mock.calls.length
                ).toBe(1)
            );
    });
    it('should ask the token repository if the user has tokens', () => {
        expect.assertions(1);
        return service
            .recoverPassword(credentials)
            .then(result =>
                expect(
                    mockTokenRepository.hasResetTokenForUser.mock.calls.length
                ).toBe(1)
            );
    });
    it('should trigger deletion of old user tokens', () => {
        expect.assertions(1);
        return service
            .recoverPassword(credentials)
            .then(result =>
                expect(
                    mockTokenRepository.deleteResetTokenForUser.mock.calls
                        .length
                ).toBe(1)
            );
    });
    it('should not trigger deletion of old user tokens if user does not have any', () => {
        mockTokenRepository.hasResetTokenForUser = jest.fn(() => false);
        expect.assertions(1);
        return service
            .recoverPassword(credentials)
            .then(result =>
                expect(
                    mockTokenRepository.deleteResetTokenForUser.mock.calls
                        .length
                ).toBe(0)
            );
    });
    it('should generate a new token', () => {
        expect.assertions(1);
        return service
            .recoverPassword(credentials)
            .then(result =>
                expect((generateToken as any).mock.calls.length).toBe(1)
            );
    });
    it('should save the new token', () => {
        expect.assertions(1);
        return service
            .recoverPassword(credentials)
            .then(result =>
                expect(mockTokenRepository.saveToken.mock.calls.length).toBe(1)
            );
    });
    it('should trigger notification: sendNotification', () => {
        expect.assertions(1);
        return service
            .recoverPassword(credentials)
            .then(result =>
                expect(
                    mockNotificationService.sendNotification.mock.calls.length
                ).toBe(1)
            );
    });
    it('should be throw an error because user is faulty', () => {
        mockUserRepository.findByUsername = jest.fn(() => {
            throw new Error();
        });
        expect.assertions(1);
        return service
            .recoverPassword(credentials)
            .then(
                result =>
                    expect(
                        mockNotificationService.sendNotification.mock.calls
                            .length
                    ).toBe(0),
                err => expect(err).toBeTruthy()
            );
    });
});
