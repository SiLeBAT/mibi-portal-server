import { Types } from 'mongoose';

export interface CommonDocument {
    _id: Types.ObjectId;
    created: Date;
    updated: Date;
}
