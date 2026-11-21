# ============================================================
#  atualizar-cv.ps1  —  converte seu CV do Word (.docx) para o
#  PDF que o site usa (assets/CV.pdf) e, se quiser, publica.
#  Requer Microsoft Word instalado (Windows).
#
#  Uso:
#    ./atualizar-cv.ps1 "C:\caminho\Meu_CV.docx"
#    ./atualizar-cv.ps1 "C:\caminho\Meu_CV.docx" -Publicar
# ============================================================
param(
    [Parameter(Mandatory = $true)][string]$CaminhoDocx,
    [switch]$Publicar
)

$ErrorActionPreference = "Stop"
Set-Location -Path $PSScriptRoot

if (-not (Test-Path $CaminhoDocx)) { Write-Host "Arquivo não encontrado: $CaminhoDocx" -ForegroundColor Red; exit 1 }

$saidaPdf = Join-Path $PSScriptRoot "assets\CV.pdf"

Write-Host "Convertendo CV para PDF..." -ForegroundColor Cyan
$word = New-Object -ComObject Word.Application
$word.Visible = $false
try {
    $doc = $word.Documents.Open((Resolve-Path $CaminhoDocx).Path, $false, $true)
    # 17 = wdFormatPDF
    $doc.SaveAs([ref]$saidaPdf, [ref]17)
    $doc.Close($false)
    Write-Host "Salvo: $saidaPdf" -ForegroundColor Green
} finally {
    $word.Quit()
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($word) | Out-Null
}

if ($Publicar) { & "$PSScriptRoot\publicar.ps1" "Atualiza CV" }
