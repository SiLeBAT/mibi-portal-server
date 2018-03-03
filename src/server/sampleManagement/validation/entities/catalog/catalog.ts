import * as _ from 'lodash';
import { ServerError } from './../../../../../aspects';

export interface ICatalog<T> {
    getEntriesWithKeyValue(key: string, value: string): T[];
    getEntryWithId(id: string): T;
    containsEntryWithId(id: string): boolean;
    containsEntryWithKeyValue(key: string, value: string): boolean;
    hasUniqueId(): boolean;
    getUniqueId(): string;
}

interface ICatalogData<T> {
    [key: string]: T;
}

export class Catalog<T> implements ICatalog<T> {

    constructor(private data: ICatalogData<T>, private uId?: string) {

    }

    public containsEntryWithId(id: string): boolean {
        return !!this.getEntryWithId(id);
    }

    public containsEntryWithKeyValue(key: string, value: string): boolean {
        return !(this.getEntriesWithKeyValue(key, value).length === 0);
    }

    public hasUniqueId(): boolean {
        return !!this.getUniqueId();
    }

    public getUniqueId(): string {
        return this.uId;
    }

    public getEntriesWithKeyValue(key: string, value: string): T[] {
        const result = _.filter(this.data, e => e[key] === value);
        return result;
    }

    public getEntryWithId(id: string): T {
        if (!this.hasUniqueId) {
            throw new ServerError("Invalid Operation: No Unique Id defined for this Catalog");
        }
        return this.getEntriesWithKeyValue(this.uId, id)[0];
    }
}