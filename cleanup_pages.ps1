$adminPath = "c:\PROJECTS\Nairobi\hudumalynk-web\src\pages\admin"
$providerPath = "c:\PROJECTS\Nairobi\hudumalynk-web\src\pages\provider"

Get-ChildItem -Path $adminPath -Filter "*.tsx" | Where-Object { $_.Name -ne "AdminDashboardPage.tsx" -and $_.Name -ne "hl-design-system.ts" } | Remove-Item -Force
Get-ChildItem -Path $providerPath -Filter "*.tsx" | Where-Object { $_.Name -ne "DashboardPage.tsx" } | Remove-Item -Force
