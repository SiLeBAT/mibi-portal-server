# Importing BfR results

Posts a JSON file of analysis results to `POST /v2/orders/results`. Each result
is stored as one `Result` row in the database, linked to an existing `Sample`
by its Parse objectId.

This is the interim path for hand-made test data. Later a KNIME workflow will
push real LIMS results at the same endpoint.

There are four ways to send the request — a Bash script, a PowerShell script, a
raw `curl` command, and a Bruno collection. All four send exactly the same
request and read the key from the **same environment variable**.

## Payload format

A top-level **array**. Each element is one result object, whose single property
name is the sample's Parse objectId:

```json
[
  { "snPlXS7wIY": { "Citrat": "kW", "H2S": "-", "O-AG": "166" } },
  { "y4NvFfFNdg": { "Serovar": "S. Typhimurium", "Seroformel": "(1), 4, 12:i:1,2" } },
  { "y4NvFfFNdg": { "Serovar": "S. Brandenburg",  "Seroformel": "4,12:i:1,2" } }
]
```

Every element becomes one `Result` row, so the array above creates three rows —
the last two both pointing at sample `y4NvFfFNdg`, which is how a sample gets a
second result. Results are always **appended**; `position` continues from the
highest position that sample already has.

> **It must be an array, not an object.**
> A JSON *object* keyed by sample id cannot carry two results for the same
> sample: duplicate keys are silently dropped by every JSON parser, so one of
> the two results disappears before the file is even sent. Both scripts refuse
> a file whose top-level value is an object.

`scripts/data/results.example.json` is a complete working example.

### Getting sample objectIds

The objectIds in the example file are test data and will not exist in your
database. Real ones come from the read endpoint, as `samples[].id`:

```bash
curl --silent -X POST "${MIBI_API_URL}/v2/orders/samples-with-results" \
     -H 'Content-Type: application/json' \
     -H "Authorization: Bearer ${JWT}" \
     -d '{"orderId":"<order objectId>"}'
```

## The API key

Authentication is a shared key sent in the `X-MiBi-Api-Key` header. It is the
value of `general.resultsApiKey` on the server you are posting to.

**The key is never committed and never passed as an argument.** Neither script
accepts a `--key` flag: command-line arguments are visible to every user on the
host via `ps` and are written to the shell history.

Set it in your shell:

```bash
export MIBI_RESULTS_API_KEY='<the key>'
```

Or, on a shared host where an exported variable can be read from
`/proc/<pid>/environ`, point at a file that contains only the key:

```bash
export MIBI_RESULTS_API_KEY_FILE="$HOME/.mibi-results-api-key"
chmod 600 "$HOME/.mibi-results-api-key"
```

## Configuration

| Variable | Default | Purpose |
|---|---|---|
| `MIBI_API_URL` | `http://localhost:3000` | Portal base URL. The same variable the integration tests use. |
| `MIBI_RESULTS_API_KEY` | *(required)* | The API key. |
| `MIBI_RESULTS_API_KEY_FILE` | — | Alternative: path to a file holding only the key. |

Host URLs: qa is `https://epilab-dev.bfr.berlin`, production is
`https://mibi-portal.bfr.bund.de`.

## Bash

```bash
export MIBI_RESULTS_API_KEY='<the key>'

# Validate the file and show the request without sending it
scripts/import-results.sh --file scripts/data/results.example.json --dry-run

# Send it
scripts/import-results.sh --file scripts/data/results.example.json

# Against another environment
scripts/import-results.sh --file my-results.json --url https://epilab-dev.bfr.berlin
```

| Flag | Meaning |
|---|---|
| `--file <path>` | The results JSON file. Required. |
| `--url <base>` | Portal base URL. Overrides `MIBI_API_URL`. |
| `--dry-run` | Validate and print the equivalent curl with the key redacted. Sends nothing. |
| `--help` | Usage. |

## PowerShell

```powershell
$env:MIBI_RESULTS_API_KEY = '<the key>'

./scripts/import-results.ps1 -File scripts/data/results.example.json -DryRun
./scripts/import-results.ps1 -File scripts/data/results.example.json
./scripts/import-results.ps1 -File my-results.json -Url https://epilab-dev.bfr.berlin
```

Same flags as the Bash script (`-File`, `-Url`, `-DryRun`) and the same exit
codes.

