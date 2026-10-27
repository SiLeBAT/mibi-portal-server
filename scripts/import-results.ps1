#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Import BfR analysis results into the MiBi-Portal.

.DESCRIPTION
    Posts a JSON file to POST /v2/orders/results. Every element of the file's
    top-level array becomes one Result row, linked to a Sample by its Parse
    objectId. See scripts/import-results.md for the payload format.

    Configuration comes from the environment:

      MIBI_API_URL               Base URL of the portal server
                                 (default: http://localhost:3000)
      MIBI_RESULTS_API_KEY       The API key (required)
      MIBI_RESULTS_API_KEY_FILE  Path to a file holding the key, as an
                                 alternative to MIBI_RESULTS_API_KEY

    The key is deliberately NOT accepted as a parameter: parameters are visible
    to other users in the process list and are written to the PowerShell
    history file.

.PARAMETER File
    The results JSON file to import. Required.

.PARAMETER Url
    Portal base URL. Overrides MIBI_API_URL.

.PARAMETER DryRun
    Validate the file and print the equivalent request with the key redacted.
    Sends nothing.

.EXAMPLE
    $env:MIBI_RESULTS_API_KEY = '...'
    ./scripts/import-results.ps1 -File scripts/data/results.example.json

.EXAMPLE
    ./scripts/import-results.ps1 -File scripts/data/results.example.json -DryRun
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string] $File,

    [string] $Url,

    [switch] $DryRun
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$DefaultApiUrl = 'http://localhost:3000'
$EndpointPath = '/v2/orders/results'
$ApiKeyHeader = 'X-MiBi-Api-Key'

$ExitUsage = 1
$ExitConfig = 2
$ExitRequest = 3

function Write-Failure {
    param([int] $Code, [string] $Message)
    Write-Host "error: $Message" -ForegroundColor Red
    exit $Code
}

function Resolve-ApiKey {
    if ($env:MIBI_RESULTS_API_KEY) {
        return $env:MIBI_RESULTS_API_KEY
    }

    if ($env:MIBI_RESULTS_API_KEY_FILE) {
        if (-not (Test-Path -LiteralPath $env:MIBI_RESULTS_API_KEY_FILE -PathType Leaf)) {
            Write-Failure $ExitConfig ("MIBI_RESULTS_API_KEY_FILE points at a file that does not exist: " + $env:MIBI_RESULTS_API_KEY_FILE)
        }
        # Trim the trailing newline every editor adds.
        $key = ([System.IO.File]::ReadAllText($env:MIBI_RESULTS_API_KEY_FILE)).Trim()
        if (-not $key) {
            Write-Failure $ExitConfig ("the file named by MIBI_RESULTS_API_KEY_FILE is empty: " + $env:MIBI_RESULTS_API_KEY_FILE)
        }
        return $key
    }

    Write-Host @"
error: no API key configured.

Set it in your session, so it never lands in a file or the command history:

    `$env:MIBI_RESULTS_API_KEY = '<the key>'

or point at a file that contains only the key:

    `$env:MIBI_RESULTS_API_KEY_FILE = "`$HOME\.mibi-results-api-key"

The key is the value of general.resultsApiKey on the server you are posting to.
"@ -ForegroundColor Red
    exit $ExitConfig
}

function Test-ResultsFile {
    param([string] $Path)

    $raw = [System.IO.File]::ReadAllText($Path)

    try {
        $null = $raw | ConvertFrom-Json
    } catch {
        Write-Failure $ExitUsage "$Path is not valid JSON. $($_.Exception.Message)"
    }

    # Checked on the raw text rather than the parsed object because
    # ConvertFrom-Json unrolls arrays on Windows PowerShell 5.1, which makes a
    # one-element array indistinguishable from a single object.
    if ($raw.TrimStart() -notmatch '^\[') {
        Write-Failure $ExitUsage @"
$Path must contain an ARRAY of single-key result objects, not an object.
A JSON object cannot carry two results for the same sample - duplicate keys
are silently dropped when the file is parsed.
"@
    }

    if ($raw.Trim() -match '^\[\s*\]$') {
        Write-Failure $ExitUsage "$Path contains an empty array, there is nothing to import."
    }
}

function Show-CurlCommand {
    param([string] $Endpoint, [string] $KeyToShow, [string] $Path)
    @"
curl --show-error --silent ``
     -X POST '$Endpoint' ``
     -H 'Content-Type: application/json' ``
     -H '${ApiKeyHeader}: $KeyToShow' ``
     --data-binary @'$Path'
"@
}

# --- main ---------------------------------------------------------------

if (-not (Test-Path -LiteralPath $File -PathType Leaf)) {
    Write-Failure $ExitUsage "no such file: $File"
}
$resolvedFile = (Resolve-Path -LiteralPath $File).Path

$baseUrl = if ($Url) { $Url } elseif ($env:MIBI_API_URL) { $env:MIBI_API_URL } else { $DefaultApiUrl }
$baseUrl = $baseUrl.TrimEnd('/')
$endpoint = "$baseUrl$EndpointPath"

$apiKey = Resolve-ApiKey
Test-ResultsFile -Path $resolvedFile

if ($DryRun) {
    Write-Host "Dry run - nothing was sent. The equivalent request is:`n"
    Write-Host (Show-CurlCommand -Endpoint $endpoint -KeyToShow '***' -Path $resolvedFile)
    Write-Host "`nReplace *** with the value of `$env:MIBI_RESULTS_API_KEY."
    exit 0
}

Write-Host "Posting $resolvedFile to $endpoint"

# Read as raw bytes rather than letting PowerShell re-encode the string: that
# would add a BOM and mangle non-ASCII, corrupting values such as "<=2" and any
# umlauts in future result data.
$body = [System.IO.File]::ReadAllBytes($resolvedFile)

# Built with an explicit assignment rather than @{ $ApiKeyHeader = $apiKey } so
# the header name unambiguously comes from the variable.
$headers = @{}
$headers[$ApiKeyHeader] = $apiKey

try {
    $response = Invoke-RestMethod -Method Post -Uri $endpoint `
        -ContentType 'application/json' `
        -Headers $headers `
        -Body $body
    Write-Host 'HTTP 200'
    $response | ConvertTo-Json -Depth 10
} catch {
    $status = $null
    if ($_.Exception.PSObject.Properties.Name -contains 'Response' -and $_.Exception.Response) {
        $status = [int] $_.Exception.Response.StatusCode
    }
    if ($status) {
        Write-Host "HTTP $status" -ForegroundColor Red
    }

    # The response body carries unknownSampleIds on a 400, so it must be shown
    # rather than swallowed by the bare exception message.
    if ($_.ErrorDetails -and $_.ErrorDetails.Message) {
        Write-Host $_.ErrorDetails.Message
    } else {
        Write-Host $_.Exception.Message
    }
    exit $ExitRequest
}
