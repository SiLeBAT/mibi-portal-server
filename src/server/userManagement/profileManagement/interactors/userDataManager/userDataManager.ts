import { userRepository, userDataRepository } from "./../../../shared/persistence";
import { logger } from "./../../../../../aspects";
import { IUserExtended } from "./../../../shared/entities";

async function addUserData(userId, userdata): Promise<IUserExtended> {
    try {
        await userDataRepository.saveUserdata(userdata);
        return await userRepository.addDataToUser(userId, userdata);
    }
    catch (err) {
        return null;
    }

}

async function updateUserData(userId, userdata): Promise<boolean> {
    try {
        return await userDataRepository.updateUserData(userId, userdata);
    }
    catch (err) {
        return null;
    }

}

async function deleteUserData(userDataId, userId): Promise<IUserExtended> {
    try {
        await userDataRepository.deleteUserData(userDataId);
        return await userRepository.deleteDataFromUser(userId, userDataId);
    }
    catch (err) {
        return null;
    }

}

export {
    addUserData,
    updateUserData,
    deleteUserData
}