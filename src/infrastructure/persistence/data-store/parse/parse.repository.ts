import Parse from 'parse/node';
import { injectable } from 'inversify';

@injectable()
export class ParseRepositoryBase<T extends Parse.Object<Parse.Attributes>> {
    private _className: string;

    protected setClassName(className: string) {
        this._className = className;
    }

    protected async _matches(key: string, regexp: RegExp, modfiers: string): Promise<T | undefined> {
        return new Parse.Query<T>(this._className)
            .matches(key, regexp, modfiers)
            .first({ useMasterKey: true });
    }

    protected async _retrieve(): Promise<T[]> {
        return new Parse.Query<T>(this._className)
            .find({ useMasterKey: true });
    }

    protected async _retrieveRelationObjects(relation: Parse.Relation): Promise<Parse.Object<Parse.Attributes>[]> {
        return relation
            .query()
            .find({ useMasterKey: true });
    }

    protected async _retrieveIncludingWith(paths: string[], key?: string, value?: T['attributes'][string | number]): Promise<T[]> {
        const query = new Parse.Query<T>(this._className);
        if (key && value) {
            query.equalTo(key, value);
        }

        return query
            .include(paths)
            .find({ useMasterKey: true });
    }

    protected async _findById<U extends Parse.Object<Parse.Attributes>>(id: string, className?: string, includingAll?: boolean): Promise<T | U | undefined> {
        let query: Parse.Query;
        if (className) {
            query = new Parse.Query<U>(className);
        } else {
            query = new Parse.Query<T>(this._className);
        }
        if (includingAll) {
            query.includeAll();
        }

        return query.get(id, { useMasterKey: true }) as Promise<T | U | undefined>;
    }

    protected async _create(item: T): Promise<T> {
        return item
            .save(null, { useMasterKey: true });
    }

    protected async _findIdByMatchingQuery<U extends Parse.Object<Parse.Attributes>>(
        matchingClass: string,
        matchingId: string,
        equalTo: [string, T['attributes'][string]],
        pointerField: string
    ): Promise<T[]> {
        const matchingQuery = new Parse.Query<U>(matchingClass);
        // tslint:disable-next-line
        matchingQuery.get(matchingId, { useMasterKey: true });

        return new Parse.Query<T>(this._className)
            .equalTo(equalTo[0], equalTo[1])
            .matchesQuery(pointerField, matchingQuery)
            .find({ useMasterKey: true });
    }

    protected async _delete(parseObject: T): Promise<T> {
        return parseObject.destroy({ useMasterKey: true });
    }

    protected async _findOne(key: string, value: T['attributes'][string | number]): Promise<T | undefined> {
        return new Parse.Query<T>(this._className)
            .equalTo(key, value)
            .first({ useMasterKey: true });
    }

    protected async _update<U extends Parse.Attributes>(
        parseObject: T,
        attr: U
    ): Promise<T | undefined> {
        return parseObject.save(attr, { useMasterKey: true });
    }
}
