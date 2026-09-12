param(
    [string]$SiteUrl = 'https://www.4art.work'
)

$ErrorActionPreference = 'Stop'
$projectDirectory = Split-Path -Parent $PSScriptRoot
$previousSiteUrl = $env:SITE_URL
Push-Location -LiteralPath $projectDirectory
try {
    $env:SITE_URL = $SiteUrl
    & npx.cmd --yes wrangler@4.131.1 deploy
    if ($LASTEXITCODE -ne 0) { throw 'Cloudflare deployment failed.' }
} finally {
    $env:SITE_URL = $previousSiteUrl
    Pop-Location
}
