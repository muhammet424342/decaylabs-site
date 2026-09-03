import ctypes
import io
import subprocess
import time
from PIL import Image

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
CF_DIB = 8
VK_CONTROL = 0x11
VK_V = 0x56
KEYEVENTF_KEYUP = 0x0002

ps_path = r"C:\Users\Muhammet\Desktop\NFT\decaylabs_archive\public\x-base-remix\_setvalue.ps1"
open(ps_path, "w", encoding="utf-8").write(r"""
Add-Type -AssemblyName UIAutomationClient
Add-Type -AssemblyName UIAutomationTypes
$hwnd = [IntPtr]264206
$root = [System.Windows.Automation.AutomationElement]::FromHandle($hwnd)
$condName = New-Object System.Windows.Automation.PropertyCondition(
  [System.Windows.Automation.AutomationElement]::NameProperty, "Post text")
$edit = $root.FindFirst([System.Windows.Automation.TreeScope]::Descendants, $condName)
if (-not $edit) { Write-Host "NO EDIT"; exit 2 }
$edit.SetFocus()
$vp = $edit.GetCurrentPattern([System.Windows.Automation.ValuePattern]::Pattern)
$vp.SetValue("do you see him?`n`nsubject 0454. one of 1,000 hand-illustrated undead on Base.`nnot generated. the archive was already in the plaza.")
Write-Host "VALUE=<<$($vp.Current.Value)>>"
""")
subprocess.run(["powershell", "-NoProfile", "-File", ps_path], check=False)

im = Image.open(r"C:\Users\Muhammet\Desktop\decay-base-do-you-see-it.jpg").convert("RGB")
buf = io.BytesIO()
im.save(buf, "BMP")
dib = buf.getvalue()[14:]
assert user32.OpenClipboard(None)
user32.EmptyClipboard()
h = kernel32.GlobalAlloc(GMEM_MOVEABLE, len(dib))
p = kernel32.GlobalLock(h)
ctypes.memmove(p, dib, len(dib))
kernel32.GlobalUnlock(h)
user32.SetClipboardData(CF_DIB, h)
user32.CloseClipboard()

user32.SetForegroundWindow(264206)
time.sleep(0.3)
user32.keybd_event(VK_CONTROL, 0, 0, 0)
time.sleep(0.04)
user32.keybd_event(VK_V, 0, 0, 0)
time.sleep(0.04)
user32.keybd_event(VK_V, 0, KEYEVENTF_KEYUP, 0)
time.sleep(0.04)
user32.keybd_event(VK_CONTROL, 0, KEYEVENTF_KEYUP, 0)
print("PASTED IMAGE")
time.sleep(4)

ps2 = r"C:\Users\Muhammet\Desktop\NFT\decaylabs_archive\public\x-base-remix\_reply.ps1"
open(ps2, "w", encoding="utf-8").write(r"""
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
""")
subprocess.run(["powershell", "-NoProfile", "-File", ps2], check=False)
print("STOP BEFORE SEND")
