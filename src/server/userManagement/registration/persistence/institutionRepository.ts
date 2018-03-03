import { IInstitutionRepository } from "./../interactors";
import { Institution } from "./../../../../peripherals/dataStore";


class MongooseInstitutionRepository implements IInstitutionRepository {
    getAll() {
        return Institution.find().lean();
    }
}

export const repository: IInstitutionRepository = new MongooseInstitutionRepository();