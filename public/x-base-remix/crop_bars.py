from PIL import Image
import numpy as np

src = r"C:\Users\Muhammet\.grok\sessions\C%3A%5CUsers%5CMuhammet\01a030f7-0285-7152-9fed-01558e03bab7\images\3.jpg"
im = Image.open(src).convert("RGB")
arr = np.array(im)
# drop near-black letterbox rows
row_mean = arr.mean(axis=(1, 2))
keep = np.where(row_mean > 18)[0]
cropped = im.crop((0, int(keep[0]), im.width, int(keep[-1]) + 1))
out = r"C:\Users\Muhammet\Desktop\NFT\decaylabs_archive\public\x-base-remix\v3_noletterbox.jpg"
cropped.save(out, quality=95)
print("in", im.size, "out", cropped.size, "rows", keep[0], keep[-1])
