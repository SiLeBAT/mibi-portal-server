import config from 'config';
import express from 'express';
import nodemailer from 'nodemailer';
import { ParseServer } from 'parse-server';
import { logger } from './../../aspects';
const FSFilesAdapter = require('@parse/fs-files-adapter');
// tslint:disable-next-line: no-any
const parseServer: any = config.get('parseServer');
const dataDir: string = config.get('dataStore.dataDir');
const fsAdapter = new FSFilesAdapter({
    filesSubDirectory: '../' + dataDir
});
const app = express();

const transporter = nodemailer.createTransport({
    sendmail: true,
    newline: 'unix',
    path: '/usr/sbin/sendmail'
});

const parseConfig = {
    ...parseServer,
    filesAdapter: fsAdapter,
    emailAdapter: {
        module: 'parse-server-api-mail-adapter',
        options: {
            // The email address from which emails are sent.
            sender: 'sender@example.com',
            templates: {
                exampleTemplate: {
                    subjectPath: './lib/files/custom_email_subject.txt',
                    textPath: './lib/files/custom_email.txt',
                    htmlPath: './lib/files/custom_email.html'
                }
            },
            // tslint:disable-next-line: no-any
            apiCallback: async ({ payload }: { payload: any }) => {
                const customPayload = {
                    ...payload
                };
                await transporter.sendMail(customPayload);
            }
        }
    }
};
const server = new ParseServer(parseConfig);

// Start server
server.start().then(() => {
    // Serve the Parse API on the /parse URL prefix
    app.use('/admin/parse', server.app);

    app.listen(1337, function () {
        logger.info('Parse-server running on port 1337.');
    });
});
