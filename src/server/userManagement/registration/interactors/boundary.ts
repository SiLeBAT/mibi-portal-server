import { IInstitution } from "../entities";

export interface IInstitutionRepository {
    getAll(): Promise<IInstitution[]>;
}