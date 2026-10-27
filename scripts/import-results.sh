#!/bin/bash
#
# Import BfR analysis results into the MiBi-Portal.
#
# Posts a JSON file to POST /v2/orders/results. Every element of the file's
# top-level array becomes one Result row, linked to a Sample by its Parse
# objectId. See scripts/import-results.md for the payload format.
#
# Configuration comes from the environment:
#
#   MIBI_API_URL               base URL of the portal server
#                              (default: http://localhost:3000)
#   MIBI_RESULTS_API_KEY       the API key                        (required)
#   MIBI_RESULTS_API_KEY_FILE  path to a file holding the key, as an
#                              alternative to MIBI_RESULTS_API_KEY
#
# The key is deliberately NOT accepted as a command-line argument: arguments
# are visible to every user on the host via `ps` and are written to the shell
# history.

set -o errexit
set -o nounset
set -o pipefail

readonly DEFAULT_API_URL='http://localhost:3000'
readonly ENDPOINT_PATH='/v2/orders/results'
readonly API_KEY_HEADER='X-MiBi-Api-Key'

readonly EXIT_USAGE=1
readonly EXIT_CONFIG=2
readonly EXIT_REQUEST=3

# Rejects the mistake this format invites: a JSON *object* keyed by sample id
# cannot carry two results for the same sample, because duplicate keys are
# silently dropped by every JSON parser. Catching it here beats debugging a
# result that vanished somewhere between the file and the database.
# Messages are printed and the process exited rather than thrown, so the user
# sees one clear line instead of a node stack trace.
readonly JSON_CHECK_SNIPPET='
const fs = require("fs");
const fail = message => {
    process.stderr.write(message + "\n");
    process.exit(1);
};
let data;
try {
    data = JSON.parse(fs.readFileSync(process.argv[1], "utf8"));
} catch (error) {
    fail("it is not valid JSON: " + error.message);
}
if (!Array.isArray(data)) {
    fail(
        "the top-level value must be an ARRAY of single-key result objects, " +
        "not an object.\nA JSON object cannot carry two results for the same " +
        "sample - duplicate keys are\nsilently dropped when the file is parsed."
    );
}
if (data.length === 0) {
    fail("the array is empty, there is nothing to import.");
}
'

RESULTS_FILE=''
API_URL="${MIBI_API_URL:-$DEFAULT_API_URL}"
DRY_RUN='false'
API_KEY=''

usage() {
    cat <<EOF
Import BfR analysis results into the MiBi-Portal.

Usage:
  MIBI_RESULTS_API_KEY=<key> $0 --file <path> [--url <base>] [--dry-run]

Options:
  --file <path>   The results JSON file to import. Required.
  --url <base>    Portal base URL. Overrides MIBI_API_URL.
                  Default: $DEFAULT_API_URL
  --dry-run       Validate the file and print the equivalent curl command
                  with the key redacted. Sends nothing.
  --help          Show this help.

Environment:
  MIBI_API_URL               Base URL (default $DEFAULT_API_URL)
  MIBI_RESULTS_API_KEY       The API key (required)
  MIBI_RESULTS_API_KEY_FILE  File holding the key, as an alternative

Example:
  export MIBI_RESULTS_API_KEY='...'
  $0 --file scripts/data/results.example.json
EOF
}

fail() {
    local exit_code="$1"
    shift
    printf 'error: %s\n' "$*" >&2
    exit "$exit_code"
}

parse_arguments() {
    while [ "$#" -gt 0 ]; do
        case "$1" in
            --file)
                [ "$#" -ge 2 ] || fail "$EXIT_USAGE" '--file needs a path'
                RESULTS_FILE="$2"
                shift 2
                ;;
            --url)
                [ "$#" -ge 2 ] || fail "$EXIT_USAGE" '--url needs a value'
                API_URL="$2"
                shift 2
                ;;
            --dry-run)
                DRY_RUN='true'
                shift
                ;;
            --help | -h)
                usage
                exit 0
                ;;
            *)
                usage >&2
                fail "$EXIT_USAGE" "unknown argument: $1"
                ;;
        esac
    done

    if [ -z "$RESULTS_FILE" ]; then
        usage >&2
        fail "$EXIT_USAGE" '--file is required'
    fi
    if [ ! -f "$RESULTS_FILE" ]; then
        fail "$EXIT_USAGE" "no such file: $RESULTS_FILE"
    fi

    # A trailing slash would produce a double slash in the request URL.
    API_URL="${API_URL%/}"
}

