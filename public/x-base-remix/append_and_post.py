import ctypes
import subprocess
import time

user32 = ctypes.windll.user32
kernel32 = ctypes.windll.kernel32
kernel32.GlobalAlloc.restype = ctypes.c_void_p
kernel32.GlobalAlloc.argtypes = [ctypes.c_uint, ctypes.c_size_t]
kernel32.GlobalLock.restype = ctypes.c_void_p
kernel32.GlobalLock.argtypes = [ctypes.c_void_p]
kernel32.GlobalUnlock.argtypes = [ctypes.c_void_p]
user32.SetClipboardData.restype = ctypes.c_void_p
user32.SetClipboardData.argtypes = [ctypes.c_uint, ctypes.c_void_p]
user32.OpenClipboard.argtypes = [ctypes.c_void_p]

GMEM_MOVEABLE = 0x0002
CF_UNICODETEXT = 13
KEYEVENTF_KEYUP = 0x0002
VK_CONTROL = 0x11
VK_V = 0x56
VK_END = 0x23


def set_text(s: str):
    data = s.encode("utf-16-le") + b"\x00\x00"
    assert user32.OpenClipboard(None)
    user32.EmptyClipboard()
    h = kernel32.GlobalAlloc(GMEM_MOVEABLE, len(data))
    p = kernel32.GlobalLock(h)
    ctypes.memmove(p, data, len(data))
    kernel32.GlobalUnlock(h)
    user32.SetClipboardData(CF_UNICODETEXT, h)
    user32.CloseClipboard()


def tap(vk):
    user32.keybd_event(vk, 0, 0, 0)
    time.sleep(0.04)
    user32.keybd_event(vk, 0, KEYEVENTF_KEYUP, 0)


def ctrl_v():
    user32.keybd_event(VK_CONTROL, 0, 0, 0)
    time.sleep(0.04)
    tap(VK_V)
    time.sleep(0.04)
    user32.keybd_event(VK_CONTROL, 0, KEYEVENTF_KEYUP, 0)


more = (
    "\n\n"
    "subject 0454. one of 1,000 hand-illustrated undead on Base.\n"
    "not generated. the archive was already in the plaza."
)

ps = r'''
Add-Type -AssemblyName UIAutomationClient
Add-Type -AssemblyName UIAutomationTypes
$hwnd = [IntPtr]264206
$root = [System.Windows.Automation.AutomationElement]::FromHandle($hwnd)
$condName = New-Object System.Windows.Automation.PropertyCondition(
  [System.Windows.Automation.AutomationElement]::NameProperty, "Post text")
$edit = $root.FindFirst([System.Windows.Automation.TreeScope]::Descendants, $condName)
$edit.SetFocus()
Write-Host "FOCUSED"
'''
subprocess.run(["powershell", "-NoProfile", "-Command", ps], check=True)
time.sleep(0.3)
user32.SetForegroundWindow(264206)
time.sleep(0.2)
tap(VK_END)
time.sleep(0.15)
set_text(more)
user32.SetForegroundWindow(264206)
time.sleep(0.2)
ctrl_v()
print("APPENDED")
time.sleep(1.0)

ps2 = r'''
Add-Type -AssemblyName UIAutomationClient
Add-Type -AssemblyName UIAutomationTypes
$hwnd = [IntPtr]264206
$root = [System.Windows.Automation.AutomationElement]::FromHandle($hwnd)
$cond = [System.Windows.Automation.Condition]::TrueCondition
$all = $root.FindAll([System.Windows.Automation.TreeScope]::Descendants, $cond)
$edit = $null
foreach ($el in $all) {
  if ($el.Current.Name -eq "Post text") { $edit = $el }
}
if ($edit) {
  $vp = $edit.GetCurrentPattern([System.Windows.Automation.ValuePattern]::Pattern)
  Write-Host "VALUE=<<$($vp.Current.Value)>>"
}
$invoked = $false
foreach ($el in $all) {
  if ($el.Current.Name -eq "Reply" -and $el.Current.ControlType.ProgrammaticName -eq "ControlType.Button" -and $el.Current.IsEnabled) {
    $r = $el.Current.BoundingRectangle
    if ($r.Y -gt 1000) {
      $el.GetCurrentPattern([System.Windows.Automation.InvokePattern]::Pattern).Invoke()
      Write-Host "INVOKED REPLY at $($r.X),$($r.Y)"
      $invoked = $true
      break
    }
  }
}
if (-not $invoked) { Write-Host "NO REPLY BUTTON" }
'''
subprocess.run(["powershell", "-NoProfile", "-Command", ps2], check=True)
print("DONE")
