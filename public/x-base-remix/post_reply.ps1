$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing
Add-Type -AssemblyName UIAutomationClient
Add-Type -AssemblyName UIAutomationTypes

Add-Type @"
using System;
using System.Runtime.InteropServices;
public class Win32Post {
  [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr hWnd);
  [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
  [DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();
}
"@

$imgPath = 'C:\Users\Muhammet\Desktop\decay-base-do-you-see-it.jpg'
if (-not (Test-Path $imgPath)) { throw "image missing: $imgPath" }

$text = @"
do you see him?

subject 0454. one of 1,000 hand-illustrated undead on Base.
not generated. the archive was already in the plaza.
"@.Trim()

$encoded = [uri]::EscapeDataString($text)
$compose = "https://x.com/compose/post?in_reply_to=2091561569041924167&text=$encoded"

$chrome = Get-Process chrome | Where-Object { $_.MainWindowHandle -ne [IntPtr]::Zero } | Select-Object -First 1
if (-not $chrome) { throw 'Chrome window not found' }

[Win32Post]::ShowWindow($chrome.MainWindowHandle, 9) | Out-Null
Start-Sleep -Milliseconds 300
[Win32Post]::SetForegroundWindow($chrome.MainWindowHandle) | Out-Null
Start-Sleep -Milliseconds 400

$root = [System.Windows.Automation.AutomationElement]::FromHandle($chrome.MainWindowHandle)
$tabCond = New-Object System.Windows.Automation.PropertyCondition(
  [System.Windows.Automation.AutomationElement]::ControlTypeProperty,
  [System.Windows.Automation.ControlType]::TabItem
)
$tabs = $root.FindAll([System.Windows.Automation.TreeScope]::Descendants, $tabCond)
$picked = $false
foreach ($t in $tabs) {
  if ($t.Current.Name -match 'Do you see it|compose/post|@base') {
    try {
      $pat = $t.GetCurrentPattern([System.Windows.Automation.SelectionItemPattern]::Pattern)
      $pat.Select()
      $picked = $true
      Write-Host "TAB $($t.Current.Name)"
      break
    } catch {
      Write-Host "TAB SELECT FAIL $($t.Current.Name)"
    }
  }
}
if (-not $picked) { Write-Host 'NO TAB MATCH, using current window' }
Start-Sleep -Milliseconds 500

[Win32Post]::SetForegroundWindow($chrome.MainWindowHandle) | Out-Null
Start-Sleep -Milliseconds 200
[System.Windows.Forms.SendKeys]::SendWait('^l')
Start-Sleep -Milliseconds 400
[System.Windows.Forms.Clipboard]::SetText($compose)
Start-Sleep -Milliseconds 200
[System.Windows.Forms.SendKeys]::SendWait('^a')
Start-Sleep -Milliseconds 120
[System.Windows.Forms.SendKeys]::SendWait('^v')
Start-Sleep -Milliseconds 200
[System.Windows.Forms.SendKeys]::SendWait('{ENTER}')
Write-Host 'NAVIGATED COMPOSE'
Start-Sleep -Seconds 4

# Attach the image file via clipboard file drop
$list = New-Object System.Collections.Specialized.StringCollection
[void]$list.Add((Get-Item $imgPath).FullName)
[System.Windows.Forms.Clipboard]::SetFileDropList($list)
Start-Sleep -Milliseconds 300
[Win32Post]::SetForegroundWindow($chrome.MainWindowHandle) | Out-Null
Start-Sleep -Milliseconds 200
# click composer: Tab a few times is unreliable; click center-lower of window then Ctrl+V
$rect = $root.Current.BoundingRectangle
# click roughly the tweet box
Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;
public class MousePost {
  [DllImport("user32.dll")] public static extern bool SetCursorPos(int X, int Y);
  [DllImport("user32.dll")] public static extern void mouse_event(int dwFlags, int dx, int dy, int cButtons, int dwExtraInfo);
  public const int LEFTDOWN = 0x0002;
  public const int LEFTUP = 0x0004;
}
"@
$cx = [int]($rect.X + $rect.Width * 0.50)
$cy = [int]($rect.Y + $rect.Height * 0.42)
[MousePost]::SetCursorPos($cx, $cy) | Out-Null
Start-Sleep -Milliseconds 150
[MousePost]::mouse_event(0x0002, 0, 0, 0, 0)
Start-Sleep -Milliseconds 80
[MousePost]::mouse_event(0x0004, 0, 0, 0, 0)
Start-Sleep -Milliseconds 400
[System.Windows.Forms.SendKeys]::SendWait('^v')
Write-Host "PASTED IMAGE at $cx,$cy"
Start-Sleep -Seconds 5

# Post
[Win32Post]::SetForegroundWindow($chrome.MainWindowHandle) | Out-Null
Start-Sleep -Milliseconds 200
[System.Windows.Forms.SendKeys]::SendWait('^{ENTER}')
Write-Host 'SENT CTRL+ENTER'
Start-Sleep -Seconds 3
Write-Host "FOREGROUND=$([Win32Post]::GetForegroundWindow()) CHROME=$($chrome.MainWindowHandle)"
Write-Host "TITLE=$($chrome.MainWindowTitle)"
