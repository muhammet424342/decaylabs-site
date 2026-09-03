from PIL import Image

im = Image.open(r"C:\Users\Muhammet\Desktop\NFT\decaylabs_archive\public\x-base-remix\base_original.jpg")
print("original", im.size)

# Mochi-style: tight street-level crop of the lower-right plaza
crops = {
    "mochi_zone": (520, 490, 1200, 800),
    "logo_zone": (250, 470, 980, 800),
}
for name, box in crops.items():
    c = im.crop(box)
    path = rf"C:\Users\Muhammet\Desktop\NFT\decaylabs_archive\public\x-base-remix\crop_{name}.jpg"
    c.save(path, quality=95)
    print(name, c.size, box)
