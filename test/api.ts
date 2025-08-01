import config from 'config';
import { PutValidatedRequestDTO, PutSamplesJSONRequestDTO } from '../src/ui/server/model/request.model';
import {
    PutValidatedResponseDTO,
    PutSamplesJSONResponseDTO,
    PutSamplesXLSXResponseDTO
} from '../src/ui/server/model/response.model';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import FormData from 'form-data';
import { API_ROUTE } from '../src/ui/server/model/enums';

const API_URL = config.get('apiUrl');

export class Api {
    static readonly SAMPLES_ENDPOINT = API_ROUTE.V2 + '/samples';
    static readonly SAMPLES_VALIDATED_ENDPOINT = API_ROUTE.V2 + '/samples/validated';


    static async putSamplesXLSX(file: Buffer, fileName: string): Promise<PutSamplesJSONResponseDTO> {

        console.log('api.ts, API_URL: ', API_URL);

        const formData = new FormData();
        formData.append('file', file, { filename: fileName });
        const formHeaders = formData.getHeaders();


        const axiosConfig: AxiosRequestConfig = {
            method: 'PUT',
            url: API_URL + this.SAMPLES_ENDPOINT,
            data: formData,
            headers: {
                ...formHeaders,
                'accept': 'application/json'
            },
            responseType: 'json'
        };

        // return (await axios.request(axiosConfig));

        const response = await axios.request(axiosConfig);

        // console.log('putSamplesXLSX, /samples endpoint, response: ', JSON.stringify(response, null, 2));

        return response.data as PutSamplesJSONResponseDTO;



        // Merge in any extra headers you need. We set Accept to application/json.
        // const axiosConfig: AxiosRequestConfig = {
        //     headers: {
        //         ...formHeaders,
        //         'accept': 'application/json'
        //     }
        // };

        // // Execute the PUT request using axios.
        // const response = await axios.put(
        //     API_URL + this.SAMPLES_ENDPOINT,
        //     formData,
        //     axiosConfig
        // );

        // console.log('putSamplesXLSX, /samples endpoint, response.data: ', JSON.stringify(response.data, null, 2));

        // // Return the data field of the response.
        // return response.data;




    }

    static async putSamplesJSON(body: PutSamplesJSONRequestDTO): Promise<PutSamplesXLSXResponseDTO> {
        const axiosConfig: AxiosRequestConfig = {
            method: 'PUT',
            url: API_URL + this.SAMPLES_ENDPOINT,
            data: body,
            headers: {
                'accept': 'multipart/form-data',
            },
            responseType: 'json'
        };

        const response = await axios.request(axiosConfig);

        return response.data;
    }

    static async putValidated(body: PutValidatedRequestDTO): Promise<PutValidatedResponseDTO> {
        const axiosConfig: AxiosRequestConfig = {
            method: 'PUT',
            url: API_URL + this.SAMPLES_VALIDATED_ENDPOINT,
            data: body,
            headers: {
                'accept': 'application/json',
            },
            responseType: 'json'
        };

        const response = await axios.request(axiosConfig);

        return response.data;
    }

    static async freeRequest(
        endpoint: string,
        method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD',
        headers: Record<string, string>,
        body: any): Promise<AxiosResponse>
    {
        const configOptions: AxiosRequestConfig = {
            method: method,
            url: API_URL + endpoint,
            headers: {
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
