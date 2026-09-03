import ctypes
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
VK_V = 0x56
VK_A = 0x41
KEYEVENTF_KEYUP = 0x0002
MOUSEEVENTF_LEFTDOWN = 0x0002
MOUSEEVENTF_LEFTUP = 0x0004

text = (
    "do you see him?\n\n"
    "subject 0454. one of 1,000 hand-illustrated undead on Base.\n"
    "not generated. the archive was already in the plaza."
)
data = text.encode("utf-16-le") + b"\x00\x00"
assert user32.OpenClipboard(None)
user32.EmptyClipboard()
h = kernel32.GlobalAlloc(GMEM_MOVEABLE, len(data))
p = kernel32.GlobalLock(h)
ctypes.memmove(p, data, len(data))
kernel32.GlobalUnlock(h)
user32.SetClipboardData(CF_UNICODETEXT, h)
user32.CloseClipboard()

hwnd = 264206
user32.SetForegroundWindow(hwnd)
time.sleep(0.3)
# click Post text box
user32.SetCursorPos(1059, 522)
time.sleep(0.08)
user32.mouse_event(MOUSEEVENTF_LEFTDOWN, 0, 0, 0, 0)
time.sleep(0.04)
user32.mouse_event(MOUSEEVENTF_LEFTUP, 0, 0, 0, 0)
time.sleep(0.3)

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

chord(VK_CONTROL, VK_A)
time.sleep(0.15)
chord(VK_CONTROL, VK_V)
print("PASTED TEXT")
time.sleep(0.8)
print("READY")
