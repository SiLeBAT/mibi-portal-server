# Importing BfR results

Posts a JSON array of analysis results to `POST /v2/orders/results`. Each result
is stored as one `Result` row in the database, linked to an existing `Sample`
by its Parse objectId.

The endpoint is called with `curl` by hand for test data, and from a KNIME
workflow for the real LIMS results. Both send exactly the same request: one
HTTP POST, two headers, the JSON array as the body. No login, no session, no
cookies.

## Payload format

A top-level **array**. Each element is one result object, whose single property
name is the sample's Parse objectId:

```json
[
  { "snPlXS7wIY": { "Citrat": "kW", "H2S": "-", "O-AG": "166" } },
  { "y4NvFfFNdg": { "Serovar": "S. Typhimurium", "Seroformel": "(1), 4, 12:i:1,2" } },
  { "y4NvFfFNdg": { "Serovar": "S. Brandenburg",  "Seroformel": "4,12:i:1,2" } },
  { "lYdFT3kHx8": { "Gattung": "Yersinia", "Biotyp": 4, "MHK CHL": null } }
]
```

Every element becomes one `Result` row, so the array above creates four rows —
the middle two both pointing at sample `y4NvFfFNdg`, which is how a sample gets a
second result. Results are always **appended**; `position` continues from the
highest position that sample already has.

### Value types

A result value may be a **string, a number, a boolean or `null`** — whatever the
LIMS delivers. Values are stored and returned exactly as sent, so `"Biotyp": 4`
stays the number 4 and `null` stays null; the client turns them into text for the
grid and the CSV, rendering `null` as an empty cell.

**Arrays and nested objects are rejected**, because the client would display them
as `1,2` or `[object Object]`.

Note that a value looking like a number is not necessarily one. In the example
above `"O-AG": "166"` is deliberately a string, and a German decimal such as
`"CIP": "0,015"` cannot be a JSON number at all — only a value the LIMS itself
sends unquoted arrives as a number.

> **It must be an array, not an object.**
> A JSON *object* keyed by sample id cannot carry two results for the same
> sample: duplicate keys are silently dropped by every JSON parser, so one of
> the two results disappears before the file is even sent. The server refuses a
> payload whose top-level value is an object, with `400 Malformed request`.

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

Authentication is a shared key sent in the `X-MiBi-Api-Key` header. Its value is
`general.resultsApiKey` on the server you are posting to — in local development
that is `config/local.json`.

The server **fails closed**: an environment with no key configured rejects every
request, so it can never be written to by accident.

You can either paste the key into the command or export it and reference the
variable. Referencing it keeps the key out of your shell history and out of the
process list, where command-line arguments are visible to other users on the
host:

```bash
export MIBI_RESULTS_API_KEY='<the key>'
```

## Configuration

| Variable | Default | Purpose |
|---|---|---|
| `MIBI_API_URL` | `http://localhost:3000` | Portal base URL. The same variable the integration tests use. |
| `MIBI_RESULTS_API_KEY` | — | The API key, when you reference it instead of pasting it. |

Host URLs: qa is `https://epilab-dev.bfr.berlin`, production is
`https://mibi-portal.bfr.bund.de`.

## Sending the request with curl

Three variants of the same request. They differ only in where the key and the
payload come from.

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
     -H "X-MiBi-Api-Key: <Api Key>" \
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

The third variant is abridged — the `...` stands for the remaining entries, and
the array has to be replaced with the data you actually want to import.

### What the command does, piece by piece

The second variant is the shortest complete one, so it serves as the walk-through.
Each line is explained below.

**`curl`** — the program that sends the HTTP request.

**`--show-error --silent`** — a pair that belongs together.

- `--silent` suppresses the progress meter *and* error messages. Without it, curl
  draws a progress bar that clutters the output.
- `--show-error` puts the error messages back. Without it, a failure such as "the
  server is not running" produces **no output at all**, which looks deceptively
  like success.

