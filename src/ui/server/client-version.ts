import fs from 'fs';
import path from 'path';
import { logger } from '../../aspects';

/**
 * Directory the built Angular client is unpacked into at deploy time and that
 * express serves the SPA from. This module compiles next to express.setup.ts,
 * so __dirname is the same for both.
 */
export const PUBLIC_DIR = path.join(__dirname, 'public', 'de');

// Written into the bundle by the client's build (see the client's
// scripts/write-version.js), so the full path is e.g.
// lib/ui/server/public/de/assets/version.json and its content is
// { "version": "<the client's package.json version>" }.
const CLIENT_VERSION_FILE = path.join('assets', 'version.json');

/**
 * Version of the client bundle that is currently deployed next to this server.
 *
 * A browser tab that stays open across a release keeps running the client it
 * loaded originally. Reporting the deployed version lets such a tab notice that
 * it is stale and force a reload before it talks to an API it no longer matches.
 *
 * The server only reads and reports the version, it never decides anything:
 * DefaultSystemInfoController puts the value into GET /v2/info as
 * `clientVersion`, and the client compares it against the version compiled into
 * its own bundle (VersionCheckService in mibi-portal-client).
 *
 * Returns an empty string when no bundle is deployed - e.g. during development,
 * where the client is served by `ng serve` instead. The client treats that as
 * "unknown" and skips the check rather than locking the developer out.
 */
export function readClientVersion(publicDir: string = PUBLIC_DIR): string {
    const versionFile = path.join(publicDir, CLIENT_VERSION_FILE);
    try {
        const raw = fs.readFileSync(versionFile, 'utf-8');
        // A leading byte order mark makes JSON.parse throw, which would
        // disable the outdated-client check without anyone noticing.
        const content: unknown = JSON.parse(
            raw.charCodeAt(0) === 0xfeff ? raw.slice(1) : raw
        );
        const version = (content as { version?: unknown })?.version;
        if (typeof version !== 'string' || !version) {
            logger.warn(
                `Deployed client version file contains no version. file=${versionFile}`
            );
            return '';
        }
        logger.info(`Deployed client version determined. version=${version}`);
        return version;
    } catch (error) {
        logger.warn(
            `Unable to determine the deployed client version, the client will skip its version check. file=${versionFile}, error=${String(
                error
            )}`
        );
        return '';
    }
}
