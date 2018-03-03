import { IUserRepository } from "./../interactors";
import { User } from "./../../../../peripherals/dataStore";
import { logger } from "./../../../../aspects";
import { InvalidUserError } from "./../../../../aspects";
import { createUser } from "../entities/user";


class MongooseUserRepository implements IUserRepository {
    getAll() {
        return User.find().lean();
    }
    // FIXME: Remove this
    findByUsernameWithAuxilliary(username) {
        return this.findOne({ email: username })
            .populate({ path: 'institution userdata' })
            .then(
                (user) => {
                    const user_ext = createUser(user._id, user.email, user.firstName, user.lastName, user.institution, user.enabled);
                    user_ext.userdata = user.userdata;
                    return user_ext;
                }
            ).
            catch(
                (err) => {
                    logger.info("User not found: ", username);
                    throw new InvalidUserError();
                }
            );
    }

    findByUsername(username) {

        return this.findOne({ email: username }).then(
            (user) => ({
                firstName: user.firstName,
                lastname: user.lastname,
                email: user.email
            })
        ).
            catch(
                (err) => {
                    logger.info("User not found: ", username);
                    throw new InvalidUserError();
                }
            );
    }

    getPasswordForUser(username) {
        return this.findOne({ email: username }).then(
            user => user.password
        );
    }

    hasUser(username) {
        return User.find({ name: username }).then(
            docs => !!docs.length
        );
    }

    saveUser(user) {
        const newUser = new User(user);
        return newUser.save().then(
            model => ({
                firstName: model.firstName,
                lastName: model.lastName,
                email: model.email
            })
        );
    }

    updateUser(userId, opts) {
        // TODO this is probably not working
        return User.findByIdAndUpdate(userId, opts).then(
            model => ({
                firstName: model.firstName,
                lastName: model.lastName,
                email: model.email
            }),
            err => undefined
        );
    }

    addDataToUser(userId, userdata) {
        return User.findByIdAndUpdate(
            userId,
            { $push: { userdata: userdata._id }, updated: Date.now() },
            { 'new': true }
        )
            .populate({ path: 'institution userdata' })
            .lean().
            then(
                model => ({
                    firstName: model.firstName,
                    lastName: model.lastName,
                    email: model.email,
                    _id: model._id,
                    institution: model.institution,
                    userdata: model.userdata,
                })
            );
    }

    deleteDataFromUser(userId, userdataId) {
        return User.findByIdAndUpdate(
            userId,
            { $pull: { userdata: userdataId }, updated: Date.now() },
            { 'new': true }
        )
            .populate({ path: 'institution userdata' })
            .lean().
            then(
                model => ({
                    firstName: model.firstName,
                    lastName: model.lastName,
                    email: model.email,
                    _id: model._id,
                    institution: model.institution,
                    userdata: model.userdata,
                })
            );
    }

    private findOne(query) {
        return User.findOne(query);
    }
}

export const repository: IUserRepository = new MongooseUserRepository();