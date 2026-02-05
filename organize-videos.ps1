param([switch]$CopyVideos)

$testResultsPath = "C:\Users\julio.salazar\Test\test-results"
$videosPath = "C:\Users\julio.salazar\Test\videos"

# If -CopyVideos parameter is passed, copy videos with descriptive names
if ($CopyVideos) {
    Write-Host "Copying videos from test-results with descriptive names..." -ForegroundColor Green
    
    $videoFiles = Get-ChildItem -Path $testResultsPath -Recurse -Filter "*.webm"
    
    $counter = 1
    foreach ($video in $videoFiles) {
        # Get the parent folder name (which contains the test name)
        $testName = $video.Directory.Name
        
        # Create a descriptive name
        $newName = "test-$counter-$testName.webm"
        $destination = Join-Path $videosPath $newName
        
        # Copy the file
        Copy-Item -Path $video.FullName -Destination $destination -Force
        Write-Host "Copied: $newName" -ForegroundColor Cyan
        $counter++
    }
    
    Write-Host "`nVideos organized in videos folder" -ForegroundColor Green
} else {
    Write-Host "Usage: .\organize-videos.ps1 -CopyVideos" -ForegroundColor Yellow
    Write-Host "`nThis script organizes test videos." -ForegroundColor Yellow
}

# Display available videos
Write-Host "`nAvailable videos:" -ForegroundColor Green
Get-ChildItem $videosPath -Filter "*.webm" -ErrorAction SilentlyContinue | foreach {
    $sizeKB = [math]::Round($_.Length/1KB, 2)
    Write-Host "  - $($_.Name) ($sizeKB KB)"
}
