import { Model, Types, CreateQuery } from 'mongoose';
import { injectable } from 'inversify';
import { CommonModel } from './common.model';

@injectable()
export class MongooseRepositoryBase<T extends CommonModel> {
    private _model: Model<T>;

    constructor(schemaModel: Model<T>) {
        this._model = schemaModel;
    }

    protected _create(item: CreateQuery<T>) {
        return this._model.create(item);
    }

    protected _retrieve() {
        return this._model.find({}).exec();
    }

    protected _retrievePopulatedWith(populate: string[]) {
        let query = this._model.find({});
        populate.forEach(p => {
            query = query.populate(p);
        });
        return query.exec();
    }

    protected _update(_id: string, attr: Partial<T>) {
        return this._model
            .findByIdAndUpdate(
                this._toObjectId(_id),
                { ...attr, updated: Date.now() },
                { useFindAndModify: false }
            )
            .exec();
    }

    protected _delete(_id: string) {
        return this._model.findByIdAndRemove(_id).exec();
    }

    protected _findById(_id: string) {
        return this._model.findById(_id).exec();
    }

    protected _findOne(cond: {}) {
        return this._model.findOne(cond).exec();
    }

    protected _find(cond: {}, fields?: Object, options?: Object): Promise<T[]> {
        return this._model.find(cond, options).exec();
    }

    private _toObjectId(_id: string): Types.ObjectId {
        return Types.ObjectId.createFromHexString(_id);
    }
}

function createRepository<T extends CommonModel>(schema: Model<T>) {
    return new MongooseRepositoryBase(schema);
}

export { createRepository };
