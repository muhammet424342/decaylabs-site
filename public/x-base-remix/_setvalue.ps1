Add-Type -AssemblyName UIAutomationClient
Add-Type -AssemblyName UIAutomationTypes
$p = Get-Process chrome | Where-Object { $_.MainWindowTitle -match 'Do you see it|base/status' } | Select-Object -First 1
if (-not $p) { Write-Host 'NO CHROME'; exit 2 }
$hwnd = $p.MainWindowHandle
$root = [System.Windows.Automation.AutomationElement]::FromHandle($hwnd)
$cond = New-Object System.Windows.Automation.PropertyCondition([System.Windows.Automation.AutomationElement]::NameProperty, 'Post text')
$edit = $root.FindFirst([System.Windows.Automation.TreeScope]::Descendants, $cond)
if (-not $edit) { Write-Host 'NO EDIT'; exit 2 }
$edit.SetFocus()
Start-Sleep -Milliseconds 250
$vp = $edit.GetCurrentPattern([System.Windows.Automation.ValuePattern]::Pattern)
$vp.SetValue("do you see him?`n`nsubject 0454. one of 1,000 hand-illustrated undead on Base.`nnot generated. the archive was already in the plaza.")
Write-Host ('SET <<' + $vp.Current.Value + '>>')
