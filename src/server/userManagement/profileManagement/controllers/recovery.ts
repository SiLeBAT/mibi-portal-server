
import { Request, Response, NextFunction } from 'express';
import { recoverPassword, IRecoverResponse, RecoverResult } from './../interactors';

export async function recovery(req: Request, res: Response, next: NextFunction) {
    const body = req.body;

    let response: IRecoverResponse;

    try {
        response = await recoverPassword({
            email: body.email,
            host: req.headers['host'],
            userAgent: req.headers['user-agent']
        });
    } catch (err) {
        response = {
            result: RecoverResult.FAIL,
            email: body.email
        };
    }
    let status = 400;
    const dto = fromRecoverResponseToDTO(response);
    switch (response.result) {
    case RecoverResult.SUCCESS:
        status = 200;
        break;
    default:
    }
    return res
        .status(status)
        .json(dto)
        .end();
}

function fromRecoverResponseToDTO(response: IRecoverResponse) {
    let title;
    switch (response.result) {
    case RecoverResult.SUCCESS:
        title = `An email has been sent to ${response.email} with further instructions`;
        break;
    case RecoverResult.FAIL:
    default:
        title = `An error occured while sending an email to ${response.email} with further instructions. Please try again`;
        break;
    }
    return {
        title
    };

}
