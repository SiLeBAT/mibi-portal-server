import { HydratedDocument, Model, Types } from 'mongoose';
import { injectable } from 'inversify';
import { CommonDocument } from './common.model';

export type QueryId = string | Types.ObjectId;

@injectable()
export class MongooseRepositoryBase<T extends CommonDocument> {
    private _model: Model<T>;

    constructor(schemaModel: Model<T>) {
        this._model = schemaModel;
    }

    protected async _create(item: T): Promise<HydratedDocument<T>> {
        return this._model.create(item);
    }

    protected async _retrieve(): Promise<HydratedDocument<T>[]> {
        return this._model.find({}).exec();
    }

    protected async _retrievePopulatedWith<TPopulated extends {}>(
        paths: string[]
    ): Promise<(Omit<HydratedDocument<T>, keyof TPopulated> & TPopulated)[]> {
        return this._model.find({}).populate<TPopulated>(paths).exec();
    }

    protected async _update(
        id: QueryId,
        attr: Partial<T>
    ): Promise<HydratedDocument<T> | null> {
        return this._model
            .findByIdAndUpdate(this._toObjectId(id), {
                ...attr,
                updated: new Date()
            })
            .exec();
    }

    protected async _delete(id: QueryId): Promise<HydratedDocument<T> | null> {
        return this._model.findByIdAndRemove(this._toObjectId(id)).exec();
    }

    protected async _findById(
        id: QueryId
    ): Promise<HydratedDocument<T> | null> {
        return this._model.findById(this._toObjectId(id)).exec();
    }

    protected async _findOne(cond: {}): Promise<HydratedDocument<T> | null> {
        return this._model.findOne(cond).exec();
    }

    protected async _find(cond: {}): Promise<HydratedDocument<T>[]> {
        return this._model.find(cond).exec();
    }

    private _toObjectId(id: QueryId): Types.ObjectId {
        return new Types.ObjectId(id);
    }
}

function createRepository<T extends CommonDocument>(schema: Model<T>) {
    return new MongooseRepositoryBase(schema);
}

export { createRepository };
