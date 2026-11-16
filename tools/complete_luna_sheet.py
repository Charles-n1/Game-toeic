"""Adds the missing animations to Luna's sprite sheet (art/luna-sheet-source.png).

The new pictures are made from the pictures of the sheet itself: mirrors, a leg lifted for a step, the body
that breathes, the effects of the sheet put on her, and a few small things drawn in pixel art (a potion, sparks, dust).

Writes:
  art/luna-sheet.png         the sheet with a new panel at the bottom: the added animations
  art/luna-added-frames.png  only the added pictures, on a transparent background

Run:  python3 tools/complete_luna_sheet.py      Needs: Pillow, numpy, scipy.
"""

from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy import ndimage

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / 'art' / 'luna-sheet-source.png'
OUT_SHEET = ROOT / 'art' / 'luna-sheet.png'
OUT_FRAMES = ROOT / 'art' / 'luna-added-frames.png'
FONT = ROOT / 'src' / 'game' / 'assets' / 'fonts' / 'PixelifySans.ttf'

PIXEL = 3  # the size of one pixel of the sheet's art, in pixels of the image (for the small things drawn here)

# Where the pictures are in the sheet: (left, top, width, height).
FRONT_WALK = (579, 186, 63, 79)
BACK_WALK = (1040, 187, 50, 77)
LEFT_IDLE = (678, 73, 50, 83)
LEFT_WALK = [(671, 186, 59, 78), (756, 186, 66, 79), (848, 186, 67, 79), (947, 186, 58, 78)]
LEFT_RUN = [(667, 293, 65, 77), (849, 293, 66, 77)]
STANCE = (551, 624, 64, 72)  # attack 3, first picture: the staff raised, looking right
CHEER = (497, 750, 78, 86)  # the special attack, first picture: happy, the staff up
TALK_HAND = (165, 724, 64, 102)  # talk animation: a hand raised
TALK_HAPPY = (240, 724, 64, 102)
MAGIC_CIRCLE = (1292, 835, 92, 91)
BLUE_SPARKS = (1171, 863, 66, 73)

# The colors of the panel, taken from the sheet.
BACKGROUND = (7, 13, 21)
BORDER = (110, 82, 40)
TITLE = (232, 165, 60)
LABEL = (226, 222, 214)


# ---------- Cutting ----------

def cut(sheet, box):
    """The picture in the box, without the dark background around it (only the biggest shape is kept)."""
    left, top, width, height = box
    margin = 4
    piece = sheet[top - margin : top + height + margin, left - margin : left + width + margin].astype(int)
    edge = np.concatenate([piece[0], piece[-1], piece[:, 0], piece[:, -1]])
    background = np.median(edge[:, :3], axis=0)
    distance = np.abs(piece[:, :, :3] - background).sum(axis=2)
    looks_empty = (distance < 40) & (piece[:, :, :3].max(axis=2) < 60)
    labels, _ = ndimage.label(looks_empty)
    border_labels = set(np.unique(np.concatenate([labels[0], labels[-1], labels[:, 0], labels[:, -1]]))) - {0}
    empty = np.isin(labels, list(border_labels))
    shapes, count = ndimage.label(~empty)
    if count > 1:
        sizes = ndimage.sum(~empty, shapes, range(1, count + 1))
        empty = shapes != (int(np.argmax(sizes)) + 1)
    result = np.zeros((*piece.shape[:2], 4), dtype=np.uint8)
    result[:, :, :3] = piece[:, :, :3]
    result[:, :, 3] = np.where(empty, 0, 255)
    return trim(result)


def glow(sheet, box):
    """A glowing effect of the sheet (sparks, a magic circle): its light becomes its opacity."""
    left, top, width, height = box
    piece = sheet[top : top + height, left : left + width, :3].astype(float)
    light = piece.max(axis=2)
    alpha = np.clip((light - 45) / 180, 0, 1)
    colors = np.clip(piece / np.maximum(alpha[:, :, None], 0.05), 0, 255)
    result = np.zeros((height, width, 4), dtype=np.uint8)
    result[:, :, :3] = colors
    result[:, :, 3] = (alpha * 255).astype(np.uint8)
    return result


def trim(picture):
    """Removes the empty rows and columns around the picture."""
    rows = np.where(picture[:, :, 3].any(axis=1))[0]
    columns = np.where(picture[:, :, 3].any(axis=0))[0]
    return picture[rows.min() : rows.max() + 1, columns.min() : columns.max() + 1]


