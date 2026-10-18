param([string]$Project = "D:\K-city-webgame\Defense")
$ErrorActionPreference = "Stop"
$folder = Join-Path $Project "assets\source"
New-Item -ItemType Directory -Force -Path $folder | Out-Null
$downloads = @(
 @{Name="OpenGameArt-LowPolyAnimeGirl-CC0.zip"; Uri="https://opengameart.org/sites/default/files/gal.zip"},
 @{Name="OpenGameArt-BasicFemaleRigged-CC0.zip"; Uri="https://opengameart.org/sites/default/files/female_basic_rigged.zip"},
 @{Name="Kenney-FantasyTown-CC0.zip"; Uri="https://opengameart.org/sites/default/files/kenney_fantasy-town-kit_2.0.zip"}
)
foreach($item in $downloads) {
 $target=Join-Path $folder $item.Name
 if(Test-Path $target){Write-Host "SKIP existing $target";continue}
 try {
   Invoke-WebRequest -Uri $item.Uri -OutFile $target -MaximumRedirection 5
   $sig=[System.IO.File]::ReadAllBytes($target)
   if($sig.Length -lt 4 -or $sig[0] -ne 80 -or $sig[1] -ne 75){Remove-Item $target;throw "Not a ZIP payload"}
   $hash=(Get-FileHash $target -Algorithm SHA256).Hash
   Write-Host "OK $target SHA256 $hash"
 } catch { Write-Warning "$($item.Name): $_";if(Test-Path $target){Remove-Item $target} }
}
Write-Host "Downloaded originals remain OUTSIDE the Git repository index (gitignored). Review archives/license before using. Do not upload unapproved binaries."
