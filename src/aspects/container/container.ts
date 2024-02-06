import { Container } from 'inversify';
import 'reflect-metadata';

class MiBiContainer extends Container {
    // tslint:disable-next-line: no-any
    constructor(...args: any[]) {
        super(...args);
    }

    // tslint:disable-next-line: no-any
    bindDependencies(func: Function, dependencies: any[]) {
        let injections = dependencies.map(dependency => {
            return this.get(dependency);
        });
        return func.bind(func, ...injections);
    }
}
// tslint:disable-next-line: no-any
function createContainer(...args: any[]): MiBiContainer {
    return new MiBiContainer(...args);
}

export { MiBiContainer, createContainer };
