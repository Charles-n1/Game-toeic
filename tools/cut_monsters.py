"""Cuts the sprite sheets of the monsters (art/Monsters/*.png) into the pictures used by the game.

Each sheet holds 3 monsters, one per band (from the top). In each band:
  - a panel of 3 rows (IDLE, WALK, RUN) of 4 pictures;
  - ATTACKS: 3 rows, the monster first (then its effect);
  - DEATH: the monster falling.

The walks of the sheets are a mess: some rows are a real walk (4 steps to the side), others show the 4
DIRECTIONS (down, left, right, up) with one picture each. MONSTERS (below) says which pictures make a good
walk to the side, and where they look. Every side picture is saved looking to the LEFT (the game turns it
in a mirror to look to the right), and the pictures are placed by the middle of their body: no jumping.

Writes:
  src/game/assets/monsters/monsters-atlas.png   all the pictures
  src/game/assets/monsters/monsterFrames.js     where each picture is, and where its feet are

Run it again after changing or adding a sheet:  python3 tools/cut_monsters.py
Needs: Pillow, numpy, scipy.
"""

from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = Path(__file__).resolve().parent.parent
SHEETS = ROOT / 'art' / 'Monsters'
OUT = ROOT / 'src' / 'game' / 'assets' / 'monsters'

OUTLINE = (28, 23, 38, 255)
BANDS = [(15, 352), (360, 676), (684, 1010)]  # the 3 monsters of a sheet, from the top: (top, bottom)
MOVES = (545, 940)  # the panel of the moves: from x to x
ATTACKS = (955, 1100)  # the first picture of each attack: the monster (its effect is further right)
DEATH = (1285, 1525)

# For each monster: its sheet, its band (0, 1, 2), its height in the game (pixels of the art),
# walk: the pictures of the walk to the side [(row, column)] (rows: 0 idle, 1 walk, 2 run),
# looks: where these pictures look ('left' or 'right'), stand: the picture standing still.
# attack: False = the picture of its attack touches the text of the sheet: the game uses the standing one.
CYCLE = [(1, 0), (1, 1), (1, 2), (1, 3)]  # a real walk of 4 steps
TURNS = [(0, 1), (1, 1), (0, 1), (2, 1)]  # columns down, LEFT, right, up: the 3 pictures of the left (idle, walk, run)
TURNS_FIRST = [(0, 0), (1, 0), (0, 0), (2, 0)]  # columns LEFT, down, up, right: the same, in the first column
MONSTERS = {
    'banshee': {'sheet': 'Banshee, lizardman, wraith.png', 'band': 0, 'height': 30, 'walk': TURNS_FIRST, 'looks': 'left', 'stand': (0, 0)},
    'lizardman': {'sheet': 'Banshee, lizardman, wraith.png', 'band': 1, 'height': 32, 'walk': TURNS_FIRST, 'looks': 'left', 'stand': (0, 0)},
    'wraith': {'sheet': 'Banshee, lizardman, wraith.png', 'band': 2, 'height': 32, 'walk': TURNS_FIRST, 'looks': 'left', 'stand': (0, 0), 'attack': False},
    'cultist': {'sheet': 'Cultist, harpy, mimic.png', 'band': 0, 'height': 30, 'walk': CYCLE, 'looks': 'right', 'stand': (0, 0)},
    'harpy': {'sheet': 'Cultist, harpy, mimic.png', 'band': 1, 'height': 30, 'walk': TURNS_FIRST, 'looks': 'left', 'stand': (0, 0)},
    'mimic': {'sheet': 'Cultist, harpy, mimic.png', 'band': 2, 'height': 20, 'walk': CYCLE, 'looks': 'right', 'stand': (0, 0)},
    'drake': {'sheet': 'Drake, rat, mushroom.png', 'band': 0, 'height': 44, 'walk': TURNS, 'looks': 'left', 'stand': (0, 1)},
    'rat': {'sheet': 'Drake, rat, mushroom.png', 'band': 1, 'height': 18, 'walk': TURNS, 'looks': 'left', 'stand': (0, 1)},
    'mushroom': {'sheet': 'Drake, rat, mushroom.png', 'band': 2, 'height': 24, 'walk': TURNS, 'looks': 'left', 'stand': (0, 1)},
    'darkKnight': {'sheet': 'Drowner, bonegolem, dark_knight.png', 'band': 0, 'height': 38, 'walk': TURNS, 'looks': 'left', 'stand': (0, 1)},
    'boneGolem': {'sheet': 'Drowner, bonegolem, dark_knight.png', 'band': 1, 'height': 44, 'walk': TURNS, 'looks': 'left', 'stand': (0, 1)},
    'drowner': {'sheet': 'Drowner, bonegolem, dark_knight.png', 'band': 2, 'height': 34, 'walk': TURNS, 'looks': 'left', 'stand': (0, 1)},
    'goblin': {'sheet': 'Gobelin, slime, skeletton.png', 'band': 2, 'height': 26, 'walk': CYCLE, 'looks': 'right', 'stand': (0, 0)},
    'slime': {'sheet': 'Gobelin, slime, skeletton.png', 'band': 1, 'height': 16, 'walk': CYCLE, 'looks': 'right', 'stand': (0, 0)},
    'skeleton': {'sheet': 'Gobelin, slime, skeletton.png', 'band': 0, 'height': 32, 'walk': CYCLE, 'looks': 'right', 'stand': (0, 0)},
    'iceGolem': {'sheet': 'Ice golem, shadow mage, stone golem.png', 'band': 0, 'height': 44, 'walk': TURNS, 'looks': 'left', 'stand': (0, 1)},
    'shadowMage': {'sheet': 'Ice golem, shadow mage, stone golem.png', 'band': 1, 'height': 32, 'walk': TURNS, 'looks': 'left', 'stand': (0, 1)},
    'stoneGolem': {'sheet': 'Ice golem, shadow mage, stone golem.png', 'band': 2, 'height': 46, 'walk': TURNS, 'looks': 'left', 'stand': (0, 1)},
    'wolf': {'sheet': 'Wolf, orc, spider.png', 'band': 0, 'height': 28, 'walk': CYCLE, 'looks': 'right', 'stand': (0, 0)},
    'orc': {'sheet': 'Wolf, orc, spider.png', 'band': 1, 'height': 36, 'walk': TURNS, 'looks': 'left', 'stand': (0, 1)},
    'spider': {'sheet': 'Wolf, orc, spider.png', 'band': 2, 'height': 20, 'walk': CYCLE, 'looks': 'right', 'stand': (0, 0)},
}


