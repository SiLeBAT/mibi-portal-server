import { IInstitution } from "../../entities";
import { repository } from "./../../persistence";

function retrieveInstitutions(): Promise<IInstitution[]> {
    return repository.getAll();
}

export {
    retrieveInstitutions
}