# ---------- Making new pictures ----------

def mirrored(picture):
    return picture[:, ::-1].copy()


def blank(width, height):
    return np.zeros((height, width, 4), dtype=np.uint8)


def stamp(target, picture, x, y):
    """Puts the picture on the target at (x, y): its see-through parts let the target show."""
    base = Image.fromarray(target, 'RGBA')
    base.alpha_composite(Image.fromarray(picture, 'RGBA'), (int(x), int(y)))
    target[:] = np.array(base)


def lift_leg(picture, side, lift=6, legs=15, bob=3):
    """A step seen from the front or the back: one half of the legs goes up, the body goes up a bit.
    side: 'left' or 'right' (of the picture)."""
    height, width = picture.shape[:2]
    middle = width // 2
    result = blank(width, height + lift)
    legs_top = height - legs
    body = picture.copy()
    body[legs_top:] = 0
    lower = picture.copy()
    lower[:legs_top] = 0
    still = lower.copy()
    moving = lower.copy()
    if side == 'left':
        still[:, :middle] = 0
        moving[:, middle:] = 0
    else:
        still[:, middle:] = 0
        moving[:, :middle] = 0
    for offset in range(lift - bob, lift + 1):  # the leg on the ground stretches up to the body (no gap)
        stamp(result, still, 0, offset)
    stamp(result, moving, 0, 0)
    stamp(result, body, 0, lift - bob)
    return trim(result)


def sway(picture, shift, start=0.62):
    """The bottom of the robe swings to one side (the rows below `start` slide more and more)."""
    height, width = picture.shape[:2]
    result = blank(width + abs(shift) * 2, height)
    top = int(height * start)
    for y in range(height):
        move = 0 if y < top else round(shift * (y - top) / (height - top))
        result[y, abs(shift) + move : abs(shift) + move + width] = picture[y]
    return trim(result)


def breathe(picture, drop=3, split=0.58):
    """The upper body goes down a little (breathing): the legs stay."""
    height, width = picture.shape[:2]
    top = int(height * split)
    result = blank(width, height)
    lower = picture.copy()
    lower[:top] = 0
    upper = picture.copy()
    upper[top:] = 0
    stamp(result, lower, 0, 0)
    stamp(result, upper, 0, drop)
    return result


def resized(picture, width, height):
    return np.array(Image.fromarray(picture, 'RGBA').resize((width, height), Image.BOX))


def drawn(rows, colors):
    """A small text picture (one letter = one pixel of the sheet's art), drawn big like the sheet."""
    picture = blank(len(rows[0]) * PIXEL, len(rows) * PIXEL)
    for y, row in enumerate(rows):
        for x, letter in enumerate(row):
            if letter in colors:
                picture[y * PIXEL : (y + 1) * PIXEL, x * PIXEL : (x + 1) * PIXEL] = (*colors[letter], 255)
    return picture


POTION = drawn(
    ['.KK.', '.CC.', 'KBBK', 'BWLB', 'BLLB', 'KBBK'],
    {'K': (28, 20, 40), 'C': (140, 90, 50), 'B': (40, 110, 230), 'L': (90, 170, 255), 'W': (230, 245, 255)},
)
PLUS = drawn(['..G..', '..G..', 'GGWGG', '..G..', '..G..'], {'G': (70, 220, 110), 'W': (220, 255, 225)})
DUST = drawn(['..DDD..', '.DLLLD.', 'DLLLLLD', 'DLLLLLD', '.DDDDD.'], {'D': (120, 110, 120), 'L': (200, 190, 195)})
STAR = drawn(['..Y..', '.YWY.', 'YWWWY', '.YWY.', '..Y..'], {'Y': (255, 205, 70), 'W': (255, 250, 220)})


def with_extras(picture, extras, pad=24):
    """The picture with small things around it. extras: [(thing, x, y)], x and y from the top-left of the picture."""
    height, width = picture.shape[:2]
    result = blank(width + pad * 2, height + pad * 2)
    stamp(result, picture, pad, pad)
    for thing, x, y in extras:
        stamp(result, thing, pad + x, pad + y)
    return trim(result)


def jumped(picture, height):
    """The same picture higher above the ground (empty rows under it)."""
    return np.concatenate([picture, blank(picture.shape[1], height)])


# ---------- The new animations ----------

