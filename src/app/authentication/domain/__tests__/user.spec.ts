import { createUser } from './../user.entity';

describe('User class', () => {
    it('should be created', () => {
        const user = createUser('test', 'test', 'test', 'test', {
            uniqueId: 'test',
            short: 'test',
            name1: 'test',
            name2: 'test',
            location: 'test',
            address1: {
                street: 'test',
                city: 'test'
            },
            address2: {
                street: 'test',
                city: 'test'
            },
            phone: 'test',
            fax: 'test',
            email: [],
            stateId: 'test'
        }, 'test', true);
        expect(user).toBeTruthy();
    });
});
