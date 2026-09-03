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
user32.GetWindowRect.argtypes = [ctypes.c_void_p, ctypes.c_void_p]

GMEM_MOVEABLE = 0x0002
CF_UNICODETEXT = 13
CF_DIB = 8
VK_CONTROL = 0x11
VK_RETURN = 0x0D
VK_A = 0x41
VK_V = 0x56
KEYEVENTF_KEYUP = 0x0002
MOUSEEVENTF_LEFTDOWN = 0x0002
MOUSEEVENTF_LEFTUP = 0x0004


class RECT(ctypes.Structure):
    _fields_ = [("left", ctypes.c_long), ("top", ctypes.c_long),
                ("right", ctypes.c_long), ("bottom", ctypes.c_long)]


def chrome_hwnd():
    out = subprocess.check_output(
        ["powershell", "-NoProfile", "-Command",
         "(Get-Process chrome | Where-Object { $_.MainWindowTitle -match 'Do you see it|base/status' } | Select-Object -First 1).MainWindowHandle"],
        text=True,
    ).strip()
    print("HWND", out)
    return int(out)


def clip_text(s):
    data = s.encode("utf-16-le") + b"\x00\x00"
    assert user32.OpenClipboard(None)
    user32.EmptyClipboard()
    h = kernel32.GlobalAlloc(GMEM_MOVEABLE, len(data))
    p = kernel32.GlobalLock(h)
    ctypes.memmove(p, data, len(data))
    kernel32.GlobalUnlock(h)
    user32.SetClipboardData(CF_UNICODETEXT, h)
    user32.CloseClipboard()


def clip_image(path):
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


hwnd = chrome_hwnd()
user32.ShowWindow(hwnd, 9)
user32.SetForegroundWindow(hwnd)
time.sleep(0.5)
rc = RECT()
user32.GetWindowRect(hwnd, ctypes.byref(rc))
print("RECT", rc.left, rc.top, rc.right - rc.left, rc.bottom - rc.top)

# close any file dialog with Escape
tap(0x1B)
time.sleep(0.3)

click(rc.left + 250, rc.top + 62)
time.sleep(0.25)
chord(VK_CONTROL, VK_A)
clip_text("https://x.com/base/status/2091561569041924167")
time.sleep(0.1)
chord(VK_CONTROL, VK_V)
time.sleep(0.15)
tap(VK_RETURN)
print("NAV")
time.sleep(4)

subprocess.run(["powershell", "-NoProfile", "-File",
                r"C:\Users\Muhammet\Desktop\NFT\decaylabs_archive\public\x-base-remix\_setvalue.ps1"])

clip_image(r"C:\Users\Muhammet\Desktop\decay-base-do-you-see-it.jpg")
user32.SetForegroundWindow(hwnd)
time.sleep(0.25)
chord(VK_CONTROL, VK_V)
print("IMAGE")
time.sleep(4)
print("READY")
