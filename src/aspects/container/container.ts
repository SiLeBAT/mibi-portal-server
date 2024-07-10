import 'reflect-metadata';

import { Container } from 'inversify';


// tslint:disable-next-line: no-any
export function getContainer(...args: any[]) {
    return new Container(...args);
}
