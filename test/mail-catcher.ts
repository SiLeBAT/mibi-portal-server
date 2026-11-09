import { ParsedMail, simpleParser } from 'mailparser';
import { SMTPServer } from 'smtp-server';

/**
 * The SMTP port the portal sends to.
 *
 * mibi-parse-cloud's `MailService` (orders/legacy/application/mail.ts) hardcodes
 * `localhost:25` and reads neither host nor port from configuration, so the catcher
 * has to sit exactly there — on the machine the server process runs on. That is why
 * the mail specs only work against a server started on the same host as jest, not
 * against the docker e2e stack, whose server container answers :25 with its own sink.
 */
const SMTP_PORT = 25;

/**
 * `localhost` resolves to 127.0.0.1 or ::1 depending on platform and resolver order,
 * so listen on both. ::1 is optional: a host without IPv6 simply skips it.
 */
const LISTEN_ADDRESSES: { host: string; required: boolean }[] = [
    { host: '127.0.0.1', required: true },
    { host: '::1', required: false }
];

/**
 * Minimal in-process SMTP server for the integration tests. It accepts every mail,
 * parses it with mailparser and keeps it in memory, so a spec can assert on
 * recipients, subjects and attachments of what the portal sent.
 */
export class MailCatcher {
    private servers: SMTPServer[] = [];
    private mails: ParsedMail[] = [];

    async start(): Promise<void> {
        for (const { host, required } of LISTEN_ADDRESSES) {
            const server = this.createServer();
            try {
                await listen(server, host);
                this.servers.push(server);
            } catch (error) {
                if (required) {
                    await this.stop();
                    throw describeListenError(error, host);
                }
            }
        }
    }

    async stop(): Promise<void> {
        await Promise.all(
            this.servers.map(
                server =>
                    new Promise<void>(resolve => server.close(() => resolve()))
            )
        );
        this.servers = [];
    }

    clear(): void {
        this.mails = [];
    }

    get received(): ParsedMail[] {
        return [...this.mails];
    }

    /**
     * Resolves once `count` mails have arrived. The submission only answers after
     * every mail went out, so this normally resolves immediately; the timeout is a
     * safety net that turns a missing mail into a readable failure.
     */
    async waitFor(count: number, timeoutMs = 10000): Promise<ParsedMail[]> {
        const deadline = Date.now() + timeoutMs;
        while (this.mails.length < count) {
            if (Date.now() > deadline) {
                throw new Error(
                    `Expected ${count} mail(s) on localhost:${SMTP_PORT}, got ` +
                        `${this.mails.length}: ` +
                        JSON.stringify(this.mails.map(mail => mail.subject))
                );
            }
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        return this.received;
    }

    private createServer(): SMTPServer {
        return new SMTPServer({
            authOptional: true,
            // Without STARTTLS on offer, nodemailer stays on plain SMTP and the
            // catcher needs no certificate.
            disabledCommands: ['STARTTLS'],
            logger: false,
            onData: (stream, _session, callback) => {
                // Only answer 250 once the mail is parsed and stored: the sender then
                // cannot get ahead of what the spec sees.
                simpleParser(stream).then(
                    mail => {
                        this.mails.push(mail);
                        callback();
                    },
                    (error: Error) => callback(error)
                );
            }
        });
    }
}

function listen(server: SMTPServer, host: string): Promise<void> {
    return new Promise((resolve, reject) => {
        server.once('error', reject);
        server.listen(SMTP_PORT, host, () => {
            server.off('error', reject);
            resolve();
        });
    });
}

function describeListenError(
    error: NodeJS.ErrnoException,
    host: string
): Error {
    switch (error.code) {
        case 'EADDRINUSE':
            return new Error(
                `${host}:${SMTP_PORT} is already in use. Stop the local mail ` +
                    `server or SMTP sink holding it, the mail specs need that port.`
            );
        case 'EACCES':
            return new Error(
                `Not allowed to bind ${host}:${SMTP_PORT}. Port 25 is privileged on ` +
                    `Linux/macOS; run the mail specs with the necessary rights ` +
                    `(e.g. sudo, or setcap cap_net_bind_service on node).`
            );
        default:
            return error;
    }
}
