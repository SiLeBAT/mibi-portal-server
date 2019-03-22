import { createService } from './../registration.service';
import { RegistrationService } from '../../model/registration.model';
import { User } from '../../model/user.model';
import { RecoveryData } from '../../model/login.model';
import { createUser } from '../../domain/user.entity';
import { generateToken } from '../../domain/token.service';
// tslint:disable
jest.mock('./../../domain/token.service');

jest.mock('./../../domain/user.entity', () => ({
    createUser: jest.fn(() => ({
        updatePassword: jest.fn()
    }))
}));

jest.mock('../../../core/application/configuration.service');

describe('Prepare User for Activation Use Case', () => {
    let mockUserRepository: any;

    let mockTokenRepository: any;

    let mockNotificationService: any;

    let mockInstitutionRepository: any;
    let service: RegistrationService;
    let user: User;
    let recoveryData: RecoveryData;
    beforeEach(() => {
        mockUserRepository = {
            hasUser: jest.fn(() => false),
            createUser: jest.fn(() => true)
        };

        mockInstitutionRepository = {
            findById: jest.fn(() => true)
        };

        mockTokenRepository = {
            deleteTokenForUser: jest.fn(() => true),
            saveToken: jest.fn(() => true),
            hasTokenForUser: jest.fn(() => true)
        };

        mockNotificationService = {
            sendNotification: jest.fn(() => true),
            createEmailNotificationMetaData: jest.fn(() => {})
        };

        user = {
            uniqueId: 'test',
            firstName: 'test',
            lastName: 'test',
            email: 'test',
            password: 'test',
            institution: {
                uniqueId: 'test',
                stateShort: 'test',
                name: 'test',
                addendum: 'test',
                city: 'test',
                zip: 'test',
                phone: 'test',
                fax: 'test',
                email: []
            },
            getFullName: jest.fn(),
            isAuthorized: jest.fn(),
            isActivated: jest.fn(),
            isAdminActivated: jest.fn(),
            updatePassword: jest.fn(),
            getNumberOfFailedAttempts: jest.fn(),
            getLastLoginAttempt: jest.fn(),
            updateNumberOfFailedAttempts: jest.fn(),
            updateLastLoginAttempt: jest.fn()
        };
        recoveryData = {
            email: 'test',
            userAgent: 'test',
            host: 'test'
        };

        (createUser as any).mockClear();

        (generateToken as any).mockClear();

        service = createService(
            mockUserRepository,
            mockTokenRepository,
            mockInstitutionRepository,
            mockNotificationService
        );
    });

    it('should return a promise', () => {
        const result = service.prepareUserForActivation(user, recoveryData);
        expect(result).toBeInstanceOf(Promise);
    });
    it('should ask the token repository if the user has tokens', () => {
        expect.assertions(1);
        return service
            .prepareUserForActivation(user, recoveryData)
            .then(result =>
                expect(
                    mockTokenRepository.hasTokenForUser.mock.calls.length
                ).toBe(1)
            );
    });

    it('should trigger deletion of old user tokens', () => {
        expect.assertions(1);
        return service
            .prepareUserForActivation(user, recoveryData)
            .then(result =>
                expect(
                    mockTokenRepository.deleteTokenForUser.mock.calls.length
                ).toBe(1)
            );
    });
    it('should not trigger deletion of old user tokens if user does not have any', () => {
        mockTokenRepository.hasTokenForUser = jest.fn(() => false);
        expect.assertions(1);
        return service
            .prepareUserForActivation(user, recoveryData)
            .then(result =>
                expect(
                    mockTokenRepository.deleteTokenForUser.mock.calls.length
                ).toBe(0)
            );
    });
    it('should generate a new token', () => {
        expect.assertions(1);
        return service
            .prepareUserForActivation(user, recoveryData)
            .then(result =>
                expect((generateToken as any).mock.calls.length).toBe(1)
            );
    });
    it('should save the new token', () => {
        expect.assertions(1);
        return service
            .prepareUserForActivation(user, recoveryData)
            .then(result =>
                expect(mockTokenRepository.saveToken.mock.calls.length).toBe(1)
            );
    });
    it('should trigger notification: sendNotification', () => {
        expect.assertions(1);
        return service
            .prepareUserForActivation(user, recoveryData)
            .then(result =>
                expect(
                    mockNotificationService.sendNotification.mock.calls.length
                ).toBe(1)
            );
    });
});
