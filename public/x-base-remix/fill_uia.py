import ctypes
import io
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
CF_UNICODETEXT = 13
CF_DIB = 8
KEYEVENTF_KEYUP = 0x0002
VK_CONTROL = 0x11
VK_V = 0x56


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


def set_image(path: str):
    im = Image.open(path).convert("RGB")
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


def ctrl_v():
    user32.keybd_event(VK_CONTROL, 0, 0, 0)
    time.sleep(0.04)
    user32.keybd_event(VK_V, 0, 0, 0)
    time.sleep(0.04)
    user32.keybd_event(VK_V, 0, KEYEVENTF_KEYUP, 0)
    time.sleep(0.04)
    user32.keybd_event(VK_CONTROL, 0, KEYEVENTF_KEYUP, 0)


import subprocess
ps = r'''
Add-Type -AssemblyName UIAutomationClient
Add-Type -AssemblyName UIAutomationTypes
$hwnd = [IntPtr]264206
$root = [System.Windows.Automation.AutomationElement]::FromHandle($hwnd)
$condName = New-Object System.Windows.Automation.PropertyCondition(
  [System.Windows.Automation.AutomationElement]::NameProperty, "Post text")
$edit = $root.FindFirst([System.Windows.Automation.TreeScope]::Descendants, $condName)
if (-not $edit) { Write-Host "NO EDIT"; exit 2 }
$edit.SetFocus()
Write-Host "FOCUSED"
try {
  $vp = $edit.GetCurrentPattern([System.Windows.Automation.ValuePattern]::Pattern)
  $vp.SetValue("do you see him?")
  Write-Host "SETVALUE OK"
} catch {
  Write-Host "SETVALUE FAIL $_"
}
'''
subprocess.run(["powershell", "-NoProfile", "-Command", ps], check=False)
print("UIA done")

hwnd = 264206
user32.ShowWindow(hwnd, 9)
user32.SetForegroundWindow(hwnd)
time.sleep(0.4)

text = (
    "do you see him?\n\n"
    "subject 0454. one of 1,000 hand-illustrated undead on Base.\n"
    "not generated. the archive was already in the plaza."
)
set_text(text)
user32.SetForegroundWindow(hwnd)
time.sleep(0.2)
ctrl_v()
print("pasted text")
time.sleep(0.8)

set_image(r"C:\Users\Muhammet\Desktop\decay-base-do-you-see-it.jpg")
user32.SetForegroundWindow(hwnd)
time.sleep(0.2)
ctrl_v()
print("pasted image")
time.sleep(4)
print("READY")
