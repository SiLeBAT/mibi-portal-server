import { injectable } from 'inversify';
import { WritableBufferStream } from '../core/writable-buffer-stream';
import { PDFService } from './pdf.model';

let PdfPrinter = require('pdfmake');

@injectable()
export class DefaultPDFService implements PDFService {
    private readonly standard14Fonts = {
        Courier: {
            normal: 'Courier',
            bold: 'Courier-Bold',
            italics: 'Courier-Oblique',
            bolditalics: 'Courier-BoldOblique'
        },
        Helvetica: {
            normal: 'Helvetica',
            bold: 'Helvetica-Bold',
            italics: 'Helvetica-Oblique',
            bolditalics: 'Helvetica-BoldOblique'
        },
        Times: {
            normal: 'Times-Roman',
            bold: 'Times-Bold',
            italics: 'Times-Italic',
            bolditalics: 'Times-BoldItalic'
        },
        Symbol: {
            normal: 'Symbol'
        },
        ZapfDingbats: {
            normal: 'ZapfDingbats'
        }
    };

    private readonly printer = new PdfPrinter(this.standard14Fonts);

    async createPDF(docDefinition: {}, tableLayouts: {}): Promise<Buffer> {
        const pdfDoc = this.printer.createPdfKitDocument(docDefinition, {
            tableLayouts: tableLayouts
        });

        return this.printPDFToBuffer(pdfDoc);
    }

    // tslint:disable-next-line:no-any
    private async printPDFToBuffer(pdfDoc: any): Promise<Buffer> {
        return new Promise<Buffer>((resolve, reject) => {
            let bufferStream = new WritableBufferStream();
            bufferStream.on('finish', () => {
                resolve(bufferStream.toBuffer());
            });
            bufferStream.on('error', reject);

            pdfDoc.pipe(bufferStream);
            pdfDoc.end();
        });
    }
}
