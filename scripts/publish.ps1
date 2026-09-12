param(
    [string]$SiteUrl = 'https://4artwork.aojax-lin.workers.dev'
)

$ErrorActionPreference = 'Stop'
$projectDirectory = Split-Path -Parent $PSScriptRoot
$previousSiteUrl = $env:SITE_URL
Push-Location -LiteralPath $projectDirectory
try {
    $env:SITE_URL = $SiteUrl
    & npm.cmd run build
    if ($LASTEXITCODE -ne 0) { throw 'Website build failed.' }
    & node scripts/check-links.mjs
    if ($LASTEXITCODE -ne 0) { throw 'Internal link check failed.' }
    & npx.cmd --yes wrangler@4.131.1 deploy
    if ($LASTEXITCODE -ne 0) { throw 'Cloudflare deployment failed.' }
} finally {
    $env:SITE_URL = $previousSiteUrl
    Pop-Location
}
