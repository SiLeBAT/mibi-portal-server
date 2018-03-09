export interface IModelAttributes {
}

export interface IUpdateResponse {
}

export interface IRead<T> {
    retrieve: () => Promise<T[]>;
    findById: (id: string) => Promise<T | null>;
    findOne(cond?: Object): Promise<T | null>;
    find(cond: Object, fields: Object, options: Object): Promise<T[]>;
}

export interface IWrite<T> {
    create: (item: T) => Promise<T>;
    update: (_id: string, attributes: IModelAttributes) => Promise<IUpdateResponse>;
    delete: (_id: string) => Promise<T>;
}

export interface IRepositoryBase<T> extends IRead<T>, IWrite<T> {
}
