from PIL import Image
import numpy as np

p = r"C:\Users\Muhammet\.grok\sessions\C%3A%5CUsers%5CMuhammet\01a030f7-0285-7152-9fed-01558e03bab7\images\5.jpg"
im = Image.open(p).convert("RGB")
arr = np.array(im)
print("size", arr.shape)
print("corner TL", arr[2,2], "TR", arr[2,-3], "BL", arr[-3,2], "BR", arr[-3,-3])
print("center", arr[512,512])
print("mean", arr.mean(axis=(0,1)))
# unique-ish bg: sample a row of top
print("top row sample", arr[10, 10], arr[10, 200], arr[10, 500], arr[10, 800])
