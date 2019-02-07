import { createInstitution } from './../institution.entity';

describe('Institution class', () => {
    it('should be created', () => {
        const inst = createInstitution('test');
        expect(inst).toBeTruthy();
    });
});
