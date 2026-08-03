import config from 'config';
import {
    PutSamplesJSONRequestDTO,
    PutSamplesParsedSheetRequestDTO,
    PutValidatedRequestDTO
} from '../src/ui/server/model/request.model';
import {
    PutSamplesJSONResponseDTO,
    PutSamplesXLSXResponseDTO,
    PutValidatedResponseDTO
} from '../src/ui/server/model/response.model';
import { ParsedSampleSheetDTO } from '../src/ui/server/model/shared-dto.model';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_ROUTE } from '../src/ui/server/model/enums';

const API_URL = config.get('apiUrl');

/**
 * CSRF bootstrap.
 *
 * `express.setup.ts` puts `doubleCsrfProtection` in front of every route and issues
 * the `XSRF-TOKEN` cookie on GET requests only. Any PUT/POST without the matching
 * cookie + `x-xsrf-token` header is rejected with 403 before it reaches a
 * controller, so the suite has to do what the browser does: one GET first, then
 * echo the token back on every mutating call.
 */
let csrfSession: { cookie: string; token: string } | null = null;

async function getCsrfSession(): Promise<{ cookie: string; token: string }> {
    if (csrfSession) {
        return csrfSession;
    }

    const response = await axios.request({
        method: 'GET',
        url: API_URL + API_ROUTE.V2 + '/info',
        validateStatus: () => true
    });

    const setCookie: string[] = (response.headers['set-cookie'] as string[]) || [];
    const cookies = setCookie.map(entry => entry.split(';')[0]);
    const xsrf = cookies.find(entry => entry.startsWith('XSRF-TOKEN='));

    if (!xsrf) {
        throw new Error(
            `No XSRF-TOKEN cookie returned by GET ${API_ROUTE.V2}/info ` +
                `(status ${response.status}). The API is unreachable or no longer ` +
                `issues CSRF tokens — check the stack is up at ${API_URL}.`
        );
    }

    csrfSession = {
        cookie: cookies.join('; '),
        // The cookie carries `token|hash`, URL-encoded (the separator arrives as
        // `%7C`). A browser decodes it before echoing it in the header, and the
        // server's `getTokenFromRequest` splits the header on a literal '|' — so
        // send the decoded value or the split silently yields the whole string and
        // every mutating request comes back 403.
        token: decodeURIComponent(xsrf.substring('XSRF-TOKEN='.length))
    };

    return csrfSession;
}

async function csrfHeaders(): Promise<Record<string, string>> {
    const session = await getCsrfSession();
    return {
        cookie: session.cookie,
        'x-xsrf-token': session.token
    };
}

export class Api {
    static readonly SAMPLES_ENDPOINT = API_ROUTE.V2 + '/samples';
    static readonly SAMPLES_VALIDATED_ENDPOINT = API_ROUTE.V2 + '/samples/validated';

    /**
     * PUT /v2/samples with the browser-parsed sample sheet (MPS-312).
     *
     * This replaces the former `putSamplesXLSX` multipart upload: the API no longer
     * accepts raw excel — `DefaultSamplesController.putSamplesTransformInput` throws
     * `MalformedRequestError` for any multipart/xlsx content type. The .xlsx is
     * parsed in the browser now, so the tests post pre-generated JSON fixtures
     * (see test/data/README.md for how those are produced).
     *
     * The server still runs the NRL enrichment, so the response is a full order.
     */
    static async putSamplesParsedSheet(
        parsedSampleSheet: ParsedSampleSheetDTO
    ): Promise<PutSamplesJSONResponseDTO> {
        const body: PutSamplesParsedSheetRequestDTO = { parsedSampleSheet };
        const axiosConfig: AxiosRequestConfig = {
            method: 'PUT',
            url: API_URL + this.SAMPLES_ENDPOINT,
            data: body,
            headers: {
                ...(await csrfHeaders()),
                'content-type': 'application/json',
                accept: 'application/json'
            },
            responseType: 'json'
        };

        const response = await axios.request(axiosConfig);

        return response.data;
    }

    /** PUT /v2/samples with a validated order, asking for the .xlsx back. */
    static async putSamplesJSON(
        body: PutSamplesJSONRequestDTO
    ): Promise<PutSamplesXLSXResponseDTO> {
        const axiosConfig: AxiosRequestConfig = {
            method: 'PUT',
            url: API_URL + this.SAMPLES_ENDPOINT,
            data: body,
            headers: {
                ...(await csrfHeaders()),
                'content-type': 'application/json',
                accept: 'multipart/form-data'
            },
            responseType: 'json'
        };

        const response = await axios.request(axiosConfig);

        return response.data;
    }

    static async putValidated(
        body: PutValidatedRequestDTO
    ): Promise<PutValidatedResponseDTO> {
        const axiosConfig: AxiosRequestConfig = {
            method: 'PUT',
            url: API_URL + this.SAMPLES_VALIDATED_ENDPOINT,
            data: body,
            headers: {
                ...(await csrfHeaders()),
                accept: 'application/json'
            },
            responseType: 'json'
        };

        const response = await axios.request(axiosConfig);

        return response.data;
    }

    static async freeRequest(
        endpoint: string,
        method:
            | 'GET'
            | 'POST'
            | 'PUT'
            | 'DELETE'
            | 'PATCH'
            | 'OPTIONS'
            | 'HEAD',
        headers: Record<string, string>,
        body: any
    ): Promise<AxiosResponse> {
        const configOptions: AxiosRequestConfig = {
            method: method,
            url: API_URL + endpoint,
            headers: {
                ...(await csrfHeaders()),
                ...headers
            },
            data: body,
            validateStatus: () => true,
            responseType: 'json'
        };

        const response = await axios.request(configOptions);

        return response;
    }
}
