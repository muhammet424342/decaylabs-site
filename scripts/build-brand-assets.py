"""Build Decay Labs production brand assets from source artwork.

The script keeps typography deterministic and exports platform-ready files.
Requires Pillow only; no network calls.
"""

from pathlib import Path
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
SOURCE = PUBLIC / "brand-key-art.png"

INK = (8, 10, 10)
BONE = (226, 220, 202)
RUST = (227, 93, 47)
TOXIC = (200, 211, 74)


def font(size: int, bold: bool = False):
    candidates = [
        Path("C:/Windows/Fonts/bahnschrift.ttf"),
        Path("C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf"),
        Path("C:/Windows/Fonts/segoeuib.ttf" if bold else "C:/Windows/Fonts/segoeui.ttf"),
    ]
    for candidate in candidates:
        if candidate.exists():
            return ImageFont.truetype(str(candidate), size=size)
    return ImageFont.load_default()


def cover(image: Image.Image, size: tuple[int, int], anchor_x: float = 0.5) -> Image.Image:
    target_w, target_h = size
    scale = max(target_w / image.width, target_h / image.height)
    resized = image.resize((round(image.width * scale), round(image.height * scale)), Image.Resampling.LANCZOS)
    left = round((resized.width - target_w) * anchor_x)
    top = (resized.height - target_h) // 2
    return resized.crop((left, top, left + target_w, top + target_h))


def left_fade(size: tuple[int, int], strength: int = 235) -> Image.Image:
    width, height = size
    fade = Image.new("RGBA", size, (0, 0, 0, 0))
    pixels = fade.load()
    for x in range(width):
        t = min(1.0, x / (width * 0.66))
        alpha = round(strength * ((1.0 - t) ** 2.25))
        for y in range(height):
            edge = 0.92 + 0.08 * abs((y / max(1, height - 1)) - 0.5) * 2
            pixels[x, y] = (*INK, round(alpha * edge))
    return fade


def letterspaced(draw: ImageDraw.ImageDraw, position: tuple[int, int], text: str, used_font, fill, spacing: int):
    x, y = position
    for char in text:
        draw.text((x, y), char, font=used_font, fill=fill)
        box = draw.textbbox((x, y), char, font=used_font)
        x += box[2] - box[0] + spacing


def banner(source: Image.Image):
    canvas = cover(source, (1500, 500), 0.5).convert("RGBA")
    canvas = ImageEnhance.Contrast(canvas).enhance(1.08)
    canvas.alpha_composite(left_fade(canvas.size, 245))
    draw = ImageDraw.Draw(canvas)
    draw.rectangle((74, 86, 84, 328), fill=RUST)
    letterspaced(draw, (112, 88), "DECAY LABS", font(68, True), BONE, 3)
    draw.text((116, 190), "EVERYTHING DECAYS.", font=font(27, True), fill=RUST)
    draw.text((116, 225), "PROOF REMAINS.", font=font(27, True), fill=TOXIC)
    draw.text((116, 299), "1,000 founder-created subjects  /  Base", font=font(19), fill=(192, 191, 180))
    draw.text((116, 332), "The Half-Life Archive is now open.", font=font(19), fill=(192, 191, 180))
    canvas.convert("RGB").save(PUBLIC / "x-banner.jpg", quality=94, optimize=True, progressive=True)


def open_graph(source: Image.Image):
    canvas = cover(source, (1200, 630), 0.48).convert("RGBA")
    canvas.alpha_composite(left_fade(canvas.size, 248))
    draw = ImageDraw.Draw(canvas)
    draw.rounded_rectangle((54, 55, 101, 102), radius=8, fill=RUST)
    draw.text((67, 56), "D", font=font(31, True), fill=INK)
    letterspaced(draw, (122, 56), "DECAY LABS", font(31, True), BONE, 2)
    draw.text((58, 188), "EVERYTHING", font=font(70, True), fill=BONE)
    draw.text((58, 264), "DECAYS.", font=font(70, True), fill=RUST)
    draw.text((58, 352), "PROOF REMAINS.", font=font(38, True), fill=TOXIC)
    draw.text((60, 454), "An onchain archive of 1,000 altered subjects on Base.", font=font(22), fill=(207, 204, 191))
    draw.text((60, 494), "Story first. Verifiable provenance. No invented promises.", font=font(19), fill=(164, 164, 154))
    canvas.convert("RGB").save(PUBLIC / "og-v2.png", optimize=True)


def avatar():
    specimen = Image.open(PUBLIC / "nft-7.png").convert("RGB")
    specimen = cover(specimen, (1024, 1024), 0.5)
    specimen = ImageEnhance.Contrast(specimen).enhance(1.1)
    overlay = Image.new("RGBA", specimen.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    draw.rectangle((0, 0, 1024, 1024), outline=RUST, width=30)
    draw.rounded_rectangle((52, 55, 205, 208), radius=22, fill=(*INK, 220), outline=RUST, width=7)
    draw.text((87, 54), "D", font=font(105, True), fill=BONE)
    result = Image.alpha_composite(specimen.convert("RGBA"), overlay).convert("RGB")
    result.save(PUBLIC / "x-avatar.png", optimize=True)
    result.resize((512, 512), Image.Resampling.LANCZOS).save(PUBLIC / "icon-512.png", optimize=True)
    result.resize((192, 192), Image.Resampling.LANCZOS).save(PUBLIC / "icon-192.png", optimize=True)
    result.resize((180, 180), Image.Resampling.LANCZOS).save(PUBLIC / "apple-touch-icon.png", optimize=True)
    result.resize((32, 32), Image.Resampling.LANCZOS).save(PUBLIC / "favicon-32.png", optimize=True)


def social_template(source: Image.Image):
    canvas = cover(source, (1600, 900), 0.48).filter(ImageFilter.GaussianBlur(1.2)).convert("RGBA")
    shade = Image.new("RGBA", canvas.size, (5, 7, 7, 148))
    canvas = Image.alpha_composite(canvas, shade)
    draw = ImageDraw.Draw(canvas)
    draw.rounded_rectangle((74, 70, 1526, 830), radius=28, fill=(8, 10, 10, 185), outline=(227, 93, 47, 145), width=3)
    draw.text((124, 112), "DECAY LABS  /  ARCHIVE TRANSMISSION", font=font(26, True), fill=RUST)
    draw.line((124, 170, 1476, 170), fill=(200, 211, 74, 155), width=2)
    draw.text((124, 706), "EVERYTHING DECAYS. PROOF REMAINS.", font=font(24, True), fill=BONE)
    draw.text((124, 754), "decaylabs.online", font=font(21), fill=TOXIC)
    canvas.convert("RGB").save(PUBLIC / "social-card-template.png", optimize=True)


def main():
    if not SOURCE.exists():
        raise SystemExit(f"Missing source image: {SOURCE}")
    source = Image.open(SOURCE).convert("RGB")
    banner(source)
    open_graph(source)
    avatar()
    social_template(source)
    print("Built x-banner.jpg, x-avatar.png, og-v2.png, social-card-template.png and app icons.")


if __name__ == "__main__":
    main()
