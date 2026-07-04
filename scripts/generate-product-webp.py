#!/usr/bin/env python3
"""Generate valid WebP product poster assets for PGR UAE catalog."""

from PIL import Image, ImageDraw, ImageFont
import os

OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "images", "products")
os.makedirs(OUT_DIR, exist_ok=True)

W, H = 1200, 900

PRODUCTS = [
    ("01-bullion-collection.webp", "PGR UAE Bullion Collection", "Gold • Silver • Mint Products", (26, 22, 18), (198, 161, 91)),
    ("02-gold-bars-1g-5g-10g.webp", "Gold Bars", "1g • 5g • 10g", (32, 26, 20), (212, 175, 95)),
    ("03-gold-bars-20g-50g.webp", "Gold Bars", "20g • 50g • 1oz", (32, 26, 20), (205, 168, 88)),
    ("04-gold-bar-100g.webp", "Gold Bar", "100 Grams • 999.9 Fine", (30, 24, 18), (198, 161, 91)),
    ("05-gold-bar-1kg.webp", "Gold Bar", "1 Kilogram • 999.9 Fine", (30, 24, 18), (190, 155, 82)),
    ("06-silver-bars-1oz-100g.webp", "Silver Bars", "1oz • 50g • 100g", (22, 24, 28), (196, 202, 210)),
    ("07-silver-bar-500g.webp", "Silver Bar", "500 Grams • 999.0 Fine", (22, 24, 28), (188, 196, 204)),
    ("08-silver-bar-1kg.webp", "Silver Bar", "1 Kilogram • 999.0 Fine", (22, 24, 28), (180, 188, 196)),
    ("09-mint-bars-coins.webp", "Mint Bars & Bullion Coins", "Sovereign • Maple • Britannia", (28, 24, 20), (198, 161, 91)),
    ("10-custom-bullion-inquiry.webp", "Custom Bullion Inquiry", "Bespoke Sizing • Bulk Sourcing", (24, 22, 18), (170, 145, 78)),
]


def load_font(size: int, bold: bool = False):
    candidates = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
    ]
    for path in candidates:
        if os.path.exists(path):
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def draw_bar(draw, x, y, w, h, color, label):
    draw.rounded_rectangle((x, y, x + w, y + h), radius=18, fill=color, outline=(255, 255, 255, 40), width=2)
    draw.text((x + w // 2, y + h // 2), label, fill=(20, 18, 16), font=load_font(22, True), anchor="mm")


def render(filename, title, subtitle, bg, accent):
    img = Image.new("RGB", (W, H), bg)
    draw = ImageDraw.Draw(img)

    # vignette panels
    draw.rectangle((0, 0, W, 120), fill=(12, 11, 10))
    draw.rectangle((0, H - 90, W, H), fill=(12, 11, 10))

    # accent glow
    for i in range(8, 0, -1):
        alpha = 18 + i * 4
        draw.ellipse((W // 2 - 220 - i * 8, 220 - i * 8, W // 2 + 220 + i * 8, 620 + i * 8), outline=accent + (alpha,))

    is_silver = "silver" in filename or filename.startswith("06") or filename.startswith("07") or filename.startswith("08")
    bar_color = (210, 214, 220) if is_silver else accent

    if "coins" in filename:
        draw.ellipse((430, 260, 770, 600), fill=bar_color, outline=(255, 255, 255, 80))
        draw.ellipse((470, 300, 730, 560), outline=(40, 36, 30), width=4)
    elif "collection" in filename or "inquiry" in filename:
        draw_bar(draw, 250, 280, 180, 110, bar_color, "Au")
        draw_bar(draw, 510, 250, 180, 140, (200, 206, 214) if not is_silver else bar_color, "Ag")
        draw_bar(draw, 770, 300, 180, 100, bar_color, "999")
    else:
        count = 3 if "1g-5g" in filename or "20g-50g" in filename or "1oz-100g" in filename else 1
        sizes = [(280, 360), (460, 300), (640, 220)] if count == 3 else [(460, 280)]
        labels = ["1g", "5g", "10g"] if "1g-5g" in filename else ["20g", "50g", "1oz"] if "20g-50g" in filename else ["1oz", "50g", "100g"] if "1oz-100g" in filename else ["100g"] if "100g" in filename and "1oz" not in filename else ["1kg"] if "1kg" in filename and "silver" not in filename else ["500g"] if "500g" in filename else ["1kg"]
        for (x, y), label, bw in zip(sizes, labels, [150, 170, 190] if count == 3 else [240]):
            draw_bar(draw, x, y, bw, 90 if count == 3 else 130, bar_color, label)

    draw.text((60, 36), "PGR UAE", fill=accent, font=load_font(34, True))
    draw.text((60, 78), "Precious Metals Desk", fill=(200, 194, 184), font=load_font(20))
    draw.text((W // 2, H - 58), title, fill=(245, 240, 232), font=load_font(42, True), anchor="mm")
    draw.text((W // 2, H - 22), subtitle, fill=(180, 172, 158), font=load_font(22), anchor="mm")

    out = os.path.join(OUT_DIR, filename)
    img.save(out, "WEBP", quality=88, method=6)
    with open(out, "rb") as f:
        header = f.read(12)
    assert header[:4] == b"RIFF" and header[8:12] == b"WEBP", f"Invalid WebP: {filename}"
    print(f"OK {filename} ({os.path.getsize(out)} bytes) RIFF/WEBP verified")


if __name__ == "__main__":
    for item in PRODUCTS:
        render(*item)
    print("All product WebP assets generated.")
