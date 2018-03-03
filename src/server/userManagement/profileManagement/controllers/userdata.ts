import { addUserData, updateUserData, deleteUserData } from './../interactors';

async function addUserdata(req, res, next) {
    const body = req.body;
    let response = res
        .status(400)
        .json({
            title: 'Error saving user'
        })
        .end();

    try {
        const user_ext = await addUserData(body.user._id, body.userdata);
        if (!!user_ext) {
            response = res
                .status(200)
                .json({
                    title: 'Adding userdata ok',
                    obj: user_ext
                })
                .end();
        }
    }
    catch (err) {
        return response;
    }
    return response;
}

async function updateUserdata(req, res, next) {
    const id = req.params._id;
    const body = req.body;

    try {
        const user_ext = await updateUserData(body.user._id, body.userdata);
        return res
            .status(200)
            .json({
                title: 'update userdata ok',
                obj: body.userdata
            });
    }
    catch (err) {
        return res
            .status(400)
            .json({
                title: 'err updating userdata',
                obj: err
            });
    }
}

async function deleteUserdata(req, res, next) {
    const ids = req.params.ids;
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
    }
    catch (err) {
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
}