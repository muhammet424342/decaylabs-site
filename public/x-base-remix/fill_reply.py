import ctypes
import io
import time
from ctypes import wintypes
from pathlib import Path

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
user32.EmptyClipboard.restype = ctypes.c_bool
user32.CloseClipboard.restype = ctypes.c_bool

KEYEVENTF_KEYUP = 0x0002
VK_CONTROL = 0x11
VK_V = 0x56
VK_R = 0x52
MOUSEEVENTF_LEFTDOWN = 0x0002
MOUSEEVENTF_LEFTUP = 0x0004
GMEM_MOVEABLE = 0x0002
CF_UNICODETEXT = 13
CF_DIB = 8
CF_HDROP = 15


class RECT(ctypes.Structure):
    _fields_ = [("left", ctypes.c_long), ("top", ctypes.c_long),
                ("right", ctypes.c_long), ("bottom", ctypes.c_long)]


def key(vk, down=True):
    user32.keybd_event(vk, 0, 0 if down else KEYEVENTF_KEYUP, 0)


def tap(vk):
    key(vk, True)
    time.sleep(0.04)
    key(vk, False)


def ctrl_v():
    key(VK_CONTROL, True)
    time.sleep(0.04)
    tap(VK_V)
    time.sleep(0.04)
    key(VK_CONTROL, False)


def click(x, y):
    user32.SetCursorPos(int(x), int(y))
    time.sleep(0.06)
    user32.mouse_event(MOUSEEVENTF_LEFTDOWN, 0, 0, 0, 0)
    time.sleep(0.04)
    user32.mouse_event(MOUSEEVENTF_LEFTUP, 0, 0, 0, 0)


def set_text(s: str):
    data = s.encode("utf-16-le") + b"\x00\x00"
    if not user32.OpenClipboard(None):
        raise RuntimeError("OpenClipboard text")
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
    if not user32.OpenClipboard(None):
        raise RuntimeError("OpenClipboard image")
    user32.EmptyClipboard()
    h = kernel32.GlobalAlloc(GMEM_MOVEABLE, len(dib))
    p = kernel32.GlobalLock(h)
    ctypes.memmove(p, dib, len(dib))
    kernel32.GlobalUnlock(h)
    user32.SetClipboardData(CF_DIB, h)
    user32.CloseClipboard()


text = (
    "do you see him?\n\n"
    "subject 0454. one of 1,000 hand-illustrated undead on Base.\n"
    "not generated. the archive was already in the plaza."
)
img = r"C:\Users\Muhammet\Desktop\decay-base-do-you-see-it.jpg"

hwnd = 264206
user32.ShowWindow(hwnd, 9)
user32.SetForegroundWindow(hwnd)
time.sleep(0.35)

# Focus the tweet (Do you see it? / image area), then R = reply
click(1600, 175)
time.sleep(0.25)
tap(VK_R)
print("PRESSED R")
time.sleep(1.2)

set_text(text)
user32.SetForegroundWindow(hwnd)
time.sleep(0.25)
ctrl_v()
print("PASTED TEXT")
time.sleep(0.6)

set_image(img)
user32.SetForegroundWindow(hwnd)
time.sleep(0.25)
ctrl_v()
print("PASTED IMAGE")
time.sleep(4)
print("READY")
