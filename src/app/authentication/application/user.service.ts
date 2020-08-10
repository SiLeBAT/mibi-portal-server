import { UserRepository } from '../../ports';
import { UserService, User } from '../model/user.model';
import { injectable, inject } from 'inversify';
import { APPLICATION_TYPES } from './../../application.types';
@injectable()
export class DefaultUserService implements UserService {
    constructor(
        @inject(APPLICATION_TYPES.UserRepository)
        private userRepository: UserRepository
    ) {}

    async getUserByEmail(email: string): Promise<User> {
        return this.userRepository.findByUsername(email);
    }

    async getUserById(userId: string): Promise<User> {
        return this.userRepository.findByUserId(userId);
    }

    async updateUser(user: User): Promise<User> {
        return this.userRepository.updateUser(user);
    }

    async createUser(user: User): Promise<User> {
        return this.userRepository.createUser(user);
    }

    async hasUserWithEmail(email: string): Promise<boolean> {
        return this.userRepository.hasUserWithEmail(email);
    }
}
