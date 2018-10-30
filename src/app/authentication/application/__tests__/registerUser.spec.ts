import { createService, RegistrationService, UserRegistration } from './../registration.service';
import { createUser } from '../../domain';
 // tslint:disable
jest.mock('./../../../sharedKernel', () => ({
    RepositoryType: {
        USER: 0
    }
}));

jest.mock('./../../domain', () => ({
    generateToken: jest.fn(),
    verifyToken: jest.fn(),
    createUser: jest.fn(() => ({
        updatePassword: jest.fn()
    }))
}));

describe('Register User Use Case', () => {
  
    let mockUserRepository: any;

    let mockTokenRepository: any;
   
    let mockNotificationService: any;

    let mockInstitutionRepository: any;
    let service: RegistrationService;
    let credentials: UserRegistration;
    beforeEach(() => {
        mockUserRepository = {
            hasUser: jest.fn(() => false),
            createUser: jest.fn(() => true)
        };

        mockInstitutionRepository = {
            findById: jest.fn(() => true)
        };

        mockTokenRepository = {
            deleteTokenForUser: jest.fn(() => true)
        };

        credentials = {
            firstName: 'test',
            lastName: 'test',
            email: 'test',
            password: 'test',
            institution: 'test',
            userAgent: 'test',
            host: 'test'
        };

     
        (createUser as any).mockClear();

        service = createService(mockUserRepository, mockTokenRepository, mockInstitutionRepository, mockNotificationService);
        service.prepareUserForActivation = jest.fn(() => Promise.resolve(true));
        service.prepareUserForAdminActivation = jest.fn(() => Promise.resolve(true));

    });

    it('should return a promise', () => {
        const result = service.registerUser(credentials);
        expect(result).toBeInstanceOf(Promise);
    });

    it('should ask the user repository if the user exists', () => {
        expect.assertions(1);
        return service.registerUser(credentials).then(
            result => expect(mockUserRepository.hasUser.mock.calls.length).toBe(1)
        );
    });
    it('should throw an error because user does not exist', () => {
        mockUserRepository.hasUser = jest.fn(() => false);
        expect.assertions(1);
        return service.registerUser(credentials).then(
            result => expect(mockTokenRepository.deleteTokenForUser.mock.calls.length).toBe(0),
            err => expect(err).toBeTruthy()
        );
    });

    it('should ask the institute repository if the institute exists', () => {
        expect.assertions(1);
        return service.registerUser(credentials).then(
            result => expect(mockInstitutionRepository.findById.mock.calls.length).toBe(1)
        );
    });
    it('should throw an error because institute does not exist', () => {
        mockInstitutionRepository.findById = jest.fn(() => false);
        expect.assertions(1);
        return service.registerUser(credentials).then(
            result => expect(mockInstitutionRepository.findById.mock.calls.length).toBe(0),
            err => {
                return expect(err).toBeTruthy();
            }
        );
    });
    it('should create a new User', () => {
        expect.assertions(1);
        return service.registerUser(credentials).then(
            result => expect((createUser as any).mock.calls.length).toBe(1)
        );
    });
    it('should update password for new user', () => {
        const updatePassword = jest.fn();
        (createUser as any).mockReturnValueOnce({
            updatePassword
        });
        expect.assertions(1);
        return service.registerUser(credentials).then(
            result => expect((updatePassword as any).mock.calls.length).toBe(1)
        );
    });
    it('should store new user in user repository', () => {
        expect.assertions(1);
        return service.registerUser(credentials).then(
            result => expect(mockUserRepository.createUser.mock.calls.length).toBe(1)
        );
    });
    it('should prepare user for activation', () => {
        expect.assertions(1);
        return service.registerUser(credentials).then(
            result => expect((service.prepareUserForActivation as any).mock.calls.length).toBe(1)
        );
    });
    it('should prepare user for admin activation', () => {
        expect.assertions(1);
        return service.registerUser(credentials).then(
            result => expect((service.prepareUserForAdminActivation as any).mock.calls.length).toBe(1)
        );
    });
});
