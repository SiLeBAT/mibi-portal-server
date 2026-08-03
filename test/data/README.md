# Integration test data

## Why there are `.parsedsheet.json` files

Since **MPS-312** the API no longer accepts raw excel. The browser parses the `.xlsx`
and PUTs the result as JSON; `DefaultSamplesController.putSamplesTransformInput`
rejects any `multipart/form-data` or `.xlsx` content type with a 400.

The integration tests therefore post **pre-generated JSON**, not files. Each
`<name>.parsedsheet.json` is the exact output of the client's `ExcelParserService`
for the `<name>.xlsx` sitting next to it. The `.xlsx` files are kept as the source of
truth for the data — they are what a user would actually fill in — but no test
uploads them (except `samples.spec.ts`, which uploads one on purpose to assert the
upload path stays closed).

## Regenerating a `.parsedsheet.json`

From a **mibi-portal-client** checkout, so the fixture comes from the same parser the
browser runs — never hand-edit these files:

```bash
cd mibi-portal-client
npm run gen:parsed-sheet -- ../mibi-portal-server/test/data/mps155_timezone_bug_v18.xlsx \
                            ../mibi-portal-server/test/data/mps155_timezone_bug_v18.parsedsheet.json
```

## Regenerating the golden order files

`*.order.json` are recorded API responses. After an intentional change to the NRL
enrichment or the sheet layout, re-record them against a known-good stack and review
the diff:

```bash
cd mibi-portal-server
UPDATE_FIXTURES=1 npm run test:integration
git diff test/data
```

## V18 migration

The fixtures were on the V17 form, which has **22** sample columns. V18 has **24**:
it adds `sequence_id`, `sequence_status` and `additional_marks_avv` (AVV cat. 337),
and drops `primary_production_avv` (AVV cat. 316). The parser maps columns by
position (`FORM_PROPERTIES` in the client's `excel-parser.constants.ts`), so the V17
sheets were being mis-read from `sampling_date` onwards.

The V18 fixtures were produced by copying the sample rows of the V17 sheets onto the
`data/Untersuchungsauftrag-V18.xlsx` template with this column mapping:

| V17 columns | field range | V18 columns |
| --- | --- | --- |
| 0–4 | `sample_id` … `pathogen_text` | 0–4 |
| — | `sequence_id`, `sequence_status` | 5–6 (new, empty) |
| 5–12 | `sampling_date` … `animal_matrix_text` | 7–14 |
| 13 | `primary_production_avv` | dropped — not in V18 |
| — | `additional_marks_avv` | 15 (new, empty) |
| 14–21 | `control_program_avv` … `comment` | 16–23 |

Meta cells are at identical addresses in both versions and were copied verbatim.
`mps155_timezone_bug_v18_validated.json` got the same field remapping, plus
`sender.zip` + `sender.city` merged into `sender.zipCity`.

The V17 originals are kept alongside for reference and are not used by any test.

## The `validation/` directory

`MiBi-TEST_Error-Codes_A_v18.xlsx` encodes its own expectations: each row's
**comment** column lists the validation error codes that row must produce. The spec
compares that list against what the API returns.

Two rows changed during the V18 migration:

- **Sample 28** (`XY12345-031`) now expects **72**. Its AVV id matches no state
  format, and 72 is exactly what the API returns once `states` is seeded — see
  `test/state-regex.spec.ts`.
- **Sample 55** previously set `primary_production_avv = "000|000|"` and expected
  **100** ("code not in AVV DatA catalogue no. 316"). V18 removes that field, and
  error 100 no longer exists anywhere — it is in neither `validation-constraints.ts`
  (which goes 99 → 101) nor the `validationerrors` collection. The row was
  repointed at the V18 equivalent: `additional_marks_avv = "000|000|"` against
  catalogue **avv337**, expecting **125**. Same intent, current field.

## Prerequisite: seeded `states`

`state-regex.spec.ts` and sample 28 above need the `states` collection populated, or
the AVV format rule has an empty regex list and checks nothing. The e2e stack seeds it
via `mibi-portal-client/e2e/seed/seed-states.js`.
