# Export a .pptx to PDF with the installed PowerPoint (no LibreOffice on this machine).
#   powershell -NoProfile -File export_pdf.ps1 -Pptx C:\path\deck.pptx -Pdf C:\path\deck.pdf
param([Parameter(Mandatory)][string]$Pptx, [Parameter(Mandatory)][string]$Pdf)
$ErrorActionPreference = 'Stop'
$pp = New-Object -ComObject PowerPoint.Application
try {
    # ReadOnly, Untitled = false, WithWindow = false
    $pres = $pp.Presentations.Open((Resolve-Path $Pptx).Path, -1, 0, 0)
    $pres.SaveAs($Pdf, 32)   # 32 = ppSaveAsPDF
    $pres.Close()
    "exported $Pdf"
} finally {
    $pp.Quit()
    [void][System.Runtime.InteropServices.Marshal]::ReleaseComObject($pp)
}
