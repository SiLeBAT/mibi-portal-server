import { IUserDataRepository } from "./../interactors";
import { Userdata } from "./../../../../peripherals/dataStore";


class MongooseUserDataRepository implements IUserDataRepository {
    saveUserdata(userdata: any): Promise<boolean> {
        const newUserdata = new Userdata(userdata);
        return newUserdata.save().then(
            model => ({
                firstName: model.firstName,
                lastName: model.lastName,
                email: model.email
            })
        );
    }

    updateUserData(id, userdata): Promise<boolean> {
        return Userdata.findByIdAndUpdate(
            id,
            {
                $set: {
                    department: userdata.department,
                    contact: userdata.contact,
                    phone: userdata.phone,
                    email: userdata.email,
                    updated: Date.now()
                }
            },
            { 'new': true }
        )
    }

    deleteUserData(id): Promise<any> {
        return Userdata.findByIdAndRemove(id);
    }
}

export const repository: IUserDataRepository = new MongooseUserDataRepository();