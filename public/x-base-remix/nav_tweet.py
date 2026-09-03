import ctypes
import time
from ctypes import wintypes
from pathlib import Path

import sys

user32 = ctypes.windll.user32
kernel32 = ctypes.windll.kernel32

KEYEVENTF_KEYUP = 0x0002
VK_CONTROL = 0x11
VK_RETURN = 0x0D
VK_L = 0x4C
VK_A = 0x41
VK_V = 0x56
VK_R = 0x52

MOUSEEVENTF_LEFTDOWN = 0x0002
MOUSEEVENTF_LEFTUP = 0x0004


class RECT(ctypes.Structure):
    _fields_ = [("left", ctypes.c_long), ("top", ctypes.c_long),
                ("right", ctypes.c_long), ("bottom", ctypes.c_long)]


def key(vk, down=True):
    user32.keybd_event(vk, 0, 0 if down else KEYEVENTF_KEYUP, 0)


def chord(mod, vk):
    key(mod, True)
    time.sleep(0.05)
    key(vk, True)
    time.sleep(0.05)
    key(vk, False)
    time.sleep(0.05)
    key(mod, False)


def click(x, y):
    user32.SetCursorPos(int(x), int(y))
    time.sleep(0.08)
    user32.mouse_event(MOUSEEVENTF_LEFTDOWN, 0, 0, 0, 0)
    time.sleep(0.05)
    user32.mouse_event(MOUSEEVENTF_LEFTUP, 0, 0, 0, 0)


def foreground_chrome():
    EnumWindows = user32.EnumWindows
    EnumWindowsProc = ctypes.WINFUNCTYPE(ctypes.c_bool, ctypes.c_void_p, ctypes.c_void_p)
    found = []

    def _cb(hwnd, lparam):
        if user32.IsWindowVisible(hwnd):
            length = user32.GetWindowTextLengthW(hwnd)
            buf = ctypes.create_unicode_buffer(length + 1)
            user32.GetWindowTextW(hwnd, buf, length + 1)
            title = buf.value
            if "Google Chrome" in title:
                found.append((hwnd, title))
        return True

    EnumWindows(EnumWindowsProc(_cb), 0)
    if not found:
        raise SystemExit("no chrome window")
    hwnd, title = found[0]
    print("CHROME", hwnd, title)
    user32.ShowWindow(hwnd, 9)
    user32.SetForegroundWindow(hwnd)
    time.sleep(0.4)
    rc = RECT()
    user32.GetWindowRect(hwnd, ctypes.byref(rc))
    print("RECT", rc.left, rc.top, rc.right, rc.bottom)
    return hwnd, rc


hwnd, rc = foreground_chrome()
# omnibox
click(rc.left + 250, rc.top + 62)
time.sleep(0.3)
chord(VK_CONTROL, VK_A)
time.sleep(0.15)

url = "https://x.com/base/status/2091561569041924167"
# put URL on clipboard via PowerShell-less win32
import subprocess
subprocess.run(
    ["powershell", "-NoProfile", "-Command",
     f"Set-Clipboard -Value '{url}'"],
    check=True,
)
time.sleep(0.2)
chord(VK_CONTROL, VK_V)
time.sleep(0.2)
key(VK_RETURN, True)
time.sleep(0.05)
key(VK_RETURN, False)
print("NAV SENT")
time.sleep(4)
print("DONE NAV")
