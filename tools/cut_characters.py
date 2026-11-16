"""Cuts the sprite sheets of the characters (art/Characters/*.png) into the pictures used by the game.

Each sheet has a "DIRECTIONS" panel: 3 rows (IDLE, WALK, RUN) of 6 pictures. The pictures are found by
themselves; CHARACTERS (below) says which ones to use for each direction.

The bug of the sheets: the "RIGHT" pictures look to the LEFT (and Sylvia's walk looks to the right only).
So every side picture is saved looking to the LEFT, and the game turns it in a mirror to walk to the right.
The sheets have one picture seen from the front and one from the back: the steps are made from them,
one leg lifted at a time.

Writes:
  src/game/assets/characters/characters-atlas.png   all the pictures of all the characters
  src/game/assets/characters/characterFrames.js     where each picture is, and where its feet are
  src/game/assets/characters/portraits/<id>.png     the face of each character (64 x 64), for the dialogs

Run it again after changing or adding a sheet:  python3 tools/cut_characters.py
Needs: Pillow, numpy, scipy.
"""

from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = Path(__file__).resolve().parent.parent
SHEETS = ROOT / 'art' / 'Characters'
OUT = ROOT / 'src' / 'game' / 'assets' / 'characters'

HEIGHT = 38  # the height of a character in the game (pixels of the art), like the hero
OUTLINE = (28, 23, 38, 255)  # the dark edge around each picture, like the other sprites of the game
PORTRAIT = (18, 18, 196, 196)  # the face, in the top-left box of every sheet: (left, top, width, height)
PORTRAIT_SIZE = 64

# The rows of the DIRECTIONS panel, in pixels of the sheet: (top, bottom). The panel goes from x 560 to 1135.
ROWS = {'idle': (62, 168), 'walk': (178, 276), 'run': (284, 382)}
PANEL = (560, 1135)

# Which picture is which, for each character: (row, index of the picture in the row, from the left).
#   front: seen from the front. back: seen from the back (None = the sheet has none: the front is used).
#   side: standing, seen from the side. walk: the steps seen from the side (2 to 4 pictures).
#   looks: where the side pictures of the sheet look ('left' or 'right').
#   box: a picture cut by hand instead of found (left, top, width, height): Kael's wolf touches him.
CHARACTERS = {
    'luna': {'sheet': 'Luna (mage).png', 'front': ('idle', 0), 'back': ('idle', 3), 'side': ('idle', 1),
             'walk': [('walk', 1), ('walk', 2), ('walk', 3), ('walk', 4)], 'looks': 'left'},
    'selene': {'sheet': 'Selene (arcanist).png', 'front': ('idle', 0), 'back': ('idle', 5), 'side': ('idle', 2),
               'walk': [('walk', 2), ('walk', 3)], 'looks': 'left'},
    'elara': {'sheet': 'Elara (witch heal).png', 'front': ('idle', 0), 'back': None, 'side': ('walk', 1),
              'walk': [('walk', 1), ('walk', 2), ('walk', 3), ('walk', 4)], 'looks': 'left'},
    'darius': {'sheet': 'Darius (smith).png', 'front': ('idle', 0), 'back': ('idle', 4), 'side': ('walk', 1),
               'walk': [('walk', 1), ('walk', 2), ('walk', 3), ('walk', 4)], 'looks': 'left'},
    'dorian': {'sheet': 'Darius (brigand).png', 'front': ('idle', 0), 'back': ('idle', 5), 'side': ('idle', 1),
               'walk': [('walk', 1), ('walk', 2), ('walk', 3), ('walk', 4)], 'looks': 'left'},
    'arthur': {'sheet': 'Arthur (knight).png', 'front': ('idle', 0), 'back': ('idle', 5), 'side': ('idle', 3),
               'walk': [('walk', 2), ('run', 2), ('walk', 3), ('run', 3)], 'looks': 'left'},
    'lyra': {'sheet': 'Lyra (paladin).png', 'front': ('idle', 0), 'back': None, 'side': ('walk', 1),
             'walk': [('walk', 1), ('walk', 2), ('walk', 3), ('walk', 4)], 'looks': 'left'},
    'hinata': {'sheet': 'Hinata (samurai).png', 'front': ('idle', 0), 'back': ('idle', 5), 'side': ('walk', 1),
               'walk': [('walk', 1), ('walk', 2), ('walk', 3), ('walk', 4)], 'looks': 'left'},
    'kaelthra': {'sheet': 'Kaelthra (runeblade).png', 'front': ('idle', 0), 'back': ('idle', 4), 'side': ('idle', 1),
                 'walk': [('walk', 1), ('walk', 2), ('walk', 3), ('walk', 4)], 'looks': 'left'},
    'lucien': {'sheet': 'Lucien (puppeter).png', 'front': ('idle', 0), 'back': None, 'side': ('walk', 2),
               'walk': [('walk', 1), ('walk', 2), ('walk', 3), ('walk', 4)], 'looks': 'left'},
    'sylvia': {'sheet': 'Sylvia (druid rare).png', 'front': ('idle', 0), 'back': None, 'side': ('walk', 1),
               'walk': [('walk', 1), ('walk', 2), ('walk', 3), ('walk', 4)], 'looks': 'right'},
    'vespera': {'sheet': 'Vespera (necromancer).png', 'front': ('idle', 0), 'back': ('walk', 5), 'side': ('walk', 1),
                'walk': [('walk', 1), ('walk', 2), ('walk', 3), ('walk', 4)], 'looks': 'left'},
    'corvin': {'sheet': '? (plague doctor).png', 'front': ('idle', 0), 'back': None, 'side': ('idle', 4),
               'walk': [('walk', 2), ('walk', 3), ('walk', 4), ('walk', 5)], 'looks': 'left'},
    'kael': {'sheet': 'Kael (beastmaster).png', 'front': ('box', (578, 73, 58, 95)), 'back': None, 'side': None,
             'walk': [], 'looks': 'left'},
}


