import _ from 'lodash';
import { logger } from '../src/aspects';
import { PutValidatedRequestDTO } from '../src/ui/server/model/request.model';
import {
    SampleDTO,
    SampleValidationErrorDTO
} from '../src/ui/server/model/shared-dto.model';
import { Api } from './api';
import { loadParsedSheet } from './fixtures';

/**
 * The AVV sample id must match one of the AVV formats configured per federal state
 * (the `states` collection, seeded from master-data/data/db/states/states.json).
 * A mismatch is validation error 72.
 *
 * These tests exist because that rule was silently inert: the regex list ships empty
 * in validation-constraints.ts and is only filled from the states collection at
 * runtime, and `matchesRegexPattern` treats an empty list as "nothing to check".
 * Both failure modes below therefore look exactly like a passing test unless they
 * are asserted explicitly:
 *
 *   1. the `states` collection is missing/empty in the test database, or
 *   2. the state-specific constraints are not installed for the request.
 *
 * `should actually be enforcing the state AVV formats` is the guard against that.
 */

// The id does not match any state format at all.
const STATE_REGEX_ERROR_CODE = 72;
// MPC-291: the id matches a state format, but for a different year than the
// sampling (or isolation) date.
const YEAR_MISMATCH_ERROR_CODE = 127;

// Matches none of the seeded state formats, for any year.
const INVALID_AVV_ID = 'XX-INVALID-ID';
// Hessen's `^yy[0-9]{7}$` with a 2019 sampling date: yy -> 19.
const VALID_AVV_ID = '191234567';
const SAMPLING_DATE = '01.01.2019';

async function validateWithAvvId(
    avvId: string,
    samplingDate: string = SAMPLING_DATE,
    isolationDate?: string
): Promise<SampleDTO> {
    // Start from a known-good sheet so every unrelated field stays valid, then
    // override just the AVV id and the dates the year placeholder resolves against.
    const parsedSampleSheet = _.cloneDeep(
        loadParsedSheet('mps155_timezone_bug_v18.parsedsheet.json')
    );
    parsedSampleSheet.samples = parsedSampleSheet.samples.slice(0, 1);
    parsedSampleSheet.samples[0].data.sample_id_avv.value = avvId;
    parsedSampleSheet.samples[0].data.sampling_date.value = samplingDate;
    if (isolationDate !== undefined) {
        parsedSampleSheet.samples[0].data.isolation_date.value = isolationDate;
    }

    const parsed = await Api.putSamplesParsedSheet(parsedSampleSheet);
    const request: PutValidatedRequestDTO = { order: parsed.order };
    const validated = await Api.putValidated(request);

    return validated.order.sampleSet.samples[0];
}

function codesFor(sample: SampleDTO, field: string): number[] {
    const errors: SampleValidationErrorDTO[] =
        sample.sampleData[field].errors || [];
    return errors.map(error => error.code);
}

describe('Test state AVV id formats', () => {
    it('should actually be enforcing the state AVV formats', async () => {
        expect.assertions(1);

        const sample = await validateWithAvvId(INVALID_AVV_ID);
        const codes = codesFor(sample, 'sample_id_avv');

        if (!codes.includes(STATE_REGEX_ERROR_CODE)) {
            logger.error(
                `sample_id_avv "${INVALID_AVV_ID}" matches no state AVV format, ` +
                    `but the API returned codes [${codes.join(', ')}]. The state ` +
                    `regex rule is inert — check that the 'states' collection is ` +
                    `seeded and that setStateSpecificConstraints runs for this request.`
            );
        }

        expect(codes).toContain(STATE_REGEX_ERROR_CODE);
    });

    it('should accept an AVV id matching a state format for the sampling year', async () => {
        expect.assertions(1);

        const sample = await validateWithAvvId(VALID_AVV_ID);

        expect(codesFor(sample, 'sample_id_avv')).not.toContain(
            STATE_REGEX_ERROR_CODE
        );
    });

    it('should resolve the year placeholder against the sampling date', async () => {
        expect.assertions(2);

        // Same id, sampled four years later: `yy` no longer resolves to 19, and the
        // rule only tolerates the sampling year +/- 1.
        const sample = await validateWithAvvId(VALID_AVV_ID, '01.01.2023');
        const codes = codesFor(sample, 'sample_id_avv');

        // MPC-291: the format is a valid state format, only the year disagrees with
        // the sampling date — so this must be the year message, not the misleading
        // "the format seems incorrect" one.
        expect(codes).toContain(YEAR_MISMATCH_ERROR_CODE);
        expect(codes).not.toContain(STATE_REGEX_ERROR_CODE);
    });

    it('should use the isolation date when no sampling date is given', async () => {
        expect.assertions(2);

        // MPC-291: with no sampling date the year comes from the isolation date.
        const mismatched = await validateWithAvvId(VALID_AVV_ID, '', '01.01.2023');
        expect(codesFor(mismatched, 'sample_id_avv')).toContain(
            YEAR_MISMATCH_ERROR_CODE
        );

        const matched = await validateWithAvvId(VALID_AVV_ID, '', '01.01.2019');
        expect(codesFor(matched, 'sample_id_avv')).not.toContain(
            YEAR_MISMATCH_ERROR_CODE
        );
    });

    it('should not flag an empty AVV id', async () => {
        expect.assertions(1);

        const sample = await validateWithAvvId('');

        expect(codesFor(sample, 'sample_id_avv')).not.toContain(
            STATE_REGEX_ERROR_CODE
        );
    });
});
