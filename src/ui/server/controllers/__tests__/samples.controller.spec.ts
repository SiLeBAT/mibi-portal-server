/// <reference types='jest' />

import { Request } from 'express';
import mockRes from 'mock-express-response';

const mockPost = jest.fn();

jest.mock('axios', () => ({
    __esModule: true,
    default: {
        create: () => ({ post: mockPost })
    }
}));

import { TokenPort } from '../../../../app/authentication/model/token.model';
import { UserPort } from '../../../../app/authentication/model/user.model';
import { AppServerConfiguration } from '../../ports';
import { DefaultSamplesController } from '../samples.controller';

function makeController(): DefaultSamplesController {
    return new DefaultSamplesController(
        {} as TokenPort,
        {} as UserPort,
        {
            parseAPI: 'http://parse.test',
            appId: 'test-app'
        } as AppServerConfiguration
    );
}

function makeRequest(): Request {
    return {
        body: { order: { sampleSet: { samples: [], meta: {} } } },
        currentActor: { email: 'user@example.com' },
        headers: {}
    } as unknown as Request;
}

describe('DefaultSamplesController.postSubmitted', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('passes a successful submission through with 200', async () => {
        const order = { sampleSet: { samples: [], meta: {} } };
        mockPost.mockResolvedValue({ data: { result: { order } } });
        const res = new mockRes();

        await makeController().postSubmitted(makeRequest(), res);

        expect(res.statusCode).toBe(200);
        expect(res._getJSON()).toEqual({ order });
    });

    // The cloud function reports a refused order by returning an error DTO,
    // which Parse delivers with a 200. Relaying that as a 200 would make a
    // rejected submission look successful to an API user.
    it('answers 422 when the cloud function refused the order', async () => {
        const errorDTO = {
            code: 13,
            message: 'Different analysis procedures were requested.',
            order: { sampleSet: { samples: [], meta: {} } }
        };
        mockPost.mockResolvedValue({ data: { result: errorDTO } });
        const res = new mockRes();

        await makeController().postSubmitted(makeRequest(), res);

        expect(res.statusCode).toBe(422);
        expect(res._getJSON()).toEqual(errorDTO);
    });

    it('keeps the error details so the sender learns what is wrong', async () => {
        const errorDTO = {
            code: 13,
            message: 'The analysis procedure vaccination is not offered.',
            order: { sampleSet: { samples: [], meta: {} } },
            findings: [{ issue: 'PROCEDURE_NOT_OFFERED_BY_NRL' }]
        };
        mockPost.mockResolvedValue({ data: { result: errorDTO } });
        const res = new mockRes();

        await makeController().postSubmitted(makeRequest(), res);

        expect(res._getJSON().findings).toEqual(errorDTO.findings);
        expect(res._getJSON().message).toBe(errorDTO.message);
    });
});
