import axios, { AxiosInstance } from 'axios';
import {
    controller
} from 'inversify-express-utils';
import { API_ROUTE } from '../model/enums';
import { AbstractController } from './abstract.controller';

@controller('')
export abstract class RedirectionController
    extends AbstractController {
    protected redirectionTarget: AxiosInstance = axios.create({
        // baseURL: "https://mibi-portal.bfr.bund.de" + API_ROUTE.V2
        baseURL: "http://localhost:3009" + API_ROUTE.V2
    });
}
