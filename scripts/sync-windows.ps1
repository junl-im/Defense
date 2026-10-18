$ErrorActionPreference = "Stop"
$project = "D:\K-city-webgame\Defense"
$branch = "feat/anime-crowd-reboot-v0"
if (!(Test-Path $project)) { throw "Folder absent: $project. Clone https://github.com/junl-im/Defense.git into this folder first." }
Set-Location $project
if (-not (Test-Path ".git")) { throw "Not a Git working tree: $project" }
$origin = (& git remote get-url origin).Trim()
if ($LASTEXITCODE -ne 0 -or $origin -notmatch 'junl-im/Defense(\.git)?$') { throw "Wrong origin: $origin" }
if ((& git status --porcelain).Count -gt 0) { throw "Local changes detected. Commit/stash/backup before switching; no files were touched." }
& git fetch origin
if ($LASTEXITCODE -ne 0) { throw "Fetch failed" }
& git show-ref --verify --quiet "refs/heads/$branch"
if ($LASTEXITCODE -eq 0) {
  & git switch $branch
  if ($LASTEXITCODE -ne 0) { throw "Switch failed" }
  & git merge --ff-only "origin/$branch"
} else {
  & git switch --track -c $branch "origin/$branch"
}
if ($LASTEXITCODE -ne 0) { throw "Git operation failed" }
Write-Host "Ready: $project ($branch). Run npm install; npm test; npm run dev"