# Sets the global API_KEY. Deliberately not written as a function that echoes
# the key: inside a command substitution `exit` only leaves the subshell, so a
# missing key would slip through as an empty string.
resolve_api_key() {
    if [ -n "${MIBI_RESULTS_API_KEY:-}" ]; then
        API_KEY="$MIBI_RESULTS_API_KEY"
        return
    fi

    if [ -n "${MIBI_RESULTS_API_KEY_FILE:-}" ]; then
        [ -f "$MIBI_RESULTS_API_KEY_FILE" ] || fail "$EXIT_CONFIG" \
            "MIBI_RESULTS_API_KEY_FILE points at a file that does not exist: $MIBI_RESULTS_API_KEY_FILE"
        # Strip the trailing newline every editor adds.
        API_KEY="$(tr -d '\r\n' < "$MIBI_RESULTS_API_KEY_FILE")"
        [ -n "$API_KEY" ] || fail "$EXIT_CONFIG" \
            "the file named by MIBI_RESULTS_API_KEY_FILE is empty: $MIBI_RESULTS_API_KEY_FILE"
        return
    fi

    cat >&2 <<EOF
error: no API key configured.

Set it in your shell, so it never lands in a file or the shell history:

    export MIBI_RESULTS_API_KEY='<the key>'

or point at a file that contains only the key:

    export MIBI_RESULTS_API_KEY_FILE="\$HOME/.mibi-results-api-key"

The key is the value of general.resultsApiKey on the server you are posting to.
EOF
    exit "$EXIT_CONFIG"
}

validate_results_file() {
    if ! command -v node > /dev/null 2>&1; then
        printf 'warning: node not found, skipping local validation of %s\n' \
            "$RESULTS_FILE" >&2
        return
    fi

    local validation_error
    if ! validation_error="$(node -e "$JSON_CHECK_SNIPPET" "$RESULTS_FILE" 2>&1)"; then
        printf 'error: %s is not a usable results file\n%s\n' \
            "$RESULTS_FILE" "$validation_error" >&2
        exit "$EXIT_USAGE"
    fi
}

print_curl_command() {
    local key_to_show="$1"
    cat <<EOF
curl --show-error --silent \\
     -X POST '${API_URL}${ENDPOINT_PATH}' \\
     -H 'Content-Type: application/json' \\
     -H '${API_KEY_HEADER}: ${key_to_show}' \\
     --data-binary @'${RESULTS_FILE}'
EOF
}

send_request() {
    local response status body

    # --fail-with-body would be the natural choice, but it needs curl >= 7.76
    # and this repo is built on hosts with 7.68. Appending the status code via
    # --write-out works on every version and still lets us print the error
    # body, which carries unknownSampleIds on a 400.
    if ! response="$(
        curl --show-error --silent \
            --write-out '\n%{http_code}' \
            -X POST "${API_URL}${ENDPOINT_PATH}" \
            -H 'Content-Type: application/json' \
            -H "${API_KEY_HEADER}: ${API_KEY}" \
            --data-binary @"${RESULTS_FILE}"
    )"; then
        fail "$EXIT_REQUEST" "the request could not be sent. Is ${API_URL} reachable?"
    fi

    status="${response##*$'\n'}"
    body="${response%$'\n'*}"

    printf 'HTTP %s\n' "$status"
    print_body "$body"

    if [ "$status" -ge 400 ] 2> /dev/null; then
        exit "$EXIT_REQUEST"
    fi
}

# Pretty-print a JSON body, but fall back to the raw text: an unmatched route
# or a proxy error answers with HTML, and swallowing that would hide the cause.
print_body() {
    local body="$1"
    if [ -z "$body" ]; then
        return
    fi
    if command -v node > /dev/null 2>&1 &&
        printf '%s' "$body" | node -e '
            const chunks = [];
            process.stdin.on("data", chunk => chunks.push(chunk));
            process.stdin.on("end", () => {
                const parsed = JSON.parse(chunks.join(""));
                process.stdout.write(JSON.stringify(parsed, null, 2) + "\n");
            });
        ' 2> /dev/null; then
        return
    fi
    printf '%s\n' "$body"
}

main() {
    parse_arguments "$@"
    resolve_api_key
    validate_results_file

    if [ "$DRY_RUN" = 'true' ]; then
        printf 'Dry run - nothing was sent. The equivalent request is:\n\n'
        print_curl_command '***'
        printf '\nReplace *** with the value of $MIBI_RESULTS_API_KEY.\n'
        exit 0
    fi

    printf 'Posting %s to %s%s\n' "$RESULTS_FILE" "$API_URL" "$ENDPOINT_PATH"
    send_request
}

main "$@"
