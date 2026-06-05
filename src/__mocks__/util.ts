import { TestContainer } from './test-container';

interface NewBindings {
    id: symbol;
    instance: unknown;
}

export function rebindMocks<T>(
    container: TestContainer | null,
    serviceId: symbol,
    newBindings: NewBindings[]
): T {
    if (!container) {
        throw Error();
    }
    newBindings.forEach(binding => {
        container.rebind(binding.id).toConstantValue(binding.instance);
    });

    return container.get<T>(serviceId);
}
