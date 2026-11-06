$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$projectRoot = Split-Path -Parent $PSScriptRoot
$brandRoot = Join-Path $projectRoot 'build/branding'

function Export-BrandImage([string]$Source, [int]$Width, [int]$Height, [string]$Output, [bool]$Bitmap = $false) {
    $image = [System.Drawing.Image]::FromFile((Join-Path $brandRoot $Source))
    $format = if ($Bitmap) { [System.Drawing.Imaging.PixelFormat]::Format24bppRgb } else { [System.Drawing.Imaging.PixelFormat]::Format32bppArgb }
    $canvas = [System.Drawing.Bitmap]::new($Width, $Height, $format)
    $graphics = [System.Drawing.Graphics]::FromImage($canvas)
    $stream = [System.IO.MemoryStream]::new()
    try {
        $graphics.Clear($(if ($Bitmap) { [System.Drawing.Color]::White } else { [System.Drawing.Color]::Transparent }))
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
        $graphics.DrawImage($image, [System.Drawing.Rectangle]::new(0, 0, $Width, $Height))
        $encoding = if ($Bitmap) { [System.Drawing.Imaging.ImageFormat]::Bmp } else { [System.Drawing.Imaging.ImageFormat]::Png }
        $canvas.Save($stream, $encoding)
        $bytes = $stream.ToArray()
        if ($Output) { [System.IO.File]::WriteAllBytes((Join-Path $projectRoot $Output), $bytes) }
        return ,$bytes
    } finally {
        $stream.Dispose()
        $graphics.Dispose()
        $canvas.Dispose()
        $image.Dispose()
    }
}

Export-BrandImage 'icon-source.png' 512 512 'build/icon.png' | Out-Null
Export-BrandImage 'icon-source.png' 256 256 'public/assets/favoradio-icon.png' | Out-Null
Export-BrandImage 'installer-header-source.png' 150 57 'build/installerHeader.bmp' $true | Out-Null
Export-BrandImage 'installer-sidebar-source.png' 164 314 'build/installerSidebar.bmp' $true | Out-Null

# ICO contains native PNG entries at each Windows shell scale, including small tray sizes.
$sizes = @(16, 20, 24, 32, 40, 48, 64, 96, 128, 256)
$images = [System.Collections.Generic.List[byte[]]]::new()
foreach ($size in $sizes) { $images.Add((Export-BrandImage 'icon-source.png' $size $size '')) }
$iconStream = [System.IO.File]::Create((Join-Path $projectRoot 'build/icon.ico'))
$writer = [System.IO.BinaryWriter]::new($iconStream)
try {
    $writer.Write([uint16]0)
    $writer.Write([uint16]1)
    $writer.Write([uint16]$sizes.Count)
    $offset = 6 + 16 * $sizes.Count
    for ($index = 0; $index -lt $sizes.Count; $index++) {
        $dimension = if ($sizes[$index] -eq 256) { 0 } else { $sizes[$index] }
        $writer.Write([byte]$dimension)
        $writer.Write([byte]$dimension)
        $writer.Write([byte]0)
        $writer.Write([byte]0)
        $writer.Write([uint16]1)
        $writer.Write([uint16]32)
        $writer.Write([uint32]$images[$index].Length)
        $writer.Write([uint32]$offset)
        $offset += $images[$index].Length
    }
    foreach ($bytes in $images) { $writer.Write($bytes) }
} finally { $writer.Dispose() }
Write-Output 'Exported Favoradio icon, browser icon, and installer bitmaps.'
