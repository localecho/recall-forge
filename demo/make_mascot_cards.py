from PIL import Image, ImageDraw, ImageFont
import os, math

D = os.path.dirname(os.path.abspath(__file__))
W, H = 1280, 802
BG = (11, 13, 18)
FG = (232, 232, 236)
ACCENT = (91, 141, 239)
ORANGE = (240, 165, 90)
MUTED = (154, 160, 171)


def font(size, bold=False):
    candidates = (
        ["/System/Library/Fonts/Supplemental/Arial Bold.ttf"]
        if bold
        else ["/System/Library/Fonts/Supplemental/Arial.ttf"]
    )
    for c in candidates:
        if os.path.exists(c):
            return ImageFont.truetype(c, size)
    return ImageFont.load_default()


def center_text(draw, y, text, f, fill):
    bbox = draw.textbbox((0, 0), text, font=f)
    w = bbox[2] - bbox[0]
    draw.text(((W - w) / 2, y), text, font=f, fill=fill)


def draw_mascot(draw, cx, cy, scale=1.0):
    """A small friendly anvil character: rounded anvil body, big eyes, spark sparkles."""
    s = scale
    # body (anvil silhouette, simplified as rounded trapezoid stack)
    body_top = cy - 60 * s
    draw.rounded_rectangle(
        [cx - 70 * s, body_top, cx + 70 * s, cy + 10 * s], radius=18 * s, fill=(58, 66, 88)
    )
    draw.rounded_rectangle(
        [cx - 40 * s, cy + 5 * s, cx + 40 * s, cy + 55 * s], radius=10 * s, fill=(46, 52, 70)
    )
    draw.rounded_rectangle(
        [cx - 55 * s, cy + 45 * s, cx + 55 * s, cy + 65 * s], radius=8 * s, fill=(38, 43, 58)
    )
    # eyes
    eye_y = cy - 20 * s
    for dx in (-25, 25):
        draw.ellipse(
            [cx + dx * s - 14 * s, eye_y - 14 * s, cx + dx * s + 14 * s, eye_y + 14 * s],
            fill=FG,
        )
        draw.ellipse(
            [cx + dx * s - 5 * s, eye_y - 5 * s, cx + dx * s + 5 * s, eye_y + 5 * s],
            fill=(20, 22, 28),
        )
    # smile
    draw.arc(
        [cx - 22 * s, cy - 12 * s, cx + 22 * s, cy + 18 * s], start=20, end=160, fill=FG, width=int(4 * s)
    )
    # sparks around it
    for ang, r, color in [(-40, 110, ACCENT), (30, 120, ORANGE), (200, 100, ACCENT), (160, 130, ORANGE)]:
        rad = math.radians(ang)
        sx, sy = cx + r * s * math.cos(rad), cy + r * s * math.sin(rad) - 20 * s
        draw.regular_polygon((sx, sy, 9 * s), n_sides=4, rotation=45, fill=color)


# Title card
img = Image.new("RGB", (W, H), BG)
d = ImageDraw.Draw(img)
draw_mascot(d, W / 2, 250, scale=1.0)
center_text(d, 380, "Recall Forge", font(64, bold=True), FG)
center_text(d, 460, "The study buddy that catches you guessing", font(24), MUTED)
center_text(d, 505, "General Learning Hacks — Sep 2026", font(20), ACCENT)
img.save(f"{D}/00_title.jpg", quality=92)

# End card
img = Image.new("RGB", (W, H), BG)
d = ImageDraw.Draw(img)
draw_mascot(d, W / 2, 220, scale=0.85)
center_text(d, 330, "Go forge some recall.", font(44, bold=True), FG)
center_text(d, 400, "recall-forge-kappa.vercel.app", font(28), ACCENT)
center_text(d, 445, "github.com/localecho/recall-forge", font(22), MUTED)
img.save(f"{D}/09_end.jpg", quality=92)

print("mascot cards written")
