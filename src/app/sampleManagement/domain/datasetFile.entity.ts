export interface IDatasetFile {
    originalname: string;
    encoding: string;
    mimetype: string;
    size: number;
    buffer: Buffer;
}

export interface ISenderInfo {
    firstName: string;
    lastName: string;
    email: string;
    institution: string;
    location: string;
}
