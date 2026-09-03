from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

crop_path = Path(r"C:\Users\Muhammet\Desktop\NFT\decaylabs_archive\public\x-base-remix\crop_mochi_zone.jpg")
sprite_path = Path(
    r"C:\Users\Muhammet\.grok\sessions\C%3A%5CUsers%5CMuhammet\01a030f7-0285-7152-9fed-01558e03bab7\images\5.jpg"
)
out_path = Path(
    r"C:\Users\Muhammet\Desktop\NFT\decaylabs_archive\public\x-base-remix\decay-base-do-you-see-it.jpg"
)

crop = Image.open(crop_path).convert("RGBA")
sprite = Image.open(sprite_path).convert("RGB")
arr = np.array(sprite)
r, g, b = arr[:, :, 0].astype(np.int16), arr[:, :, 1].astype(np.int16), arr[:, :, 2].astype(np.int16)

# Background is compressed magenta-pink ~ (204, 60, 148)
bg = (r > 170) & (g < 100) & (b > 110) & (b < 190) & (r > g + 70)
# keep a thin fringe by eroding the mask slightly via a simple neighbor shrink
mask_bg = bg
alpha = np.where(mask_bg, 0, 255).astype(np.uint8)

rgba = np.dstack([arr, alpha])
cut = Image.fromarray(rgba, "RGBA")
bbox = cut.split()[-1].getbbox()
cut = cut.crop(bbox)
print("crop", crop.size, "cut", cut.size, "bbox", bbox)

# Cream cat in this 680x310 crop is ~90px. Make 454 a bit taller (humanoid) ~125px.
target_h = 125
scale = target_h / cut.size[1]
cut = cut.resize((max(1, int(cut.size[0] * scale)), target_h), Image.Resampling.LANCZOS)

# Drop shadow
shadow = Image.new("RGBA", (cut.size[0] + 20, cut.size[1] + 20), (0, 0, 0, 0))
s = Image.new("RGBA", cut.size, (0, 0, 0, 80))
shadow.paste(s, (8, 12), cut.split()[-1])
shadow = shadow.filter(ImageFilter.GaussianBlur(3))

# Left of the cream cat, on the pavement, above LFG / bike
x = 248
y = crop.size[1] - cut.size[1] - 16
print("place", x, y)

canvas = crop.copy()
canvas.alpha_composite(shadow, (x - 4, y + 4))
canvas.alpha_composite(cut, (x, y))
final = canvas.convert("RGB")
final.save(out_path, quality=95, subsampling=0)
print("saved", out_path, final.size)
