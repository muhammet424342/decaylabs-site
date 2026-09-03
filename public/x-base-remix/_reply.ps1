
Add-Type -AssemblyName UIAutomationClient
Add-Type -AssemblyName UIAutomationTypes
$hwnd = [IntPtr]264206
$root = [System.Windows.Automation.AutomationElement]::FromHandle($hwnd)
$all = $root.FindAll([System.Windows.Automation.TreeScope]::Descendants, [System.Windows.Automation.Condition]::TrueCondition)
foreach ($el in $all) {
  if ($el.Current.Name -eq "Post text") {
    $vp = $el.GetCurrentPattern([System.Windows.Automation.ValuePattern]::Pattern)
    Write-Host "VALUE=<<$($vp.Current.Value)>>"
  }
}
Write-Host "SKIP SEND"
