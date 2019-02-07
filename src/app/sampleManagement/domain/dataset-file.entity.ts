export interface IDatasetFile {
    originalname: string;
    encoding: string;
    mimetype: string;
    size: number;
    buffer: Buffer;
}

export interface ISenderInfo {
    email: string;
    instituteId: string;
    comment: string;
    recipient: string;
}
