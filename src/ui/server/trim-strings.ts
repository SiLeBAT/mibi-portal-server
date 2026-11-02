import _ from 'lodash';

/**
 * Values under these keys are kept exactly as they are, at any depth: a password
 * may legally start or end with a space, and `oldValue` records the original
 * input of a corrected sample entry.
 */
const UNTRIMMED_KEYS = ['password', 'oldValue'];

/**
 * Returns a copy of the value with leading and trailing whitespace and line
 * breaks removed from every string in it. Whitespace inside a string is kept.
 *
 * Only arrays and plain objects are walked, so anything else (numbers, dates,
 * buffers) passes through untouched.
 */
export function trimStrings<T>(value: T): T {
    return trimValue(value) as T;
}

function trimValue(value: unknown): unknown {
    if (typeof value === 'string') {
        return value.trim();
    }
    if (Array.isArray(value)) {
        return value.map(trimValue);
    }
    if (_.isPlainObject(value)) {
        return _.mapValues(value as object, (entry: unknown, key: string) =>
            UNTRIMMED_KEYS.includes(key) ? entry : trimValue(entry)
        );
    }
    return value;
}