# ---------- Finding the pictures ----------

def background_of(piece):
    """The color of the panel: the most common color of the piece."""
    return np.median(piece.reshape(-1, 3), axis=0)


def find_pictures(sheet, top, bottom):
    """The boxes (left, top, width, height) of the pictures of one row, from the left to the right."""
    left, right = PANEL
    piece = sheet[top:bottom, left:right, :3].astype(int)
    drawn = np.abs(piece - background_of(piece)).sum(axis=2) > 60
    drawn = ndimage.binary_closing(drawn, iterations=2)
    labels, _ = ndimage.label(ndimage.binary_dilation(drawn, iterations=4))
    boxes = []
    for i, area in enumerate(ndimage.find_objects(labels)):
        height = area[0].stop - area[0].start
        width = area[1].stop - area[1].start
        size = (drawn[area] & (labels[area] == i + 1)).sum()
        if height > 40 and size > 600:
            boxes.append((left + area[1].start, top + area[0].start, width, height))
    return sorted(boxes)


def box_of(sheet, rows, place):
    row, index = place
    if row == 'box':
        return index
    return rows[row][index]


# ---------- Cutting ----------

def cut_out(sheet, box):
    """The character in the box, on a transparent background. The background = the pixels of the color of the
    panel that touch the border of the box (a dark hair inside the character is not the background).
    Only the biggest shape is kept (the bits of effects around are removed), without holes."""
    left, top, width, height = box
    margin = 3
    piece = sheet[top - margin : top + height + margin, left - margin : left + width + margin, :3].astype(float)
    edge = np.concatenate([piece[0], piece[-1], piece[:, 0], piece[:, -1]])
    looks_empty = np.abs(piece - np.median(edge, axis=0)).sum(axis=2) < 14
    labels, _ = ndimage.label(looks_empty)
    border = set(np.unique(np.concatenate([labels[0], labels[-1], labels[:, 0], labels[:, -1]]))) - {0}
    solid = ~np.isin(labels, list(border))
    solid = ndimage.binary_opening(solid, iterations=1)
    labels, count = ndimage.label(solid)
    if count > 1:
        sizes = ndimage.sum(solid, labels, range(1, count + 1))
        solid = labels == (int(np.argmax(sizes)) + 1)
    solid = ndimage.binary_fill_holes(solid)
    result = np.zeros((*piece.shape[:2], 4), dtype=float)
    result[:, :, :3] = piece
    result[:, :, 3] = np.where(solid, 255, 0)
    return trim(result)


def trim(picture):
    """Removes the empty rows and columns around the picture."""
    rows = np.where(picture[:, :, 3].any(axis=1))[0]
    columns = np.where(picture[:, :, 3].any(axis=0))[0]
    return picture[rows.min() : rows.max() + 1, columns.min() : columns.max() + 1]


def shrink(piece, factor):
    """Smaller, then crisp: each pixel is fully opaque or empty (pixel art)."""
    height, width = piece.shape[:2]
    size = (max(1, round(width / factor)), max(1, round(height / factor)))
    alpha = piece[:, :, 3:4] / 255
    premultiplied = np.concatenate([piece[:, :, :3] * alpha, piece[:, :, 3:4]], axis=2).astype(np.uint8)
    small = np.array(Image.fromarray(premultiplied, 'RGBA').resize(size, Image.BOX)).astype(float)
    alpha = small[:, :, 3:4] / 255
    colors = np.where(alpha > 0, small[:, :, :3] / np.maximum(alpha, 1e-6), 0)
    result = np.zeros_like(small)
    result[:, :, :3] = np.clip(colors, 0, 255)
    result[:, :, 3] = np.where(small[:, :, 3] >= 110, 255, 0)
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


def mirrored(picture):
    return picture[:, ::-1].copy()


# ---------- The steps seen from the front and from the back ----------

