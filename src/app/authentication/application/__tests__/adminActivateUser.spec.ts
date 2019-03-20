import { createService } from './../registration.service';
import { RegistrationService } from '../../model/registration.model';
import { verifyToken, generateAdminToken } from '../../domain/token.service';

jest.mock('./../../domain/token.service');
jest.mock('../../../core/application/configuration.service');

describe('Admin activate User Use Case', () => {
    let mockUserRepository: any;

    let mockTokenRepository: any;

    let mockNotificationService: any;

    let mockInstitutionRepository: any;
    let service: RegistrationService;
    let token: string;
    beforeEach(() => {
        mockUserRepository = {
            findById: jest.fn(() => ({
                isAdminActivated: jest.fn()
            })),
            updateUser: jest.fn(() => true)
        };

        mockTokenRepository = {
            getUserTokenByJWT: jest.fn(() => true),
            deleteAdminTokenForUser: jest.fn(() => true)
        };

        mockInstitutionRepository = {};

        mockNotificationService = {
            sendNotification: jest.fn(() => true),
            createEmailNotificationMetaData: jest.fn(() => {})
        };

        (verifyToken as any).mockReset();

        (generateAdminToken as any).mockReset();
        token = 'test';

        service = createService(
            mockUserRepository,
            mockTokenRepository,
            mockInstitutionRepository,
            mockNotificationService
        );
    });

    it('should return a promise', () => {
        const result = service.adminActivateUser(token);
        expect(result).toBeInstanceOf(Promise);
    });

    it('should call token repository to retrieve userId', () => {
        expect.assertions(1);
        return service
            .adminActivateUser(token)
            .then(result =>
                expect(
                    mockTokenRepository.getUserTokenByJWT.mock.calls.length
                ).toBe(1)
            );
    });
    it('should verify the token against the retrieved userId', () => {
        expect.assertions(1);
        return service
            .adminActivateUser(token)
            .then(result =>
                expect((verifyToken as any).mock.calls.length).toBe(1)
            );
    });
    it('should call user repository to retrieve user', () => {
        expect.assertions(1);
        return service
            .adminActivateUser(token)
            .then(result =>
                expect(mockUserRepository.findById.mock.calls.length).toBe(1)
            );
    });
    it('should activate the user', () => {
        expect.assertions(1);
        const isAdminActivated = jest.fn();
        mockUserRepository.findById.mockReturnValueOnce({
            isAdminActivated
        });
        return service
            .adminActivateUser(token)
            .then(result => expect(isAdminActivated.mock.calls.length).toBe(1));
    });
    it('should call the user Repository to update the user', () => {
        expect.assertions(1);
        return service
            .adminActivateUser(token)
            .then(result =>
                expect(mockUserRepository.updateUser.mock.calls.length).toBe(1)
            );
    });
    it('should call the token Repository to delete the token', () => {
        expect.assertions(1);
        return service
            .adminActivateUser(token)
            .then(result =>
                expect(
                    mockTokenRepository.deleteAdminTokenForUser.mock.calls
                        .length
                ).toBe(1)
            );
    });
    it('should be throw an error because user is faulty', () => {
        mockUserRepository.findById = jest.fn(() => {
            throw new Error();
        });
        expect.assertions(1);
        return service
            .adminActivateUser(token)
            .then(
                result =>
                    expect(
                        mockTokenRepository.deleteAdminTokenForUser.mock.calls
                            .length
                    ).toBe(0),
                err => expect(err).toBeTruthy()
            );
    });
    it('should trigger notification: sendNotification', () => {
        expect.assertions(1);
        return service
            .adminActivateUser(token)
            .then(result =>
                expect(
                    mockNotificationService.sendNotification.mock.calls.length
                ).toBe(1)
            );
    });
});
