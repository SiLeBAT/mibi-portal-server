import { Container, interfaces } from 'inversify';
import 'reflect-metadata';

class MiBiContainer extends Container {
    bindDependencies(
        func: (...args: unknown[]) => unknown,
        dependencies: interfaces.ServiceIdentifier[]
    ) {
        const injections = dependencies.map(dependency => {
            return this.get(dependency);
        });
        return func.bind(func, ...injections);
    }
}

function createContainer(
    containerOptions?: interfaces.ContainerOptions
): MiBiContainer {
    return new MiBiContainer(containerOptions);
}

export { MiBiContainer, createContainer };
