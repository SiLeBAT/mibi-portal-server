export interface CSVConfig<T extends string, R> {
    filterFunction?: (data: { [header in T]: string }) => boolean;
    mappingFunction: (data: { [header in T]: string }) => R;
    delimiter?: string;
    headers: true | { [header in T]: number };
}
