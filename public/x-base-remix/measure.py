from PIL import Image

plaza = Image.open(r"C:\Users\Muhammet\Desktop\NFT\decaylabs_archive\public\x-base-remix\base_plaza_crop.jpg")
print("plaza", plaza.size)
# Sample a few distinctive mascot regions by saving tight crops for visual check
# Approximate locations from the 1200x500 crop:
# white dog center ~ (580, 300), fox ~ (380, 280), mochi cat ~ (820, 400), panda ~ (720, 360)
boxes = {
    "fox": (330, 220, 430, 360),
    "white_dog": (530, 250, 640, 380),
    "panda": (680, 330, 760, 430),
    "mochi": (780, 360, 880, 470),
    "raccoon": (640, 340, 720, 440),
}
for name, box in boxes.items():
    c = plaza.crop(box)
    c.save(rf"C:\Users\Muhammet\Desktop\NFT\decaylabs_archive\public\x-base-remix\meas_{name}.jpg", quality=90)
    print(name, c.size)
