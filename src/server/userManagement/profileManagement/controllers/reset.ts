
import { resetPassword, IResetResponse, ResetResult } from './../interactors';

async function reset(req, res, next) {
    const body = req.body;

    let response: IResetResponse;

    try {
        response = await resetPassword(req.params.token, req.body.newPw);
    } catch (err) {
        response = {
            result: ResetResult.FAIL,
        }
    }
    let status = 400;
    const dto = fromResetResponseToDTO(response);
    switch (response.result) {
        case ResetResult.SUCCESS:
            status = 200;
            break;
        default:
    }
    return res
        .status(status)
        .json(dto)
        .end();
}

function fromResetResponseToDTO(response: IResetResponse) {
    let title;
    switch (response.result) {
        case ResetResult.SUCCESS:
            title = 'Please login with your new password'
            break;
        case ResetResult.EXPIRED:
        default:
            title = 'Reset password request expired, please try again';
            break;
    }
    return {
        title
    }
}

export {
    reset
}