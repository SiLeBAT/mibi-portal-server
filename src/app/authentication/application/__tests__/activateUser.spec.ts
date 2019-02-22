import { createService, RegistrationService } from './../registration.service';
import { verifyToken, generateToken, User } from '../../domain';
// tslint:disable
jest.mock('./../../../sharedKernel', () => ({
    RepositoryType: {
        USER: 0
    },
    NotificationType: {
        REQUEST_ADMIN_ACTIVATION: 1
    }
}));

jest.mock('./../../domain', () => ({
    generateToken: jest.fn(),
    generateAdminToken: jest.fn(),
    verifyToken: jest.fn(),
    TokenType: {
        ADMIN: 0
    }
}));

describe('Activate User Use Case', () => {
    let mockUserRepository: any;

    let mockTokenRepository: any;

    let mockNotificationService: any;

    let mockInstitutionRepository: any;
    let service: RegistrationService;
    let token: string;
    let user: User;
    beforeEach(() => {
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

        mockUserRepository = {
            findById: jest.fn(() => user),
            updateUser: jest.fn(() => true)
        };

        mockTokenRepository = {
            getUserTokenByJWT: jest.fn(() => user),
            deleteTokenForUser: jest.fn(() => true),
            deleteAdminTokenForUser: jest.fn(() => true),
            saveToken: jest.fn(() => true),
            hasAdminTokenForUser: jest.fn(() => false)
        };

        mockInstitutionRepository = {};

        mockNotificationService = {
            sendNotification: jest.fn(() => true)
        };

        (verifyToken as any).mockReset();

        (generateToken as any).mockReset();
        token = 'test';

        service = createService(
            mockUserRepository,
            mockTokenRepository,
            mockInstitutionRepository,
            mockNotificationService
        );
    });

    it('should return a promise', () => {
        const result = service.activateUser(token);
        expect(result).toBeInstanceOf(Promise);
    });

    it('should call token repository to retrieve userId', () => {
        expect.assertions(1);
        return service
            .activateUser(token)
            .then(result =>
                expect(
                    mockTokenRepository.getUserTokenByJWT.mock.calls.length
                ).toBe(1)
            );
    });
    it('should verify the token against the retrieved userId', () => {
        expect.assertions(1);
        return service
            .activateUser(token)
            .then(result =>
                expect((verifyToken as any).mock.calls.length).toBe(1)
            );
    });
    it('should call user repository to retrieve user', () => {
        expect.assertions(1);
        return service
            .activateUser(token)
            .then(result =>
                expect(mockUserRepository.findById.mock.calls.length).toBe(1)
            );
    });
    it('should activate the user', () => {
        expect.assertions(1);
        const isActivated = jest.fn();
        mockUserRepository.findById.mockReturnValueOnce({
            ...user,
            ...{ isActivated }
        });
        return service
            .activateUser(token)
            .then(result => expect(isActivated.mock.calls.length).toBe(1));
    });
    it('should call the user Repository to update the user', () => {
        expect.assertions(1);
        return service
            .activateUser(token)
            .then(result =>
                expect(mockUserRepository.updateUser.mock.calls.length).toBe(1)
            );
    });
    it('should call the token Repository to delete the token', () => {
        expect.assertions(1);
        return service
            .activateUser(token)
            .then(result =>
                expect(
                    mockTokenRepository.deleteTokenForUser.mock.calls.length
                ).toBe(1)
            );
    });
    it('should be throw an error because user is faulty', () => {
        mockUserRepository.findById = jest.fn(() => {
            throw new Error();
        });
        expect.assertions(1);
        return service
            .activateUser(token)
            .then(
                result =>
                    expect(
                        mockTokenRepository.deleteTokenForUser.mock.calls.length
                    ).toBe(0),
                err => expect(err).toBeTruthy()
            );
    });
});
