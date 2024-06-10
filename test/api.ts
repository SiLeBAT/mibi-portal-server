import config from 'config';
import { PutValidatedRequestDTO, PutSamplesJSONRequestDTO } from '../src/ui/server/model/request.model';
import { PutValidatedResponseDTO, PutSamplesJSONResponseDTO, PutSamplesXLSXResponseDTO } from '../src/ui/server/model/response.model';
import rp from 'request-promise-native';
import * as request from 'request'; 
import { API_ROUTE } from '../src/ui/server/model/enums';

const API_URL = config.get('apiUrl');

export class Api {
    private static readonly requestOptions: rp.RequestPromiseOptions = {
        json: true,
    };

    static readonly SAMPLES_ENDPOINT = API_ROUTE.V2 + '/samples';
    static readonly SAMPLES_VALIDATED_ENDPOINT = API_ROUTE.V2 + '/samples/validated';

    static putSamplesXLSX(file: Buffer, fileName: string): Promise<PutSamplesJSONResponseDTO> {
        const formData = {
            file: {
                value: file,
                options: {
                    filename: fileName
                }
            }
        }
        return rp.put(API_URL + this.SAMPLES_ENDPOINT, { ...this.requestOptions, formData: formData, headers: { ...this.requestOptions.headers, 'accept': 'application/json' } });
    }

    static putSamplesJSON(body: PutSamplesJSONRequestDTO): Promise<PutSamplesXLSXResponseDTO> {
        return rp.put(API_URL + this.SAMPLES_ENDPOINT, { ...this.requestOptions, body: body, headers: { ...this.requestOptions.headers, 'accept': 'multipart/form-data' } });
    }

    static putValidated(body: PutValidatedRequestDTO): Promise<PutValidatedResponseDTO> {
        return rp.put(API_URL + this.SAMPLES_VALIDATED_ENDPOINT, { ...this.requestOptions, body: body });
    }

    static freeRequest(endpoint: string, method: string, headers: request.Headers, body: any): Promise<rp.FullResponse> {
        const options: rp.RequestPromiseOptions = {
            ...this.requestOptions,
            method: method,
            body: body,
            headers: {
                ...this.requestOptions.headers,
                ...headers
            },
            resolveWithFullResponse: true,
            simple: false
        };
        return rp(API_URL + endpoint, options);
    }
}
