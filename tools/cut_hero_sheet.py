"""Cuts the hero's sprite sheet (art/hero-sheet.png) into the pictures used by the game.

Each picture of the sheet is cut out, made smaller (to the size of the game's pixel art), and packed in one image:
  src/game/assets/hero/hero-atlas.png   all the pictures
  src/game/assets/hero/heroFrames.js    where each picture is in the atlas, and where its feet are
  src/game/assets/hero/hero-portrait.png the face, for the windows of the game

Run it again after changing the sheet:  python3 tools/cut_hero_sheet.py
Needs: Pillow, numpy, scipy.
"""

from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = Path(__file__).resolve().parent.parent
SHEET = ROOT / 'art' / 'hero-sheet.png'
OUT = ROOT / 'src' / 'game' / 'assets' / 'hero'

SHRINK = 3.3  # the sheet is drawn ~3.3 times bigger than the pixel art of the game
SOLID = 128  # a pixel of the sheet more opaque than this belongs to the hero (the glows are lighter)
OUTLINE = (28, 23, 38, 255)  # the dark edge added around each picture, like the other sprites of the game

# Where each picture is in the sheet: (left, top, width, height), in pixels of the sheet.
FRAMES = {
    'idle-down': (23, 39, 69, 117),
    'idle-up': (416, 39, 77, 115),
    'idle-right': (618, 35, 75, 121),
    'walk-right-0': (15, 221, 79, 109),
    'walk-right-1': (116, 220, 78, 109),
    'walk-right-2': (208, 220, 98, 109),
    'walk-right-3': (325, 217, 84, 112),
    'walk-right-4': (419, 217, 95, 113),
    'walk-right-5': (521, 218, 89, 111),
    'walk-right-6': (617, 220, 86, 109),
    'walk-right-7': (716, 220, 80, 110),
    'walk-up-0': (19, 339, 83, 117),
    'walk-up-1': (125, 338, 73, 118),
    'walk-up-2': (230, 341, 69, 116),
    'walk-up-3': (326, 340, 77, 117),
    'walk-up-4': (427, 343, 75, 112),
    'walk-up-5': (523, 344, 73, 114),
    'walk-up-6': (617, 344, 76, 114),
    'walk-up-7': (714, 345, 75, 113),
    'attack-ready': (856, 62, 87, 95),
    'attack-raise': (943, 61, 113, 95),
    'attack-slash': (1044, 54, 121, 102),
    'combo-raise': (850, 189, 103, 109),
    'combo-lunge': (960, 199, 138, 94),
    'jump-crouch': (850, 364, 84, 96),
    'jump-air': (948, 309, 110, 108),
    'skill-crouch': (123, 526, 90, 100),
    'item-potion': (896, 514, 87, 125),
    'item-happy': (1006, 512, 85, 127),
    'victory': (1273, 478, 105, 161),
    'hurt-0': (13, 692, 99, 103),
    'hurt-1': (128, 697, 82, 97),
    'ko-fall': (355, 694, 108, 101),
    'ko-lying': (485, 729, 139, 61),
    'guard': (459, 861, 99, 115),
    'dodge-roll': (214, 899, 95, 77),
}
PORTRAIT = (1313, 736, 195, 195)  # the head and the scarf (a square)
PORTRAIT_SIZE = 64


def cut_out(sheet, box):
    """The picture in the box, only the hero (the biggest solid shape): the bits of effects around are removed."""
    left, top, width, height = box
    margin = 3
    piece = sheet[top - margin : top + height + margin, left - margin : left + width + margin].astype(float)
    solid = piece[:, :, 3] >= SOLID
    labels, count = ndimage.label(solid)
    if count == 0:
        return piece
    sizes = ndimage.sum(solid, labels, range(1, count + 1))
    hero = labels == (int(np.argmax(sizes)) + 1)
    hero = ndimage.binary_fill_holes(ndimage.binary_dilation(hero, iterations=2))
    piece[:, :, 3] *= hero
    return piece


