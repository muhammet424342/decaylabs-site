"""Renders the square card art for a Vanta Field Report edition.

Usage: python scripts/build-report-card.py 1
Writes public/report-001.png using the archive palette.
"""
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
SIZE = 1200
VOID = (9, 10, 8)
INK = (241, 238, 230)
TOXIC = (183, 214, 90)
RUST = (240, 106, 72)
LINE = (46, 48, 44)

FONT_CANDIDATES = [
    "C:/Windows/Fonts/consolab.ttf",
    "C:/Windows/Fonts/consola.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf",
]


def load_font(size, bold=True):
    for path in FONT_CANDIDATES if bold else reversed(FONT_CANDIDATES):
        if Path(path).exists():
            return ImageFont.truetype(path, size)
    return ImageFont.load_default(size)


def build(report_id: int) -> Path:
    label = f"{report_id:03d}"
    image = Image.new("RGB", (SIZE, SIZE), VOID)
    draw = ImageDraw.Draw(image)

    # Faint grid, echoing the archive frames on the site.
    for offset in range(0, SIZE, 60):
        draw.line([(offset, 0), (offset, SIZE)], fill=LINE, width=1)
        draw.line([(0, offset), (SIZE, offset)], fill=LINE, width=1)

    margin = 90
    draw.rectangle([margin, margin, SIZE - margin, SIZE - margin], outline=(70, 72, 66), width=2)

    draw.text((margin + 48, margin + 54), "DECAY LABS / VANTA", font=load_font(30), fill=TOXIC)
    draw.text((margin + 48, margin + 104), "FIELD REPORT", font=load_font(56), fill=INK)
    draw.text((margin + 48, margin + 196), label, font=load_font(300), fill=RUST)

    draw.line([(margin + 48, SIZE - margin - 190), (SIZE - margin - 48, SIZE - margin - 190)], fill=(70, 72, 66), width=2)
    draw.text((margin + 48, SIZE - margin - 158), "OPEN EDITION", font=load_font(30), fill=INK)
    draw.text((margin + 48, SIZE - margin - 112), "FREE CLAIM / BASE / ONE PER WALLET", font=load_font(26), fill=(150, 148, 140))
    draw.text((margin + 48, SIZE - margin - 66), "PROOF SURVIVES THE DECAY", font=load_font(26), fill=TOXIC)

    out = ROOT / "public" / f"report-{label}.png"
    image.save(out, optimize=True)
    return out


if __name__ == "__main__":
    report = int(sys.argv[1]) if len(sys.argv) > 1 else 1
    path = build(report)
    print(f"wrote {path.relative_to(ROOT)}")
