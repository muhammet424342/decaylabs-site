from PIL import Image

src = r"C:\Users\Muhammet\Desktop\NFT\decaylabs_archive\public\x-base-remix\base_original.jpg"
im = Image.open(src)
crop = im.crop((0, 300, 1200, 800))
out = r"C:\Users\Muhammet\Desktop\NFT\decaylabs_archive\public\x-base-remix\base_plaza_crop.jpg"
crop.save(out, quality=95)
print("crop", crop.size, "saved", out)
