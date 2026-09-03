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
VK_CONTROL = 0x11
VK_RETURN = 0x0D
VK_A = 0x41
VK_V = 0x56
VK_L = 0x4C
KEYEVENTF_KEYUP = 0x0002
MOUSEEVENTF_LEFTDOWN = 0x0002
MOUSEEVENTF_LEFTUP = 0x0004
HWND = 264206


def clip(s: str):
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
    time.sleep(0.03)
    user32.keybd_event(vk, 0, KEYEVENTF_KEYUP, 0)


def chord(mod, vk):
    user32.keybd_event(mod, 0, 0, 0)
    time.sleep(0.03)
    tap(vk)
    time.sleep(0.03)
    user32.keybd_event(mod, 0, KEYEVENTF_KEYUP, 0)


def click(x, y):
    user32.SetCursorPos(int(x), int(y))
    time.sleep(0.06)
    user32.mouse_event(MOUSEEVENTF_LEFTDOWN, 0, 0, 0, 0)
    time.sleep(0.04)
    user32.mouse_event(MOUSEEVENTF_LEFTUP, 0, 0, 0, 0)


def ps(script: str) -> str:
    r = subprocess.run(
        ["powershell", "-NoProfile", "-Command", script],
        capture_output=True,
        text=True,
    )
    print(r.stdout.strip())
    if r.returncode:
        print("PSERR", r.stderr[-400:])
    return r.stdout


user32.ShowWindow(HWND, 9)
user32.SetForegroundWindow(HWND)
time.sleep(0.4)

# omnibox
click(400, 63)
time.sleep(0.25)
chord(VK_CONTROL, VK_A)
time.sleep(0.1)
clip("https://x.com/base/status/2091561569041924167")
time.sleep(0.1)
chord(VK_CONTROL, VK_V)
time.sleep(0.15)
tap(VK_RETURN)
print("NAV")
time.sleep(4.5)

SETVAL = r'''
Add-Type -AssemblyName UIAutomationClient
Add-Type -AssemblyName UIAutomationTypes
$hwnd = [IntPtr]264206
$root = [System.Windows.Automation.AutomationElement]::FromHandle($hwnd)
$cond = New-Object System.Windows.Automation.PropertyCondition([System.Windows.Automation.AutomationElement]::NameProperty, 'Post text')
$edit = $root.FindFirst([System.Windows.Automation.TreeScope]::Descendants, $cond)
if (-not $edit) { Write-Host 'NO EDIT'; exit 2 }
$edit.SetFocus()
Start-Sleep -Milliseconds 200
$vp = $edit.GetCurrentPattern([System.Windows.Automation.ValuePattern]::Pattern)
$vp.SetValue("do you see him?`n`nsubject 0454. one of 1,000 hand-illustrated undead on Base.`nnot generated. the archive was already in the plaza.")
Write-Host ('SET <<' + $vp.Current.Value + '>>')
'''
ps(SETVAL)

# click Add media
ps(rf"""
Add-Type -AssemblyName UIAutomationClient
Add-Type -AssemblyName UIAutomationTypes
$hwnd = [IntPtr]{HWND}
$root = [System.Windows.Automation.AutomationElement]::FromHandle($hwnd)
$all = $root.FindAll([System.Windows.Automation.TreeScope]::Descendants, [System.Windows.Automation.Condition]::TrueCondition)
foreach ($el in $all) {{
  if ($el.Current.Name -eq 'Add media') {{
    $r = $el.Current.BoundingRectangle
    Write-Host ('MEDIA ' + [int]$r.X + ',' + [int]$r.Y)
    try {{ $el.GetCurrentPattern([System.Windows.Automation.InvokePattern]::Pattern).Invoke(); Write-Host 'INVOKED MEDIA' }} catch {{ Write-Host 'NOINV' }}
    break
  }}
}}
""")
time.sleep(1.2)

# file dialog: paste path and enter
img = r"C:\Users\Muhammet\Desktop\decay-base-do-you-see-it.jpg"
clip(img)
time.sleep(0.2)
user32.SetForegroundWindow(HWND)
time.sleep(0.2)
chord(VK_CONTROL, VK_V)
time.sleep(0.2)
tap(VK_RETURN)
print("FILE SENT")
time.sleep(5)

ps(SETVAL.replace("SET <<", "RESET <<"))
print("COMPOSED")
