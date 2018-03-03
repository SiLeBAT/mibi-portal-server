import * as jwt from 'jsonwebtoken';
import { logger } from './../../../../aspects';
import { activateUser, IActivationResponse, ActivateResult } from './../interactors';

export async function activate(req, res, next) {

    let response;
    try {
        response = await activateUser(req.params.token);
    } catch (err) {
        response = {
            result: ActivateResult.FAIL
        }
    }

    let status = 400;
    const dto = fromActivateResponseToDTO(response);
    switch (response.result) {
        case ActivateResult.SUCCESS:
            status = 200;
            break;
        default:
    }
    return res
        .status(status)
        .json(dto)
        .end();
}

function fromActivateResponseToDTO(response: IActivationResponse) {
    let title;
    switch (response.result) {
        case ActivateResult.SUCCESS:
            title = 'Account Activation successful!'
            break;
        case ActivateResult.EXPIRED:
            title = 'Account Activation expired, please try again'
            break;
        case ActivateResult.FAIL:
        default:
            title = 'Account Activation unsuccessfull, please try again'
            break;
    }
    return {
        title
    }

}