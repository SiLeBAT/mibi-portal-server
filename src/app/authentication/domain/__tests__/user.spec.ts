import { createUser } from './../user.entity';

describe('User class', () => {
    it('should be created', () => {
        const user = createUser(
            'test',
            'test',
            'test',
            'test',
            {
                uniqueId: 'test',
                stateShort: 'test',
                name: 'test',
                addendum: 'test',
                zip: 'test',
                city: 'test',
                phone: 'test',
                fax: 'test',
                email: []
            },
            'test',
            true
        );
        expect(user).toBeTruthy();
    });
});
