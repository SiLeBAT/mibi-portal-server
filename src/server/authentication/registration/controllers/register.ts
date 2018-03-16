import * as config from 'config';
import { Request, Response, NextFunction } from 'express';
import { registerUser, IRegisterResponse, RegisterResult } from './../interactors';
import { logger } from '../../../../aspects';

const SUPPORT_CONTACT = config.get('supportContact');
export async function register(req: Request, res: Response, next: NextFunction) {
    const body = req.body;

    let response: IRegisterResponse;

    const credentials = {
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        password: body.password,
        institution: body.institution,
        userAgent: req.headers['user-agent'] as string,
        host: req.headers['host'] as string
    };
    try {
        response = await registerUser(credentials);

    } catch (err) {
        logger.error(`Unable to register user, err=${err}`);
        response = {
            result: RegisterResult.FAIL
        };
    }

    let status = (response.result === RegisterResult.SUCCESS) ? 200 : 500;
    const dto = fromRegisterResponseToDTO(response);
    return res
        .status(status)
        .json(dto)
        .end();
}

function fromRegisterResponseToDTO(response: IRegisterResponse) {
    let error;
    switch (response.result) {
        case RegisterResult.SUCCESS:
            break;
        case RegisterResult.FAIL:
        default:
            error = {
                message: 'Server error during registration occured'
            };
            break;
    }
    return {
        title: response.result === RegisterResult.SUCCESS ? `Please activate your account: An email has been sent to ${response.email} with further instructions`
            : `Registration failed. Please contact support: ${SUPPORT_CONTACT}`,
        error
    };

}
