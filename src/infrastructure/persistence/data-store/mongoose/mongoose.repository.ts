import { Document, Model, Types } from 'mongoose';
import {
    RepositoryBase,
    ModelAttributes,
    UpdateResponse
} from '../../../../app/ports';

export interface IMongooseUpdateResponse extends UpdateResponse {
    ok: number;
}

export class MongooseRepositoryBase<T extends Document>
    implements RepositoryBase<Document> {
    private _model: Model<T>;

    constructor(schemaModel: Model<T>) {
        this._model = schemaModel;
    }

    create(item: T) {
        return this._model.create(item);
    }

    retrieve() {
        return this._model.find({}).exec();
    }

    update(
        _id: string,
        attr: ModelAttributes
    ): Promise<IMongooseUpdateResponse> {
        return this._model
            .update(
                { _id: this.toObjectId(_id) },
                { ...attr, ...{ updated: Date.now() } }
            )
            .exec();
    }

    delete(_id: string) {
        return this._model.remove({ _id: _id }).exec();
    }

    findById(_id: string) {
        return this._model.findById(_id).exec();
    }

    findOne(cond?: Object) {
        return this._model.findOne(cond).exec();
    }

    find(cond?: Object, fields?: Object, options?: Object): Promise<T[]> {
        return this._model.find(cond, options).exec();
    }

    private toObjectId(_id: string): Types.ObjectId {
        return Types.ObjectId.createFromHexString(_id);
    }
}

function createRepository<T extends Document>(
    schema: Model<T>
): RepositoryBase<T> {
    return new MongooseRepositoryBase(schema);
}

export { createRepository };
