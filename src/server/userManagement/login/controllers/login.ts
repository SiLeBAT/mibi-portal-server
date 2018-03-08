import { Request, Response, NextFunction } from 'express';
import { loginUser, LoginResult, ILoginResponse } from './../interactors';

export async function login(req: Request, res: Response, next: NextFunction) {
    const body = req.body;
    let response: ILoginResponse;
    try {
        // FIXME: Should only find user.
        response = await loginUser({ email: body.email, password: body.password });
    } catch (err) {
        response = {
            result: LoginResult.FAIL
        };
    }
    let status = 401;
    const dto = fromLoginResponseToDTO(response);
    switch (response.result) {
        case LoginResult.SUCCESS:
            status = 200;
            break;
        default:
    }
    return res
        .status(status)
        .json(dto)
        .end();

}

function mapper(response: ILoginResponse) {
    let obj;
    if (response.user) {
        obj = {
            _id: response.user.uniqueId,
            firstName: response.user.firstName,
            lastName: response.user.lastName,
            email: response.user.email,
            token: response.token,
            institution: response.user.institution,
            userdata: response.user.userdata
        };
    }
    return obj;
}

function fromLoginResponseToDTO(response: ILoginResponse) {
    let error;
    let obj;
    switch (response.result) {
        case LoginResult.SUCCESS:
            obj = mapper(response);
            break;
        case LoginResult.INACTIVE:
            error = {
                message: 'Your account is not yet activated'
            };
            break;
        case LoginResult.FAIL:
            error = {
                message: 'Username or password invalid'
            };
            break;
        default:
            error = {
                message: 'Unknown error'
            };
            break;
    }
    return {
        title: response.result === LoginResult.SUCCESS ? 'Login successful' : 'Login failed',
        error,
        obj
    };

}