**`-X POST`** — the HTTP method. It is in fact **redundant** here: `--data-binary`
already makes curl use POST. It does no harm and documents the intent, so it can
stay.

**`"http://localhost:3000/v2/orders/results"`** — the address. `http://localhost:3000`
is the local development server; `/v2/orders/results` is this endpoint. The double
quotes are not strictly needed for this URL, but they are a good habit: an URL
containing `&` would otherwise be cut in two by the shell.

**`-H 'Content-Type: application/json'`** — tells the server that the body is JSON.
**Do not leave this out.** Without it curl announces the body as
`application/x-www-form-urlencoded`, the server does not parse it, and the request
is answered with `400 Malformed request` — which looks like a problem with the JSON
when in truth the body was never read. This is the first thing to check whenever a
400 makes no sense.

**`-H "X-MiBi-Api-Key: <the key>"`** — the shared secret that authorises the call,
as described under [The API key](#the-api-key). Missing or wrong gives `401`.

Note the quoting difference between the two header lines. Single quotes mean "pass
this through unchanged"; double quotes let the shell substitute variables, which is
why the first variant needs them for `${MIBI_RESULTS_API_KEY}`. With a literal
value either kind works.

**`--data-binary @scripts/data/results.example.json`** — the body, and three things
at once:

- The **`@`** means "read the body from this file". Without it, curl would send the
  file *name* as the body.
- The path is **relative to the directory you are standing in** — hence the note
  above the command. An absolute path removes that constraint.
- **`--data-binary`, not `-d`.** When `-d` reads from a file it strips newlines. The
  JSON stays valid, but the request becomes one unreadable line in every log.
  `--data-binary` sends the bytes exactly as they are.

**The trailing `\`** on each line continues the command on the next line. It must be
the very last character — a single space after it breaks the command in a way that
is hard to see.

### How the three variants differ

| | Key comes from | Payload comes from |
|---|---|---|
| 1 | `$MIBI_RESULTS_API_KEY` (exported beforehand) | the example file |
| 2 | typed into the command | the example file |
| 3 | typed into the command | typed into the command |

The third uses **`--data-binary @-`**, where `-` means "read the body from standard
input", and a *here-document* supplies it: everything between `<<'JSON'` and the
closing `JSON` becomes the body. Two details matter there:

- The delimiter is **quoted** (`<<'JSON'`, not `<<JSON`). That stops the shell
  interpreting `$`, backticks and backslashes inside the data. Unquoted, a `$` in a
  result value would silently vanish.
- The closing `JSON` must stand alone at the beginning of its own line.

A practical difference: a value containing a **single quote** would break the
single-quoted parts of variants 1 and 2, but not the here-document.

### Seeing what happened

curl prints only the response body, and `--silent` hides everything else — so by
default you do not see the HTTP status code. For testing, ask for it:

```bash
curl --show-error --silent -w '\nstatus=%{http_code}\n' ...   # just the status code
curl --show-error --silent -i ...                             # full response headers
curl -v ...                                                   # also the headers sent
```

`-v` is the one to reach for when you suspect the key is not arriving: it shows the
request headers that actually went out.

A successful import answers `200` with a summary:

```json
{
  "storedResultCount": 7,
  "orders": [ { "orderId": "D9iQERFiCb", "results": "6/12" } ],
  "created": [
    { "objectId": "Rst001", "sampleObjectId": "snPlXS7wIY", "position": 1 }
  ]
}
```

`storedResultCount` is the number of `Result` rows created, `orders` carries each
affected order's recalculated progress counter, and `created` lists every new row —
which is what lets you delete exactly what an import inserted.

## Doing the same in a KNIME workflow

The endpoint is an ordinary HTTP POST, so a **POST Request** node can call it
directly. This section assumes the results are already available as a JSON array —
producing that array from the LIMS view is a separate part of the workflow and not
described here.

### The curl command mapped onto the node

| In the curl command | In the POST Request node |
|---|---|
| `-X POST` | nothing to set — the node *is* the POST |
| the URL | the connection settings: a constant URL, e.g. `https://epilab-dev.bfr.berlin/v2/orders/results` |
| `-H 'Content-Type: application/json'` | a custom request header |
| `-H "X-MiBi-Api-Key: …"` | a custom request header |
| `--data-binary @file` / `@-` | the request body: the JSON array as a String |
| *(nothing)* | authentication: leave it at **None** |

Four points decide whether this works on the first try.

### 1. One row is one request

The node sends **one request per row** of its input table. The whole JSON array is
*one* payload, so it has to sit in **one cell of one row** — typically a single
String column with exactly one row.

If the workflow instead produces one row per sample and feeds that in, the node
fires one import per row. With 23 samples that is 23 separate imports, each
containing a fraction of the data, and each appending its own `Result` rows.

### 2. Both headers must be added explicitly

Add two custom request headers:

| Header | Value |
|---|---|
| `Content-Type` | `application/json` |
| `X-MiBi-Api-Key` | the API key |

Sending a String body does **not** imply a JSON content type. If `Content-Type` is
missing, the server does not parse the body and answers `400 Malformed request` —
the same trap described for curl above.

### 3. The API token is a header, not HTTP authentication

Leave the node's authentication setting at **None**. The token is a custom header,
not HTTP authentication: choosing BASIC or DIGEST there makes KNIME send an
`Authorization` header, which this endpoint ignores, so the call fails with `401`
while the dialog looks correctly filled in.

For the header value, prefer a **flow variable or a credential** over typing the key
into the dialog. A constant header value is saved inside the workflow's settings, so
the secret travels with the workflow whenever it is exported, shared or checked in.
A credential or a flow variable supplied at run time keeps it out of the file.

### 4. Let the node show you the response

Configure the node's error handling so that it **outputs the response body and
status code** instead of failing on an HTTP error. The body is where this endpoint
explains itself:

- `422` names either the malformed element (with its index and the offending key) or
  every unknown sample objectId.
- `401` means the key was missing, wrong, or not configured on the server.

If the node simply fails on error, that message is lost and all you see is that the
node turned red.

On success the response body is the summary shown earlier
(`storedResultCount`, `orders`, `created`), which is worth keeping in the workflow
output as a record of what was imported.

### What you do not need

No cookies, no session, no login call and no CSRF token. This route is deliberately
exempt from the portal's CSRF protection so that a machine client can post with a
single header — which is also why the key must be treated as a real secret.

### A note on the dialog labels

The settings above are named as they are usually labelled (connection settings,
authentication, request headers, request body, error handling), but the exact tab
and field names differ slightly between KNIME builds. What has to be configured —
the URL, the two headers, the one-row body, authentication off, error handling on —
is the same in every version.

## Troubleshooting

| Symptom | Cause |
|---|---|
| `HTTP 401` | Wrong key, missing header, or the server has no `general.resultsApiKey` configured — it fails closed, so an unconfigured server rejects every request. |
| `HTTP 400` `Malformed request` | The body is not an array, or is an empty array — or `Content-Type: application/json` is missing, so the body was never parsed. |
| `HTTP 422` `code 14` naming an element | That element is malformed: not an object, not exactly one sample objectId, its result data is not an object, or a value is an array or a nested object. The message names the element index and the offending key. |
| `HTTP 422` `code 15` naming unknown sample objectIds | One or more sample objectIds do not exist. Nothing was written; the import is all-or-nothing. Fix the payload and re-run. |
| `HTTP 403` `Invalid CSRF token` | The route lost its CSRF exemption in `express.setup.ts`. |
| `HTTP 404` | The endpoint is not deployed on that server yet. |
| A result silently missing | The payload is a JSON object instead of an array — see the warning under [Payload format](#payload-format). |
| No output at all | `--silent` without `--show-error`. The request failed and curl was told to keep quiet about it. |
