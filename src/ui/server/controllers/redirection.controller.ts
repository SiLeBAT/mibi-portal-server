import axios, { AxiosInstance } from 'axios';
import {
    controller
} from 'inversify-express-utils';
import { AbstractController } from './abstract.controller';

@controller('')
export abstract class RedirectionController
    extends AbstractController {
    protected redirectionTarget: AxiosInstance = axios.create({
        baseURL: "https://mibi-portal.bfr.bund.de"
    });;

    constructor(
    ) {
        super();
    }
}
