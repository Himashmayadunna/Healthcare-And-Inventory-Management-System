# Elevated Script to enable Mixed Mode Authentication and set sa password to 1234
Write-Host "Configuring SQL Server Authentication Settings..." -ForegroundColor Cyan

# 1. Verify we are running as administrator
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "This script must be run as Administrator! Re-launching with elevation..." -ForegroundColor Yellow
    Start-Process powershell -Verb RunAs -ArgumentList "-NoProfile -File `"$PSCommandPath`""
    Exit
}

try {
    # 2. Set LoginMode to 2 (Mixed Mode) in the Registry
    $regPath = "HKLM:\SOFTWARE\Microsoft\Microsoft SQL Server\MSSQL17.SQLEXPRESS\MSSQLServer"
    Set-ItemProperty -Path $regPath -Name "LoginMode" -Value 2
    Write-Host "[OK] Mixed Mode Authentication enabled in registry." -ForegroundColor Green

    # 3. Enable sa login and set password to 1234 using local sqlcmd
    Write-Host "Activating 'sa' account with password '1234'..." -ForegroundColor Yellow
    
    # Locate SQLCMD.EXE
    $sqlcmdPath = "C:\Program Files\Microsoft SQL Server\Client SDK\ODBC\170\Tools\Binn\SQLCMD.EXE"
    if (-not (Test-Path $sqlcmdPath)) {
        $sqlcmdPath = "C:\Program Files\Microsoft SQL Server\Client SDK\ODBC\180\Tools\Binn\SQLCMD.EXE"
    }

    if (Test-Path $sqlcmdPath) {
        & $sqlcmdPath -S "localhost\SQLEXPRESS" -E -Q "ALTER LOGIN [sa] WITH PASSWORD = '1234', ENABLE;"
        Write-Host "[OK] 'sa' login configured and enabled." -ForegroundColor Green
    } else {
        Write-Error "sqlcmd.exe not found in standard paths. Failed to configure sa login."
        Exit
    }

    # 4. Restart SQL Server Service
    Write-Host "Restarting SQL Server (SQLEXPRESS) service..." -ForegroundColor Yellow
    Restart-Service -Name "MSSQL`$SQLEXPRESS" -Force
    Write-Host "[SUCCESS] Authentication settings updated and service restarted successfully." -ForegroundColor Green
}
catch {
    Write-Error "Failed to update configuration: $_"
}

Write-Host "Press any key to exit..."
$null = [Console]::ReadKey()
