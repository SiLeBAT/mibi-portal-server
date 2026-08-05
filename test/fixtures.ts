import fs from 'fs';
import path from 'path';
import { logger } from '../src/aspects';
import { ParsedSampleSheetDTO } from './parsed-sample-sheet.model';

export const DATA_DIR = 'test/data/';
export const VALIDATION_DATA_DIR = 'test/data/validation';

/**
 * Set UPDATE_FIXTURES=1 to rewrite the golden files from the live responses instead
 * of asserting against them. Use it after an intentional change to the NRL
 * enrichment or the sample sheet, then review the resulting diff.
 */
const UPDATE_FIXTURES = process.env.UPDATE_FIXTURES === '1';

/**
 * Loads a `parsedSampleSheet` fixture — the JSON the browser produces from an .xlsx
 * since MPS-312. These are generated from the .xlsx next to them by the client's
 * parser; see test/data/README.md.
 */
export function loadParsedSheet(fileName: string): ParsedSampleSheetDTO {
    const filePath = path.join(DATA_DIR, fileName);
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

export function listParsedSheets(dataDir: string): string[] {
    const fileNames = fs
        .readdirSync(path.join('.', dataDir))
        .filter(file => file.endsWith('.parsedsheet.json'))
        .map(file => path.join('.', dataDir, file));

    logger.info(
        `${fileNames.length} parsed sample sheets in directory ${dataDir} are to be tested`
    );

    return fileNames;
}

/**
 * Golden-file helper. Returns the stored expectation so the caller can assert
 * `expect(actual).toEqual(matchGolden(name, actual))`. Under UPDATE_FIXTURES the
 * actual value is written to disk and returned, which makes the assertion pass and
 * leaves a reviewable diff in the working tree.
 */
export function matchGolden<T>(fileName: string, actual: T): T {
    const filePath = path.join(DATA_DIR, fileName);

    if (UPDATE_FIXTURES) {
        fs.writeFileSync(filePath, JSON.stringify(actual, null, 4) + '\n', 'utf8');
        logger.warn(`UPDATE_FIXTURES: rewrote ${filePath}`);
        return actual;
    }

    if (!fs.existsSync(filePath)) {
        throw new Error(
            `Missing golden file ${filePath}. Run the suite once with ` +
                `UPDATE_FIXTURES=1 against a known-good stack, then review the diff.`
        );
    }

    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}
