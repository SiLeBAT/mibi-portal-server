import { Request, Response, NextFunction } from 'express';
import { registerUser, IRegisterResponse, RegisterResult } from './../interactors';
import { logger } from '../../../../aspects';

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
    let status = 500;
    const dto = fromRegisterResponseToDTO(response);
    switch (response.result) {
        case RegisterResult.SUCCESS:
            status = 200;
            break;
        case RegisterResult.DUPLICATE:
            status = 409;
            break;
        default:
    }
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
        case RegisterResult.DUPLICATE:
        case RegisterResult.FAIL:
        default:
            error = {
                message: 'Server error during registration occured'
            };
            break;
    }
    return {
        title: response.result === RegisterResult.SUCCESS ? `Please activate your account: An email has been sent to ${response.email} with further instructions`
            : 'Registration failed',
        error
    };

}
