"""Builds the world of the game from the painted map art/MAP.png.

The map is cut in 256 x 256 tiles (one tile = about 5 pixels of the painting). For each tile, the colors of its
pixels say what it is: sea, river, forest, meadow, road, sand, snow, rock, lava...
Then nature is added (trees, rocks, cacti, lava cracks) following how dark or bright the painting is there.

Writes src/game/world/terrain.js: the ground of every tile and its land (biome), as compressed text,
and src/game/assets/world/world-map.jpg: the painting itself, for the world map of the menu.
The villages, the dungeons, the castle and the people are NOT here: they are placed by the game
(see data/zones.js), on top of this ground.

Run it again after changing the map:  python3 tools/build_world.py
To see what it made:                   python3 tools/build_world.py preview.png
Needs: Pillow, numpy, scipy, matplotlib.
"""

from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = Path(__file__).resolve().parent.parent
MAP = ROOT / 'art' / 'MAP.png'
OUT = ROOT / 'src' / 'game' / 'world' / 'terrain.js'
PAINTING = ROOT / 'src' / 'game' / 'assets' / 'world' / 'world-map.jpg'

SIZE = 256  # tiles

# The letters of the ground (the same in world/map.js).
GROUND = {
    'water': 'w', 'grass': 'g', 'flower': 'F', 'path': 'p', 'bridge': 'b', 'sand': 's', 'tree': 't', 'rock': 'r',
    'snow': 'n', 'ash': 'a', 'lava': 'l', 'deadTree': 'd', 'cliff': 'c',
}
# The letters of the lands (biomes).
BIOME = {'meadow': 'm', 'forest': 'f', 'mountain': 'n', 'demon': 'v', 'desert': 'd', 'coast': 'c'}

# The names written on the painting: these tiles take the ground around them. (x, y, w, h) in tiles.
LABELS = [
    (34, 40, 34, 9), (36, 101, 31, 9), (89, 130, 29, 9), (136, 42, 33, 9), (206, 67, 35, 9), (208, 129, 31, 10),
    (161, 148, 35, 9), (31, 177, 43, 10), (107, 178, 40, 10), (134, 207, 37, 10), (200, 198, 37, 9), (42, 212, 41, 9),
]

# The big lands, drawn by hand on the painting (polygons in tiles). Everything else is green land.
VOLCANO = [(0, 0), (100, 0), (98, 14), (88, 28), (80, 40), (72, 52), (66, 62), (56, 66), (0, 66)]
SNOW = [(118, 0), (222, 0), (222, 40), (214, 58), (180, 62), (150, 60), (120, 62), (118, 40)]
DESERT = [(0, 128), (70, 128), (100, 140), (106, 175), (96, 205), (84, 232), (60, 238), (0, 236)]

# The moat of the demon island: a line of water around it (only one bridge crosses it, see data/zones.js).
MOAT = [(0, 68), (30, 69), (58, 68), (68, 60), (75, 48), (83, 35), (92, 22), (101, 10), (104, 0)]
MOAT_WIDTH = 4


# ---------- Reading the painting ----------

def pixel_masks(image):
    """What each pixel of the painting looks like: { name: True/False for each pixel }."""
    r, g, b = image[..., 0], image[..., 1], image[..., 2]
    brightest, darkest = image.max(axis=2), image.min(axis=2)
    water = (b > r + 40) & (b > g + 15) & (b > 90) & (darkest < 140)
    return {
        'water': water,
        'snow': (darkest > 130) & ~water,
        'lava': (r > 190) & (r - g > 70) & (b < 90),
        'tan': (r > 150) & (r - b > 70) & (g > 100) & (r > g),  # roads, sand
        'brown': (r > 80) & (r < 160) & (r - b > 40) & (g < r - 15) & (brightest < 170),  # rocks of the desert, bridges
        'green': (g > r + 5) & (g > b + 5) & ~water,
        'dark': (brightest < 75) & ~water,  # the shadows of the trees and the mountains
        'gray': (brightest - darkest < 35) & (brightest > 70) & (brightest < 200),  # stones, ruins
    }


def tile_fractions(masks, width):
    """For each tile, the part of its pixels (0 to 1) that looks like each thing."""
    fractions = {}
    for name, mask in masks.items():
        small = Image.fromarray((mask * 255).astype(np.uint8)).resize((SIZE, SIZE), Image.BOX)
        fractions[name] = np.array(small).astype(float) / 255
    return fractions


def inside_polygon(points):
    """True for the tiles inside a polygon (the middle of the tile counts)."""
    from matplotlib.path import Path as Shape  # only here: the rest of the tool does not need it
    ys, xs = np.mgrid[0:SIZE, 0:SIZE]
    centers = np.stack([xs.ravel() + 0.5, ys.ravel() + 0.5], axis=1)
    return Shape(points).contains_points(centers).reshape(SIZE, SIZE)


