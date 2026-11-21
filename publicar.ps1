# ============================================================
#  publicar.ps1  —  atualiza o site com um clique (Windows)
#  Uso:  ./publicar.ps1 "o que eu mudei"
# ============================================================
param(
    [string]$Mensagem = "Atualiza conteúdo do site"
)

$ErrorActionPreference = "Stop"
Set-Location -Path $PSScriptRoot

# Confere se todos os arquivos JSON estão sem erros antes de publicar
Write-Host "Verificando arquivos de dados..." -ForegroundColor Cyan
$erro = $false
Get-ChildItem -Path "data" -Filter *.json -Recurse | ForEach-Object {
    try {
        Get-Content $_.FullName -Raw -Encoding UTF8 | ConvertFrom-Json | Out-Null
        Write-Host ("  OK    " + $_.Name) -ForegroundColor Green
    } catch {
        Write-Host ("  ERRO  " + $_.Name + "  -> " + $_.Exception.Message) -ForegroundColor Red
        $erro = $true
    }
}
if ($erro) { Write-Host "Corrija os erros acima e rode de novo." -ForegroundColor Red; exit 1 }

# Commit e envio para o GitHub
git add .
$mudancas = git status --porcelain
if (-not $mudancas) { Write-Host "Nada para publicar — tudo já está atualizado." -ForegroundColor Yellow; exit 0 }

git commit -m $Mensagem
git push origin main
Write-Host "`nPublicado! O site atualiza em cerca de 1 minuto." -ForegroundColor Green
