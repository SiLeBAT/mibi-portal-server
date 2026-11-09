import { AxiosResponse } from 'axios';
import JSZip from 'jszip';
import { Attachment, ParsedMail } from 'mailparser';
import { logger } from '../src/aspects';
import { PostSubmittedRequestDTO } from '../src/ui/server/model/request.model';
import { Api } from './api';
import { MailCatcher } from './mail-catcher';

const MPS155 = 'mps155_timezone_bug_v18';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const mps155Order: PostSubmittedRequestDTO = require(`./data/${MPS155}_validated.json`);

const XLSX_MIME =
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
const PDF_MIME = 'application/pdf';

const SENDER_COPY_SUBJECT = 'Neuer Auftrag an das BfR';
const NRL_SUBJECT = /^Neuer Auftrag von .+ an (NRL-[\w-]+)$/;

/**
 * Submitting sends real mail: one to each NRL the order is split across (or to
 * `application.jobRecipient` when set) and a copy to the sender's institute. Against
 * a shared host that reaches real inboxes, so the spec is opt-in, and it needs the
 * server on this machine anyway because of where the mail goes (see mail-catcher.ts).
 *
 *   MIBI_TEST_SUBMIT=1 npm run test:integration -- --runInBand
 *
 * The defaults are the e2e seed's enabled user (mibi-portal-client/e2e/seed/seed-users.js).
 */
const SUBMIT_ENABLED = process.env.MIBI_TEST_SUBMIT === '1';
const USER_EMAIL = process.env.MIBI_TEST_USER_EMAIL || 'user1@test.com';
const USER_PASSWORD =
    process.env.MIBI_TEST_USER_PASSWORD || 'user1secrettestpassword';

if (!SUBMIT_ENABLED) {
    logger.warn(
        'Skipping the send-samples mail specs. Set MIBI_TEST_SUBMIT=1 to run them ' +
            'against a server running on this machine.'
    );
}
const describeSubmit = SUBMIT_ENABLED ? describe : describe.skip;

/** `mps155_timezone_bug_v18.xlsx` → `mps155_timezone_bug_v18_NRL-AR_validated.pdf` */
function attachmentName(nrl: string, extension: string): string {
    const base = (mps155Order.order.sampleSet.meta.fileName as string).split(
        '.xlsx'
    )[0];
    return `${base}_${nrl}_validated${extension}`;
}

type SubmittedSample = {
    sampleData: { sample_id_avv: { value: string } };
    sampleMeta: { nrl: string };
};

function submittedSamples(response: AxiosResponse): SubmittedSample[] {
    return response.data.order.sampleSet.samples;
}

/** The NRLs the server assigned, i.e. the NRLs the order is split across. */
function expectedNRLs(response: AxiosResponse): string[] {
    return [
        ...new Set(
            submittedSamples(response).map(sample => sample.sampleMeta.nrl)
        )
    ].sort();
}

function sampleIdsAVVFor(response: AxiosResponse, nrl: string): string[] {
    return submittedSamples(response)
        .filter(sample => sample.sampleMeta.nrl === nrl)
        .map(sample => sample.sampleData.sample_id_avv.value);
}

/** All XML parts of an .xlsx joined, enough to look for cell values in. */
async function xlsxText(content: Buffer): Promise<string> {
    const zip = await JSZip.loadAsync(content);
    const parts = Object.keys(zip.files).filter(name => name.endsWith('.xml'));
    const texts = await Promise.all(
        parts.map(name => zip.files[name].async('string'))
    );
    return texts.join('\n');
}

function expectPDF(attachment: Attachment) {
    expect(attachment.contentType).toEqual(PDF_MIME);
    expect(attachment.content.subarray(0, 5).toString('latin1')).toEqual(
        '%PDF-'
    );
    // A truncated PDF loses its trailer first.
    expect(attachment.content.subarray(-1024).toString('latin1')).toContain(
        '%%EOF'
    );
}

describe('Test submit samples endpoint', () => {
    it('should reject a submission without a token', async () => {
        expect.assertions(1);

        // Stopped by the JWT guard before the controller runs, so no mail goes out
        // and this is safe on any host.
        const response = await Api.freeRequest(
            Api.SAMPLES_SUBMITTED_ENDPOINT,
            'POST',
            { 'content-type': 'application/json' },
            mps155Order
        );

        expect(response.status).toEqual(401);
    });
});

describeSubmit('Test submit samples endpoint: mail attachments', () => {
    const mailCatcher = new MailCatcher();
    let response: AxiosResponse;
    // Stays empty when the submission is refused, so the mail specs fail on their
    // assertions instead of a TypeError.
    let mails: ParsedMail[] = [];

    // One submission for the whole block: every submit mails the NRLs again.
    beforeAll(async () => {
        await mailCatcher.start();
        const token = await Api.login(USER_EMAIL, USER_PASSWORD);
        response = await Api.postSubmitted(mps155Order, token);
        if (response.status === 200) {
            // One mail per NRL plus the sender's copy.
            mails = await mailCatcher.waitFor(
                expectedNRLs(response).length + 1
            );
        }
    });

    afterAll(async () => {
        await mailCatcher.stop();
    });

    it('should accept the order and report the sender copy as sent', () => {
        expect.assertions(3);

        expect(response.status).toEqual(200);
        expect(response.data.customerCopySent).toBe(true);
        expect(response.data.order.sampleSet.samples).toHaveLength(
            mps155Order.order.sampleSet.samples.length
        );
    });

    it('should mail each NRL its samples as validated excel', async () => {
        const nrls = expectedNRLs(response);
        const nrlMails = mails.filter(mail =>
            NRL_SUBJECT.test(mail.subject || '')
        );

        expect(
            nrlMails
                .map(mail => NRL_SUBJECT.exec(mail.subject || '')![1])
                .sort()
        ).toEqual(nrls);

        for (const mail of nrlMails) {
            const nrl = NRL_SUBJECT.exec(mail.subject || '')![1];

            expect(mail.attachments).toHaveLength(1);
            const [excel] = mail.attachments;
            expect(excel.filename).toEqual(attachmentName(nrl, '.xlsx'));
            expect(excel.contentType).toEqual(XLSX_MIME);
            // A .xlsx is a zip archive.
            expect(excel.content.subarray(0, 2).toString('latin1')).toEqual(
                'PK'
            );

            const text = await xlsxText(excel.content);
            const sampleIds = sampleIdsAVVFor(response, nrl);
            expect(sampleIds.length).toBeGreaterThan(0);
            for (const sampleId of sampleIds) {
                expect(text).toContain(sampleId);
            }
        }
    });

    it('should mail the sender a copy with one PDF per NRL', () => {
        const senderCopies = mails.filter(
            mail => mail.subject === SENDER_COPY_SUBJECT
        );

        expect(senderCopies).toHaveLength(1);
        const [copy] = senderCopies;

        expect(
            copy.attachments.map(attachment => attachment.filename).sort()
        ).toEqual(
            expectedNRLs(response).map(nrl => attachmentName(nrl, '.pdf'))
        );
        copy.attachments.forEach(expectPDF);
    });
});