# ---------- Finding the pictures ----------

def drawn_mask(piece):
    """The pixels far from the color of the panel, without the golden lines between the rows."""
    background = np.median(piece.reshape(-1, 3), axis=0)
    drawn = np.abs(piece - background).sum(axis=2) > 60
    lines = drawn.mean(axis=1) > 0.85
    for shift in (-1, 0, 1):
        drawn[np.roll(lines, shift)] = False
    return ndimage.binary_closing(drawn, iterations=2)


def find_shapes(sheet, left, top, right, bottom, min_height=30, merge=2):
    """The boxes (left, top, width, height) of the shapes in a part of the sheet.
    merge: how close two pieces must be to count as one shape (in pixels, about)."""
    drawn = drawn_mask(sheet[top:bottom, left:right, :3].astype(int))
    labels, _ = ndimage.label(ndimage.binary_dilation(drawn, structure=np.ones((3, 3)), iterations=merge))
    boxes = []
    for i, area in enumerate(ndimage.find_objects(labels)):
        height = area[0].stop - area[0].start
        size = (drawn[area] & (labels[area] == i + 1)).sum()
        if height > min_height and size > 400:
            boxes.append((left + area[1].start, top + area[0].start, area[1].stop - area[1].start, height))
    return boxes


def in_rows(boxes):
    """The boxes grouped by rows (from the top), each row from the left."""
    rows = []
    for box in sorted(boxes, key=lambda b: b[1] + b[3] / 2):
        middle = box[1] + box[3] / 2
        if rows and abs(rows[-1]['middle'] - middle) < 35:
            rows[-1]['boxes'].append(box)
        else:
            rows.append({'middle': middle, 'boxes': [box]})
    return [sorted(row['boxes']) for row in rows]


# ---------- Cutting (the same way as tools/cut_characters.py) ----------

