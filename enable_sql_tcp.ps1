# Elevated Script to enable TCP/IP and bind port 1433 for SQLEXPRESS
Write-Host "Configuring SQL Server Network Protocols..." -ForegroundColor Cyan

# 1. Verify we are running as administrator
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "This script must be run as Administrator! Re-launching with elevation..." -ForegroundColor Yellow
    Start-Process powershell -Verb RunAs -ArgumentList "-NoProfile -File `"$PSCommandPath`""
    Exit
}

# 2. Modify Registry keys to enable TCP/IP protocol
$regPath = "HKLM:\SOFTWARE\Microsoft\Microsoft SQL Server\MSSQL17.SQLEXPRESS\MSSQLServer\SuperSocketNetLib\Tcp"
$ipAllPath = "$regPath\IPAll"

try {
    # Enable TCP/IP
    Set-ItemProperty -Path $regPath -Name "Enabled" -Value 1
    Write-Host "[OK] TCP/IP Protocol Enabled." -ForegroundColor Green

    # Set static port to 1433
    Set-ItemProperty -Path $ipAllPath -Name "TcpPort" -Value "1433"
    Set-ItemProperty -Path $ipAllPath -Name "TcpDynamicPorts" -Value ""
    Write-Host "[OK] Port bound to 1433." -ForegroundColor Green

    # 3. Restart SQL Server Service
    Write-Host "Restarting SQL Server (SQLEXPRESS) service..." -ForegroundColor Yellow
    Restart-Service -Name "MSSQL`$SQLEXPRESS" -Force
    Write-Host "[SUCCESS] Service restarted. TCP/IP is now listening on port 1433." -ForegroundColor Green
}
catch {
    Write-Error "Failed to update configuration: $_"
}

Write-Host "Press any key to exit..."
$null = [Console]::ReadKey()
