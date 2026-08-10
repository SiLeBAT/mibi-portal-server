/// <reference types='jest' />

import fs from 'fs';
import os from 'os';
import path from 'path';
import { readClientVersion } from '../client-version';

describe('readClientVersion', () => {
    let publicDir: string;

    beforeEach(() => {
        publicDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mibi-client-'));
        fs.mkdirSync(path.join(publicDir, 'assets'));
    });

    afterEach(() => {
        fs.rmSync(publicDir, { recursive: true, force: true });
    });

    function writeVersionFile(content: string) {
        fs.writeFileSync(
            path.join(publicDir, 'assets', 'version.json'),
            content,
            'utf-8'
        );
    }

    it('should read the version of the deployed client bundle', () => {
        writeVersionFile(JSON.stringify({ version: '3.5.0' }));
        expect(readClientVersion(publicDir)).toBe('3.5.0');
    });

    it('should read the version from a file with a byte order mark', () => {
        writeVersionFile(`\uFEFF${JSON.stringify({ version: '3.5.0' })}`);
        expect(readClientVersion(publicDir)).toBe('3.5.0');
    });

    it('should return an empty version if no client bundle is deployed', () => {
        expect(readClientVersion(publicDir)).toBe('');
    });

    it('should return an empty version if the version file is unreadable', () => {
        writeVersionFile('not json');
        expect(readClientVersion(publicDir)).toBe('');
    });

    it('should return an empty version if the version file holds no version', () => {
        writeVersionFile(JSON.stringify({ version: '' }));
        expect(readClientVersion(publicDir)).toBe('');
    });
});
