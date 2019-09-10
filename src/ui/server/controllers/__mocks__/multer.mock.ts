export function addMulterSingleFileFormToMockRequest(
    req: {},
    fieldName: string,
    file: Buffer,
    fileName: string
): { file: {} } {
    const multerMock = {
        fieldname: fieldName,
        originalname: fileName,
        encoding: '7bit',
        mimetype: 'application/octet-stream',
        size: file.buffer.byteLength,
        buffer: file
    };
    return { ...req, file: multerMock };
}
