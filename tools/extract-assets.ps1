$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$outDir = Join-Path $root "assets\images"

$screens = @(
    @{ Source = "C:\Users\ASUS\OneDrive\Pictures\Screenshots\Screenshot 2026-07-09 143317.png"; Name = "plant-survey.jpg"; Crop = @(220, 350, 900, 506) },
    @{ Source = "C:\Users\ASUS\OneDrive\Pictures\Screenshots\Screenshot 2026-07-09 143323.png"; Name = "risk-management.jpg"; Crop = @(166, 350, 1050, 591) },
    @{ Source = "C:\Users\ASUS\OneDrive\Pictures\Screenshots\Screenshot 2026-07-09 143332.png"; Name = "valuation-services.jpg"; Crop = @(166, 350, 1050, 591) },
    @{ Source = "C:\Users\ASUS\OneDrive\Pictures\Screenshots\Screenshot 2026-07-09 143338.png"; Name = "loss-adjustment.jpg"; Crop = @(166, 350, 1050, 591) },
    @{ Source = "C:\Users\ASUS\OneDrive\Pictures\Screenshots\Screenshot 2026-07-09 143348.png"; Name = "industrial-audit.jpg"; Crop = @(166, 350, 924, 520) }
)

function Save-Crop {
    param(
        [Parameter(Mandatory = $true)][string]$Source,
        [Parameter(Mandatory = $true)][string]$Destination,
        [Parameter(Mandatory = $true)][System.Drawing.Rectangle]$Crop,
        [Parameter(Mandatory = $true)][string]$Format
    )

    $image = [System.Drawing.Image]::FromFile($Source)
    try {
        $bitmap = New-Object System.Drawing.Bitmap $Crop.Width, $Crop.Height
        $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
        try {
            $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
            $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
            $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
            $destination = New-Object System.Drawing.Rectangle -ArgumentList 0, 0, $Crop.Width, $Crop.Height
            $graphics.DrawImage($image, $destination, $Crop.X, $Crop.Y, $Crop.Width, $Crop.Height, [System.Drawing.GraphicsUnit]::Pixel)

            if ($Format -eq "png") {
                $bitmap.Save($Destination, [System.Drawing.Imaging.ImageFormat]::Png)
            } else {
                $encoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
                $params = New-Object System.Drawing.Imaging.EncoderParameters 1
                $params.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality), 88L
                $bitmap.Save($Destination, $encoder, $params)
            }
        } finally {
            $graphics.Dispose()
            $bitmap.Dispose()
        }
    } finally {
        $image.Dispose()
    }
}

New-Item -ItemType Directory -Force $outDir | Out-Null

$logoCrop = New-Object System.Drawing.Rectangle 195, 176, 235, 140
Save-Crop -Source $screens[0].Source -Destination (Join-Path $outDir "logo.png") -Crop $logoCrop -Format "png"

foreach ($screen in $screens) {
    $cropValues = $screen.Crop
    $crop = New-Object System.Drawing.Rectangle $cropValues[0], $cropValues[1], $cropValues[2], $cropValues[3]
    Save-Crop -Source $screen.Source -Destination (Join-Path $outDir $screen.Name) -Crop $crop -Format "jpg"
}

Write-Host "Extracted website assets to $outDir"