def shrink(piece, factor):
    """Smaller, then crisp: each pixel is fully opaque or empty (pixel art)."""
    height, width = piece.shape[:2]
    size = (max(1, round(width / factor)), max(1, round(height / factor)))
    alpha = piece[:, :, 3:4] / 255
    premultiplied = np.concatenate([piece[:, :, :3] * alpha, piece[:, :, 3:4]], axis=2).astype(np.uint8)
    small = np.array(Image.fromarray(premultiplied, 'RGBA').resize(size, Image.BOX)).astype(float)
    alpha = small[:, :, 3:4] / 255
    colors = np.where(alpha > 0, small[:, :, :3] / np.maximum(alpha, 1e-6), 0)
    opaque = small[:, :, 3] >= 110
    result = np.zeros_like(small)
    result[:, :, :3] = np.clip(colors, 0, 255)
    result[:, :, 3] = np.where(opaque, 255, 0)
    return result.astype(np.uint8)


def add_outline(picture):
    """Every empty pixel that touches the picture becomes a dark edge."""
    opaque = picture[:, :, 3] > 0
    padded = np.zeros((picture.shape[0] + 2, picture.shape[1] + 2, 4), dtype=np.uint8)
    padded[1:-1, 1:-1] = picture
    inside = np.zeros(padded.shape[:2], dtype=bool)
    inside[1:-1, 1:-1] = opaque
    edge = ndimage.binary_dilation(inside, structure=[[0, 1, 0], [1, 1, 1], [0, 1, 0]]) & ~inside
    padded[edge] = OUTLINE
    return padded


def feet_of(picture):
    """The point that touches the ground: the middle of the lowest rows, just under them."""
    rows = np.where(picture[:, :, 3].any(axis=1))[0]
    bottom = rows.max()
    columns = np.where(picture[bottom - 2 : bottom + 1, :, 3].any(axis=0))[0]
    return int(round(columns.mean())), int(bottom) + 1


def pack(pictures):
    """Puts the pictures side by side in rows. Returns the atlas and where each picture is."""
    width = 512
    x = y = row_height = 0
    places = {}
    for name, picture in pictures.items():
        h, w = picture.shape[:2]
        if x + w > width:
            x, y, row_height = 0, y + row_height + 1, 0
        places[name] = (x, y, w, h)
        x += w + 1
        row_height = max(row_height, h)
    atlas = np.zeros((y + row_height, width, 4), dtype=np.uint8)
    for name, picture in pictures.items():
        px, py, w, h = places[name]
        atlas[py : py + h, px : px + w] = picture
    return atlas, places


def write_frames(places, feet):
    lines = [
        '// Made by tools/cut_hero_sheet.py from art/hero-sheet.png: do not change by hand.',
        '// name: [x, y, width, height, feetX, feetY] in hero-atlas.png (feet: the point that touches the ground).',
        'export const HERO_FRAMES = {',
    ]
    for name, (x, y, w, h) in places.items():
        fx, fy = feet[name]
        lines.append(f"  '{name}': [{x}, {y}, {w}, {h}, {fx}, {fy}],")
    lines.append('};')
    (OUT / 'heroFrames.js').write_text('\n'.join(lines) + '\n')


def main():
    sheet = np.array(Image.open(SHEET).convert('RGBA'))
    pictures = {name: add_outline(shrink(cut_out(sheet, box), SHRINK)) for name, box in FRAMES.items()}
    feet = {name: feet_of(picture) for name, picture in pictures.items()}
    atlas, places = pack(pictures)
    OUT.mkdir(parents=True, exist_ok=True)
    Image.fromarray(atlas, 'RGBA').save(OUT / 'hero-atlas.png')
    write_frames(places, feet)
    left, top, width, height = PORTRAIT
    face = Image.fromarray(sheet[top : top + height, left : left + width]).resize((PORTRAIT_SIZE, PORTRAIT_SIZE), Image.BOX)
    face.save(OUT / 'hero-portrait.png')
    print(f'{len(pictures)} pictures, atlas {atlas.shape[1]}x{atlas.shape[0]}')


main()