def noise(salt):
    """A random number per tile, always the same (the world is the same at each build)."""
    return np.random.default_rng(salt).random((SIZE, SIZE))


def hide_labels(fractions):
    """The tiles under the written names copy the closest tile outside of them."""
    hidden = np.zeros((SIZE, SIZE), dtype=bool)
    for x, y, w, h in LABELS:
        hidden[y : y + h, x : x + w] = True
    _, (near_y, near_x) = ndimage.distance_transform_edt(hidden, return_indices=True)
    for name in fractions:
        fractions[name] = fractions[name][near_y, near_x]


# ---------- Deciding the ground ----------

def draw_line(mask, points, width):
    """Marks the tiles along a line of points, `width` tiles wide."""
    for (x0, y0), (x1, y1) in zip(points, points[1:]):
        steps = int(max(abs(x1 - x0), abs(y1 - y0)) * 2) + 1
        for i in range(steps + 1):
            x = x0 + (x1 - x0) * i / steps
            y = y0 + (y1 - y0) * i / steps
            for dy in range(-width // 2, width - width // 2):
                for dx in range(-width // 2, width - width // 2):
                    tx, ty = int(round(x)) + dx, int(round(y)) + dy
                    if 0 <= tx < SIZE and 0 <= ty < SIZE:
                        mask[ty, tx] = True


def decide(fractions):
    """The ground and the land of every tile: two arrays of words."""
    f = fractions
    soft = lambda name: ndimage.gaussian_filter(f[name], 2.5)  # the color of the place around the tile
    volcano = inside_polygon(VOLCANO)
    snow_land = inside_polygon(SNOW) & (soft('snow') + soft('gray') > 0.2)
    desert = inside_polygon(DESERT) & (soft('tan') + soft('brown') > 0.3)
    water = f['water'] > 0.5
    water = ndimage.binary_opening(water, iterations=1) | (f['water'] > 0.8)  # no lonely blue pixel, keep thin rivers
    moat = np.zeros((SIZE, SIZE), dtype=bool)
    draw_line(moat, MOAT, MOAT_WIDTH)
    water |= moat
    near_water = ndimage.binary_dilation(water, iterations=2)
    path = (f['tan'] > 0.22) & ~desert & ~volcano & ~snow_land & ~water
    path = ndimage.binary_closing(path, iterations=1) & ~water
    near_path = ndimage.binary_dilation(path, iterations=1)
    rand, rand2 = noise(1), noise(2)

    ground = np.full((SIZE, SIZE), 'grass', dtype=object)
    biome = np.full((SIZE, SIZE), 'meadow', dtype=object)

    # The green lands: forests where the painting is dark, meadows where it is bright, beaches on the shores.
    forest = (f['dark'] + f['green'] * 0.3) > 0.42
    biome[forest] = 'forest'
    trees = (forest & (rand < 0.55)) | (~forest & (f['dark'] > 0.22) & (rand < 0.25)) | (rand < 0.02)
    ground[trees] = 'tree'
    ground[(f['gray'] > 0.45) & (rand2 < 0.5)] = 'rock'
    ground[(ground == 'grass') & (rand2 > 0.93)] = 'flower'
    beach = (f['tan'] > 0.35) & near_water & ~path
    ground[beach] = 'sand'
    biome[beach | (near_water & (f['tan'] > 0.2))] = 'coast'

    # The desert: sand, the brown rocks of the mesas (cliffs), cacti where the painting is green.
    ground[desert] = 'sand'
    biome[desert] = 'desert'
    ground[desert & (f['brown'] > 0.45)] = 'cliff'
    ground[desert & (f['green'] > 0.2) & (rand < 0.5)] = 'tree'  # a cactus (a tree of the desert)
    ground[desert & (f['dark'] > 0.5) & (rand < 0.6)] = 'rock'

    # The snow: white ground, pines, and the mountains (cliffs) where the painting is dark gray.
    ground[snow_land] = 'snow'
    biome[snow_land] = 'mountain'
    ground[snow_land & (f['green'] > 0.25) & (rand < 0.55)] = 'tree'  # a pine
    ground[snow_land & (f['dark'] > 0.35) & (f['green'] < 0.2)] = 'cliff'
    ground[snow_land & (f['gray'] > 0.4) & (rand2 < 0.4)] = 'rock'

    # The demon island: ash, lava (a lot of it), black rocks, dead trees.
    ground[volcano] = 'ash'
    biome[volcano] = 'demon'
    ground[volcano & (f['dark'] > 0.55) & (rand < 0.45)] = 'cliff'
    ground[volcano & (f['lava'] > 0.12)] = 'lava'
    ground[volcano & (f['green'] > 0.3) & (rand < 0.3)] = 'deadTree'
    ground[volcano & (rand2 > 0.96)] = 'lava'  # small lava pools everywhere

    ground[path] = 'path'
    ground[near_path & ~path & np.isin(ground, ['tree', 'rock', 'cliff'])] = 'grass'  # nothing blocks a road
    ground[water] = 'water'
    bridge = (f['brown'] + f['tan'] > 0.35) & water & ~moat & ndimage.binary_dilation(path, iterations=2)
    ground[bridge] = 'bridge'
    return ground, biome


# ---------- Checking that everything can be reached ----------

WALKABLE = ['grass', 'flower', 'path', 'bridge', 'sand', 'snow', 'ash']


def connect_lands(ground):
    """The big pieces of land that can not be reached from the middle of the world get a bridge to it
    (the shortest straight crossing of water, up to 9 tiles). The islands far in the sea stay islands."""
    for _ in range(12):
        walkable = np.isin(ground, WALKABLE)
        labels, count = ndimage.label(walkable)
        main = labels[125, 100]  # Eldermoor
        sizes = ndimage.sum(walkable, labels, range(1, count + 1))
        lonely = [i + 1 for i in range(count) if sizes[i] > 400 and i + 1 != main]
        if not lonely:
            return
        for piece in lonely:
            best = None
            ys, xs = np.where(labels == piece)
            for x, y in zip(xs[::3], ys[::3]):
                for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    for length in range(1, 10):
                        tx, ty = x + dx * length, y + dy * length
                        if not (0 <= tx < SIZE and 0 <= ty < SIZE):
                            break
                        if labels[ty, tx] == main:
                            if best is None or length < best[0]:
                                best = (length, x, y, dx, dy)
                            break
                        if ground[ty, tx] not in ('water', 'tree', 'rock', 'cliff', 'deadTree'):
                            break
            if best:
                length, x, y, dx, dy = best
                for i in range(1, length):
                    tx, ty = x + dx * i, y + dy * i
                    ground[ty, tx] = 'bridge' if ground[ty, tx] == 'water' else 'path'


# ---------- Writing ----------

def compressed(rows):
    """'g12w3...' for each row (a letter and how many times), the rows separated by '|'."""
    parts = []
    for row in rows:
        text = []
        letter, count = row[0], 0
        for item in row:
            if item == letter:
                count += 1
            else:
                text.append(letter + str(count))
                letter, count = item, 1
        text.append(letter + str(count))
        parts.append(''.join(text))
    return '|'.join(parts)


PREVIEW_COLORS = {
    'water': (40, 100, 200), 'grass': (90, 170, 70), 'flower': (200, 200, 90), 'path': (200, 160, 100),
    'bridge': (140, 80, 30), 'sand': (230, 200, 130), 'tree': (30, 90, 40), 'rock': (120, 120, 120),
    'snow': (240, 245, 255), 'ash': (80, 64, 76), 'lava': (255, 100, 20), 'deadTree': (60, 40, 30), 'cliff': (70, 60, 70),
}


def main(preview_path):
    image = np.array(Image.open(MAP).convert('RGB')).astype(int)
    fractions = tile_fractions(pixel_masks(image), image.shape[1])
    hide_labels(fractions)
    ground, biome = decide(fractions)
    connect_lands(ground)
    letters_ground = [[GROUND[item] for item in row] for row in ground]
    letters_biome = [[BIOME[item] for item in row] for row in biome]
    OUT.write_text(
        '// Made by tools/build_world.py from art/MAP.png: do not change by hand.\n'
        '// One row per line of tiles, separated by |. Each part: a letter and how many tiles have it.\n'
        '// GROUND letters: see GROUND_LETTERS in world/map.js. BIOME letters: see BIOME_LETTERS.\n'
        f'export const TERRAIN_SIZE = {SIZE};\n'
        f"export const GROUND_TEXT = '{compressed(letters_ground)}';\n"
        f"export const BIOME_TEXT = '{compressed(letters_biome)}';\n"
    )
    PAINTING.parent.mkdir(parents=True, exist_ok=True)
    Image.open(MAP).convert('RGB').save(PAINTING, quality=88)
    if preview_path:
        preview = np.array([[PREVIEW_COLORS[item] for item in row] for row in ground], dtype=np.uint8)
        Image.fromarray(preview).resize((SIZE * 3, SIZE * 3), Image.NEAREST).save(preview_path)
    print('world', SIZE, 'x', SIZE, '·', OUT.stat().st_size // 1024, 'KB')


if __name__ == '__main__':
    import sys
    main(sys.argv[1] if len(sys.argv) > 1 else None)
