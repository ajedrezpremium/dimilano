# Deploy Di Milano a Vercel prod + re-alias de los 3 dominios.
# Los alias quedan pinned a un deployment: hay que re-apuntarlos en cada deploy.
# REQUISITO: `vercel login` ya hecho en este equipo (no guardar tokens en el repo).
# Uso: powershell -File scripts\deploy.ps1
vercel --prod --yes | Out-Null
$ls = vercel ls dimilano --prod 2>$null | Out-String
$url = [regex]::Match($ls, "https://dimilano-[a-z0-9]+-ajedrez-premiums-projects\.vercel\.app").Value
if (-not $url) { Write-Output "ERROR: no deployment URL found"; exit 1 }
Write-Output "prod: $url"
foreach ($a in @("dimilano-vigo.vercel.app", "dimilano-theta.vercel.app", "agente.dimilano.es")) {
  vercel alias $url $a 2>$null | Out-Null
  Write-Output "alias: $a -> $url"
}
