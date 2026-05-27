import { Container, interfaces } from 'inversify';
import 'reflect-metadata';

class MiBiContainer extends Container {
    // eslint-disable-next-line @typescript-eslint/no-useless-constructor
    constructor(...args: ConstructorParameters<typeof Container>) {
        super(...args);
    }

    bindDependencies(
        func: (...args: unknown[]) => unknown,
        dependencies: interfaces.ServiceIdentifier<unknown>[]
    ) {
        const injections = dependencies.map(dependency => {
            return this.get(dependency);
        });
        return func.bind(func, ...injections);
    }
}

function createContainer(...args: unknown[]): MiBiContainer {
    return new MiBiContainer(
        ...(args as ConstructorParameters<typeof Container>)
    );
}

export { MiBiContainer, createContainer };
