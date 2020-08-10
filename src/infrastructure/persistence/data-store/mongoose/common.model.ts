import { Document } from 'mongoose';

export interface CommonModel extends Document {
    created: Date;
    updated: Date;
}
