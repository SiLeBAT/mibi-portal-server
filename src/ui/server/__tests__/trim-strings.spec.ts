import { trimStrings } from '../trim-strings';

describe('trimStrings', () => {
    it('removes surrounding spaces, tabs and line breaks', () => {
        expect(trimStrings(' \t\r\nvalue\r\n\t ')).toBe('value');
    });

    it('keeps whitespace and line breaks inside a string', () => {
        expect(trimStrings(' first line\nsecond  line ')).toBe(
            'first line\nsecond  line'
        );
    });

    it('trims strings at any depth of objects and arrays', () => {
        expect(
            trimStrings({
                firstName: ' Max ',
                sender: { street: ' Street 1\n' },
                samples: [{ value: ' 1 ' }, ' 2 ']
            })
        ).toEqual({
            firstName: 'Max',
            sender: { street: 'Street 1' },
            samples: [{ value: '1' }, '2']
        });
    });

    it.each([
        ['password', { password: ' secret ' }],
        ['a nested password', { user: { password: ' secret\n' } }],
        ['oldValue', { sample_id: { oldValue: ' 1 ' } }]
    ])('does not trim %s', (_name, input) => {
        expect(trimStrings(input)).toEqual(input);
    });

    it('still trims the fields next to an untrimmed one', () => {
        expect(trimStrings({ value: ' 1 ', oldValue: ' 1 ' })).toEqual({
            value: '1',
            oldValue: ' 1 '
        });
    });

    it('leaves values that are not strings as they are', () => {
        const date = new Date();
        const input = {
            count: 4,
            active: false,
            missing: null,
            nothing: undefined,
            date
        };

        const result = trimStrings(input);

        expect(result).toEqual(input);
        expect(result.date).toBe(date);
    });

    it('turns a blank string into an empty one', () => {
        expect(trimStrings({ firstName: ' \n ' })).toEqual({ firstName: '' });
    });

    it('does not change the value it was given', () => {
        const input = { firstName: ' Max ' };

        trimStrings(input);

        expect(input).toEqual({ firstName: ' Max ' });
    });

    it('does not let a __proto__ key from a JSON body change the prototype', () => {
        const input = JSON.parse('{"__proto__": {"polluted": " yes "}}');

        const result = trimStrings(input);

        expect(Object.getPrototypeOf(result)).toBe(Object.prototype);
        expect(({} as Record<string, unknown>).polluted).toBeUndefined();
    });
});