def cut_out(sheet, box):
    """The monster in the box, on a transparent background (only its biggest shape, without holes)."""
    left, top, width, height = box
    margin = 3
    piece = sheet[top - margin : top + height + margin, left - margin : left + width + margin, :3].astype(float)
    edge = np.concatenate([piece[0], piece[-1], piece[:, 0], piece[:, -1]])
    looks_empty = np.abs(piece - np.median(edge, axis=0)).sum(axis=2) < 14
    labels, _ = ndimage.label(looks_empty)
    border = set(np.unique(np.concatenate([labels[0], labels[-1], labels[:, 0], labels[:, -1]]))) - {0}
    solid = ~np.isin(labels, list(border))
    solid[solid.mean(axis=1) > 0.97] = False  # a golden line of the sheet crosses the whole box: not the monster
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
    opaque = picture[:, :, 3] > 0
    padded = np.zeros((picture.shape[0] + 2, picture.shape[1] + 2, 4), dtype=np.uint8)
    padded[1:-1, 1:-1] = picture
    inside = np.zeros(padded.shape[:2], dtype=bool)
    inside[1:-1, 1:-1] = opaque
    edge = ndimage.binary_dilation(inside, structure=[[0, 1, 0], [1, 1, 1], [0, 1, 0]]) & ~inside
    padded[edge] = OUTLINE
    return padded


def anchor_of(picture):
    """x: the middle of the body (the columns weighted by their pixels), y: under the lowest row."""
    alpha = picture[:, :, 3] > 0
    rows = np.where(alpha.any(axis=1))[0]
    columns = np.where(alpha)[1]
    return int(round(columns.mean())), int(rows.max()) + 1


# ---------- One monster ----------

def pictures_of(monster):
    """{ name: picture }: 'stand', 'walk-0'...'walk-3', 'attack', 'death-0'...: all looking to the LEFT."""
    sheet = np.array(Image.open(SHEETS / monster['sheet']).convert('RGB'))
    top, bottom = BANDS[monster['band']]
    moves = in_rows(find_shapes(sheet, MOVES[0], top + 40, MOVES[1], bottom))
    attacks = in_rows(find_shapes(sheet, ATTACKS[0], top + 40, ATTACKS[1], bottom, merge=1))  # the label is close
    deaths = find_shapes(sheet, DEATH[0], top + 55, DEATH[1], bottom, min_height=16)  # under the title "DEATH"
    deaths = sorted(deaths, key=lambda b: (b[1] + b[3] // 2) // 60 * 1000 + b[0])  # read like a book
    stand = cut_out(sheet, moves[monster['stand'][0]][monster['stand'][1]])
    factor = stand.shape[0] / monster['height']

    def small(box):
        picture = shrink(cut_out(sheet, box), factor)
        return picture[:, ::-1].copy() if monster['looks'] == 'right' else picture

    pictures = {'stand': small(moves[monster['stand'][0]][monster['stand'][1]])}
    for i, (row, column) in enumerate(monster['walk']):
        pictures['walk-' + str(i)] = small(moves[row][column])
    if attacks and monster.get('attack', True):
        pictures['attack'] = small(attacks[0][0])
    for i, box in enumerate(deaths[:3]):
        pictures['death-' + str(i)] = small(box)
    return {name: add_outline(trim(picture)) for name, picture in pictures.items()}


# ---------- The atlas ----------

def pack(pictures):
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


def write_frames(places, anchors):
    lines = [
        '// Made by tools/cut_monsters.py from art/Monsters/*.png: do not change by hand.',
        '// monster -> picture -> [x, y, width, height, feetX, feetY] in monsters-atlas.png.',
        '// The pictures look to the LEFT: the game turns them in a mirror to look to the right.',
        'export const MONSTER_FRAMES = {',
    ]
    for monster in MONSTERS:
        lines.append(f'  {monster}: {{')
        for (owner, name), (x, y, w, h) in places.items():
            if owner == monster:
                fx, fy = anchors[(owner, name)]
                lines.append(f"    '{name}': [{x}, {y}, {w}, {h}, {fx}, {fy}],")
        lines.append('  },')
    lines.append('};')
    (OUT / 'monsterFrames.js').write_text('\n'.join(lines) + '\n')


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    everything = {}
    for monster_id, monster in MONSTERS.items():
        for name, picture in pictures_of(monster).items():
            everything[(monster_id, name)] = picture
    anchors = {key: anchor_of(picture) for key, picture in everything.items()}
    atlas, places = pack(everything)
    Image.fromarray(atlas, 'RGBA').save(OUT / 'monsters-atlas.png')
    write_frames(places, anchors)
    print(f'{len(MONSTERS)} monsters, {len(everything)} pictures, atlas {atlas.shape[1]}x{atlas.shape[0]}')


if __name__ == '__main__':
    main()