def lift_leg(picture, side):
    """A step: the half of the legs on one side goes 2 pixels up, the body 1 pixel. side: 'left' or 'right'.
    The picture gets 1 more row on the top (the body goes up into it)."""
    height, width = picture.shape[:2]
    legs_top = round(height * 0.78)
    middle = width // 2
    lifted = slice(0, middle) if side == 'left' else slice(middle, width)
    standing = slice(middle, width) if side == 'left' else slice(0, middle)
    legs = picture[legs_top:]
    result = np.zeros((height + 1, width, 4), dtype=np.uint8)
    result[legs_top + 1 :, standing] = legs[:, standing]  # the leg on the ground does not move
    result[legs_top, standing] = legs[0, standing]  # (stretched by 1 pixel up to the body: no hole)
    result[legs_top - 1 : height - 1, lifted] = legs[:, lifted]  # the lifted leg
    body = picture[:legs_top]
    result[:legs_top] = np.where(body[:, :, 3:4] > 0, body, result[:legs_top])  # the body, over the lifted leg
    return result


# ---------- The anchor: the point that touches the ground ----------

def anchor_of(picture):
    """x: the middle of the head (it stays still while the legs and the cape move). y: under the lowest row."""
    rows = np.where(picture[:, :, 3].any(axis=1))[0]
    top, bottom = rows.min(), rows.max()
    head = picture[top : top + round((bottom - top) * 0.4), :, 3] > 0
    return int(round(np.where(head)[1].mean())), int(bottom) + 1


# ---------- One character ----------

def pictures_of(character):
    """All the pictures of a character: { name: picture }. The side pictures all look to the left."""
    sheet = np.array(Image.open(SHEETS / character['sheet']).convert('RGB'))
    rows = {row: find_pictures(sheet, top, bottom) for row, (top, bottom) in ROWS.items()}
    front = cut_out(sheet, box_of(sheet, rows, character['front']))
    factor = front.shape[0] / HEIGHT

    def small(place):
        picture = shrink(cut_out(sheet, box_of(sheet, rows, place)), factor)
        return mirrored(picture) if character['looks'] == 'right' else picture

    pictures = {'front': shrink(front, factor)}
    pictures['front-step-a'] = lift_leg(pictures['front'], 'left')
    pictures['front-step-b'] = lift_leg(pictures['front'], 'right')
    if character['back']:
        pictures['back'] = small(character['back'])
        pictures['back-step-a'] = lift_leg(pictures['back'], 'left')
        pictures['back-step-b'] = lift_leg(pictures['back'], 'right')
    if character['side']:
        pictures['side'] = small(character['side'])
    for i, place in enumerate(character['walk']):
        pictures['side-walk-' + str(i)] = small(place)
    return {name: add_outline(trim(picture)) for name, picture in pictures.items()}, sheet


def portrait_of(sheet):
    left, top, width, height = PORTRAIT
    face = Image.fromarray(sheet[top : top + height, left : left + width])
    return face.resize((PORTRAIT_SIZE, PORTRAIT_SIZE), Image.BOX)


# ---------- The atlas ----------

def pack(pictures):
    """Puts the pictures side by side in rows. pictures: { key: picture }. Returns the atlas and the places."""
    width = 512
    x = y = row_height = 0
    places = {}
    for key, picture in pictures.items():
        h, w = picture.shape[:2]
        if x + w > width:
            x, y, row_height = 0, y + row_height + 1, 0
        places[key] = (x, y, w, h)
        x += w + 1
        row_height = max(row_height, h)
    atlas = np.zeros((y + row_height, width, 4), dtype=np.uint8)
    for key, picture in pictures.items():
        px, py, w, h = places[key]
        atlas[py : py + h, px : px + w] = picture
    return atlas, places


def write_frames(characters, places, anchors):
    lines = [
        '// Made by tools/cut_characters.py from art/Characters/*.png: do not change by hand.',
        '// character -> picture -> [x, y, width, height, feetX, feetY] in characters-atlas.png.',
        "// The side pictures look to the LEFT: the game turns them in a mirror to look to the right.",
        'export const CHARACTER_FRAMES = {',
    ]
    for character in characters:
        lines.append(f'  {character}: {{')
        for (owner, name), (x, y, w, h) in places.items():
            if owner == character:
                fx, fy = anchors[(owner, name)]
                lines.append(f"    '{name}': [{x}, {y}, {w}, {h}, {fx}, {fy}],")
        lines.append('  },')
    lines.append('};')
    (OUT / 'characterFrames.js').write_text('\n'.join(lines) + '\n')


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / 'portraits').mkdir(exist_ok=True)
    everything = {}
    for character_id, character in CHARACTERS.items():
        pictures, sheet = pictures_of(character)
        for name, picture in pictures.items():
            everything[(character_id, name)] = picture
        portrait_of(sheet).save(OUT / 'portraits' / (character_id + '.png'))
        print(character_id, len(pictures), 'pictures')
    anchors = {key: anchor_of(picture) for key, picture in everything.items()}
    atlas, places = pack(everything)
    Image.fromarray(atlas, 'RGBA').save(OUT / 'characters-atlas.png')
    write_frames(CHARACTERS.keys(), places, anchors)
    print(f'atlas {atlas.shape[1]}x{atlas.shape[0]}')


main()
