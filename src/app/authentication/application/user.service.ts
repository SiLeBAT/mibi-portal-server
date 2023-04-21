import {
    ParseUserRepository
} from '../../ports';
import { UserService, User } from '../model/user.model';
import { injectable, inject } from 'inversify';
import { APPLICATION_TYPES } from './../../application.types';
@injectable()
export class DefaultUserService implements UserService {
    constructor(
        @inject(APPLICATION_TYPES.ParseUserRepository)
        private parseUserRepository: ParseUserRepository
    ) {}

    async getUserByEmail(email: string): Promise<User> {
        return this.parseUserRepository.findByUsername(email);
    }

    async getUserById(userId: string): Promise<User> {
        return this.parseUserRepository.findByUserId(userId);
    }

    async updateUser(user: User): Promise<User> {
        return this.parseUserRepository.updateUser(user);
    }

    async createUser(user: User): Promise<User> {
        return this.parseUserRepository.createUser(user);
    }

    async hasUserWithEmail(email: string): Promise<boolean> {
        return this.parseUserRepository.hasUserWithEmail(email);
    }
}