## Raw curl

```bash
export MIBI_RESULTS_API_KEY='<the key>'

curl --show-error --silent \
     -X POST "${MIBI_API_URL:-http://localhost:3000}/v2/orders/results" \
     -H 'Content-Type: application/json' \
     -H "X-MiBi-Api-Key: ${MIBI_RESULTS_API_KEY}" \
     --data-binary @scripts/data/results.example.json
```

or without exporting the environment variable MIBI_RESULTS_API_KEY

the results data are read in from a json file, you must be located relative to the path to the file:

```bash
curl --show-error --silent \
     -X POST "http://localhost:3000/v2/orders/results" \
     -H 'Content-Type: application/json' \
     -H "X-MiBi-Api-Key: <the key>" \
     --data-binary @scripts/data/results.example.json
```

or the results json is added directly to the body of the curl request:

```bash
curl --show-error --silent \
     -X POST "http://localhost:3000/v2/orders/results" \
     -H 'Content-Type: application/json' \
     -H "X-MiBi-Api-Key: localResultsApiKey" \
     --data-binary @- <<'JSON'
[
  {
    "snPlXS7wIY": {
      "Citrat": "kW",
      "H2S": "-",
      "Indol": "+",
      "Lactose": "+",
      "O-AG": "166",
      "e-hly": "+",
      "eae": "-",
      "stx1": "+",
      "stx2": "-",
      "CHL": "8",
      "CIP": "0,015",
      "COL": "<=2",
      "GEN": "<=0,25"
    }
  },
  {
    "yQRDBvDI08": {
      "Citrat": "kW",
      "H2S": "-",
      "Indol": "+",
      "Lactose": "+",
      "O-AG": "4",
      "e-hly": "+",
      "eae": "-",
      "stx1": "+",
      "stx2": "-",
      "CHL": "",
      "CIP": "",
      "COL": "",
      "GEN": ""
    }
  },
  ...
  {
    "y4NvFfFNdg": {
      "Serovar": "S. Typhimurium",
      "Seroformel": "(1), 4, 12:i:1,2"
    }
  },
  {
    "y4NvFfFNdg": {
      "Serovar": "S. Brandenburg",
      "Seroformel": "4,12:i:1,2"
    }
  }
]
JSON
```



Two details worth keeping:

- Reference `$MIBI_RESULTS_API_KEY` rather than pasting the key, so it stays out
  of `~/.bash_history`.
- Use `--data-binary`, not `-d`. `-d` strips newlines, which is harmless for
  JSON but makes the request unreadable in a proxy log.

`--dry-run` on the Bash script prints this exact command for whatever file and
URL you gave it, with the key redacted.

## Bruno

The collection lives in [`bruno/`](../bruno) at the repository root.

1. Open the `bruno/` folder as a collection in Bruno.
2. Copy `bruno/.env.example` to `bruno/.env` and fill in `MIBI_RESULTS_API_KEY`.
   `.env` is gitignored.
3. Pick the `Local` or `QA` environment and run **Store Results**.

The request reads the key as `{{process.env.MIBI_RESULTS_API_KEY}}`, so the
collection itself contains no secret and can be committed and reviewed like any
other file. It is the same variable the scripts use, so one `export` covers
everything.

## Exit codes

| Code | Meaning |
|---|---|
| `0` | Success, or a completed dry run. |
| `1` | Usage problem: missing/unknown flag, file not found, file is not a usable results array. |
| `2` | Configuration problem: no API key available. |
| `3` | The request failed — either it could not be sent, or the server answered `>= 400`. |

## Troubleshooting

| Symptom | Cause |
|---|---|
| `HTTP 401` | Wrong key, missing header, or the server has no `general.resultsApiKey` configured — it fails closed, so an unconfigured server rejects every request. |
| `HTTP 400` `Malformed request` | The body is not an array, or is an empty array. Refused by the server before it reaches the database. |
| `HTTP 422` naming unknown sample objectIds | One or more sample objectIds do not exist. Nothing was written; the import is all-or-nothing. Fix the file and re-run. |
| `HTTP 403` `Invalid CSRF token` | The route lost its CSRF exemption in `express.setup.ts`. |
| `HTTP 404` | The endpoint is not deployed on that server yet. |
| A result silently missing | The file is a JSON object instead of an array — see the warning above. |