def added_animations(sheet):
    front = cut(sheet, FRONT_WALK)
    back = cut(sheet, BACK_WALK)
    stance = cut(sheet, STANCE)
    cheer = cut(sheet, CHEER)
    hand = cut(sheet, TALK_HAND)
    happy = cut(sheet, TALK_HAPPY)
    shield = resized(glow(sheet, MAGIC_CIRCLE), 34, 92)
    sparks = resized(glow(sheet, BLUE_SPARKS), 40, 44)
    h_stance = stance.shape[0]
    return {
        'movement': [
            ('WALK DOWN', [lift_leg(front, 'left'), front, lift_leg(front, 'right'), front]),
            ('WALK UP', [sway(lift_leg(back, 'left', 4, 7, 2), 2), back, sway(lift_leg(back, 'right', 4, 7, 2), -2), back]),
            ('WALK RIGHT', [mirrored(cut(sheet, box)) for box in LEFT_WALK]),
            ('IDLE RIGHT', [mirrored(cut(sheet, LEFT_IDLE))]),
        ],
        'battle': [
            ('BATTLE STANCE', [stance, breathe(stance)]),
            ('GUARD', [with_extras(stance, [(shield, stance.shape[1] - 6, h_stance // 2 - 50)])]),
            ('VICTORY', [
                with_extras(cheer, [(sparks, -30, -10), (STAR, cheer.shape[1] + 2, 6)]),
                jumped(with_extras(cheer, [(sparks[:, ::-1].copy(), cheer.shape[1] - 8, -16), (STAR, -14, 20)]), 8),
            ]),
            ('ITEM', [
                with_extras(hand, [(POTION, hand.shape[1] - 18, 38)]),
                with_extras(happy, [(PLUS, -16, 18), (PLUS, happy.shape[1] + 2, 30), (PLUS, 4, -10)]),
            ]),
            ('FLEE', [with_extras(cut(sheet, box), [(DUST, box[2] - 6, box[3] - 16), (DUST, box[2] + 8, box[3] - 24)]) for box in LEFT_RUN]),
        ],
    }


# ---------- The panel ----------

def font(size):
    return ImageFont.truetype(str(FONT), size)


def draw_panel(image, box, title):
    left, top, right, bottom = box
    draw = ImageDraw.Draw(image)
    draw.rounded_rectangle(box, radius=6, fill=BACKGROUND, outline=BORDER, width=2)
    draw.text((left + 14, top + 10), title, font=font(20), fill=TITLE)


def draw_rows(image, rows, left, top, row_height, cell, frames_out):
    """Writes each animation: its name, then its pictures standing on the same line."""
    draw = ImageDraw.Draw(image)
    x = left
    y = top
    for name, pictures in rows:
        width = len(pictures) * cell
        if x + width > left + 700:
            x, y = left, y + row_height
        draw.text((x, y), name, font=font(14), fill=LABEL)
        for i, picture in enumerate(pictures):
            px = x + i * cell + (cell - picture.shape[1]) // 2
            py = y + row_height - 18 - picture.shape[0]
            image.alpha_composite(Image.fromarray(picture, 'RGBA'), (px, py))
            frames_out.append(picture)
        x += width + 30


def frames_strip(pictures):
    """All the added pictures side by side, on a transparent background."""
    width = sum(p.shape[1] for p in pictures) + 6 * len(pictures)
    height = max(p.shape[0] for p in pictures)
    strip = Image.new('RGBA', (width, height))
    x = 0
    for picture in pictures:
        strip.alpha_composite(Image.fromarray(picture, 'RGBA'), (x, height - picture.shape[0]))
        x += picture.shape[1] + 6
    return strip


def main():
    source = Image.open(SOURCE).convert('RGBA')
    sheet = np.array(source)
    animations = added_animations(sheet)
    panel_height = 310
    image = Image.new('RGBA', (source.width, source.height + panel_height), (2, 4, 8, 255))
    image.paste(source, (0, 0))
    top = source.height + 6
    half = source.width // 2
    draw_panel(image, (6, top, half - 4, top + panel_height - 14), 'MOVEMENT (ADDED)')
    draw_panel(image, (half + 4, top, source.width - 6, top + panel_height - 14), 'BATTLE (ADDED)')
    added = []
    draw_rows(image, animations['movement'], 24, top + 46, 122, 82, added)
    draw_rows(image, animations['battle'], half + 22, top + 46, 122, 96, added)
    image.convert('RGB').save(OUT_SHEET)
    frames_strip(added).save(OUT_FRAMES)
    print('saved', OUT_SHEET.name, image.size, 'and', OUT_FRAMES.name, len(added), 'pictures')


main()
