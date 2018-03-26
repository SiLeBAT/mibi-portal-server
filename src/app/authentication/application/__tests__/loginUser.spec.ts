import { createService, ILoginService } from './../login.service';
import { LoginResult } from '../../domain';

jest.mock('./../../../sharedKernel', () => ({
    RepositoryType: {
        USER: 0
    }
}));

describe('Login User Use Case', () => {
    // tslint:disable-next-line
    let mockUserRepository: any;
    // tslint:disable-next-line
    let mockActivationService: any;
    let service: ILoginService;
    beforeEach(() => {

        mockUserRepository = jest.fn(() => ({
            findByUsername: jest.fn()
        }));

        mockActivationService = jest.fn(() => ({
            prepareUserForActivation: jest.fn()
        }));

        service = createService(mockUserRepository, mockActivationService);
    });

    it('should return a promise', () => {
        mockUserRepository.findByUsername = jest.fn(() => ({
            isActivated: () => true,
            isAuthorized: () => true
        }));
        const credentials = {
            email: 'test',
            password: 'test',
            userAgent: 'test',
            host: 'test'
        };
        const result = service.loginUser(credentials);
        expect(result).toBeInstanceOf(Promise);
    });

    it('should be return a login success', () => {

        const mockUser = {
            isActivated: () => true,
            isAuthorized: () => true
        };
        mockUserRepository.findByUsername = jest.fn(() => mockUser);

        const credentials = {
            email: 'test',
            password: 'test',
            userAgent: 'test',
            host: 'test'
        };
        const result = service.loginUser(credentials);
        expect.assertions(1);
        return result.then(
            data => expect(data.user).toEqual(mockUser)
        );
    });

    it('should be return a login fail because unauthorized', () => {

        mockUserRepository.findByUsername = jest.fn(() => ({
            isActivated: () => true,
            isAuthorized: () => false
        }));

        const credentials = {
            email: 'test',
            password: 'test',
            userAgent: 'test',
            host: 'test'
        };
       // expect(service.loginUser(credentials)).toThrowError();
        const result = service.loginUser(credentials);
        expect.assertions(1);
        return result.then(
            data => expect(data).toBe(LoginResult.FAIL),
            err => {
                return expect(err).toBeTruthy();
            }
        );
    });

    it('should be throw an error because inactive user is faulty', () => {

        mockUserRepository.findByUsername = jest.fn(() => ({
            isActivated: () => false,
            isAuthorized: () => true
        }));

        mockActivationService.prepareUserForActivation = jest.fn(() => Promise.reject(true));

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
