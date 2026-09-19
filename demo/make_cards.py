from PIL import Image, ImageDraw, ImageFont
import os

D = os.path.dirname(os.path.abspath(__file__))
W, H = 1280, 802
BG = (11, 13, 18)
FG = (232, 232, 236)
ACCENT = (91, 141, 239)
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


# Title card
img = Image.new("RGB", (W, H), BG)
d = ImageDraw.Draw(img)
center_text(d, 320, "Recall Forge", font(64, bold=True), FG)
center_text(d, 400, "Adaptive quizzes that diagnose what you don't know yet", font(24), MUTED)
center_text(d, 450, "General Learning Hacks — Sep 2026", font(20), ACCENT)
img.save(f"{D}/00_title.jpg", quality=92)

# End card
img = Image.new("RGB", (W, H), BG)
d = ImageDraw.Draw(img)
center_text(d, 300, "Recall Forge", font(48, bold=True), FG)
center_text(d, 380, "recall-forge-kappa.vercel.app", font(28), ACCENT)
center_text(d, 430, "github.com/localecho/recall-forge", font(24), MUTED)
img.save(f"{D}/09_end.jpg", quality=92)

print("cards written")
