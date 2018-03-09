import { Request, Response, NextFunction } from 'express';
import { addUserData, updateUserData, deleteUserData } from './../interactors';
import { logger } from '../../../../aspects';

async function addUserdata(req: Request, res: Response, next: NextFunction) {
    const body = req.body;
    try {
        const userExt = await addUserData(body.user._id, body.userdata);
        return res
            .status(200)
            .json({
                title: 'Adding userdata ok',
                obj: userExt
            });
    } catch (err) {
        logger.error('Unable to update user data. Reason: ', err);
        return res
            .status(400)
            .json({
                title: 'Error saving user'
            }).end();
    }
}

async function updateUserdata(req: Request, res: Response, next: NextFunction) {
    const body = req.body;

    try {
        await updateUserData(body.user._id, body.userdata);
        return res
            .status(200)
            .json({
                title: 'update userdata ok',
                obj: body.userdata
            });
    } catch (err) {
        return res
            .status(400)
            .json({
                title: 'err updating userdata',
                obj: err
            });
    }
}

async function deleteUserdata(req: Request, res: Response, next: NextFunction) {
    const ids = req.params.id;
    const entries = ids.split('&');

    if (entries.length < 2) {
        return res
            .status(400)
            .json({
                title: 'bad request deleting userdata'
            });

    }
    const userdataId = entries[0];
    const userId = entries[1];
    try {
        const updatedUser = await deleteUserData(userdataId, userId);
        return res
            .status(200)
            .json({
                title: 'delete userdata ok',
                obj: updatedUser
            });
    } catch (err) {
        return res
            .status(400)
            .json({
                title: 'error deleting userdata',
                obj: err
            });
    }

}
export {
    addUserdata,
    updateUserdata,
    deleteUserdata
};
