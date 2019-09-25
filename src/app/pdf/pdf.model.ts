export interface PDFService {
    createPDF(docDefinition: {}, tableLayouts: {}): Promise<Buffer> 
};