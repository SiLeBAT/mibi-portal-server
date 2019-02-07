import * as _ from 'lodash';
import * as Fuse from 'fuse.js';
import { ApplicationDomainError } from '../../sharedKernel/errors';

export interface ICatalog<T> {
    getEntriesWithKeyValue(key: string, value: string): T[];
    getUniqueEntryWithId(id: string): T;
    containsUniqueEntryWithId(id: string): boolean;
    containsEntryWithKeyValue(key: string, value: string): boolean;
    hasUniqueId(): boolean;
    getUniqueId(): string;
    // tslint:disable-next-line
    getFuzzyIndex(options: Fuse.FuseOptions, enhamcements?: any[]): Fuse;
    dump(): T[];
}

export class Catalog<T> implements ICatalog<T> {
    constructor(private data: T[], private uId: string = '') {}

    containsUniqueEntryWithId(id: string): boolean {
        return !!this.getUniqueEntryWithId(id);
    }

    containsEntryWithKeyValue(key: string, value: string): boolean {
        return !(this.getEntriesWithKeyValue(key, value).length === 0);
    }

    hasUniqueId(): boolean {
        return !!this.getUniqueId();
    }

    getUniqueId(): string {
        return this.uId;
    }

    getEntriesWithKeyValue(key: string, value: string): T[] {
        // tslint:disable-next-line
        return _.filter(this.data, (e: any) => e[key] === value);
    }

    getUniqueEntryWithId(id: string): T {
        if (!this.hasUniqueId()) {
            throw new ApplicationDomainError(
                `Invalid Operation: No Unique Id defined for this Catalog id=${id}`
            );
        }
        return this.getEntriesWithKeyValue(this.uId, id)[0];
    }

    dump(): T[] {
        return this.data;
    }
    // tslint:disable-next-line
    getFuzzyIndex(options: Fuse.FuseOptions, enhamcements: any[] = []): Fuse {
        const data = this.dump();
        return new Fuse(data.concat(enhamcements), options);
    }
}
