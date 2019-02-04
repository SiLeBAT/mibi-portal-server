import { Schema, Document } from 'mongoose';
import { Address } from '../../../../../app/ports';

export interface IInstitutionModel extends Document {
	created: Date;
	updated: Date;
	state_short: string;
	name1: string;
	name2: string;
	location: string;
	address1: Address;
	address2: Address;
	phone: string;
	fax: string;
	email: string[];
}

export const institutionSchema = new Schema({
	state_short: {
		type: String,
		required: true
	},
	name1: {
		type: String,
		required: true
	},
	name2: {
		type: String
	},
	location: {
		type: String,
		required: true
	},
	address1: {
		street: {
			type: String
		},
		city: {
			type: String
		}
	},
	address2: {
		street: {
			type: String
		},
		city: {
			type: String
		}
	},
	phone: {
		type: String,
		required: true
	},
	fax: {
		type: String
	},

	email: [
		{
			type: String
		}
	],
	created: {
		type: Date,
		default: Date.now,
		required: true
	},
	updated: {
		type: Date,
		default: Date.now,
		required: true
	}
}).pre('save', function(next) {
	if (this) {
		let doc = this as IInstitutionModel;
		let now = new Date();
		if (!doc.created) {
			doc.created = now;
		}
		doc.updated = now;
	}
	next();
});
