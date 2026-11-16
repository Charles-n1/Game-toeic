"""Cuts the extra sprites from the character sheets (art/Characters/*.png):
  1. Expressions (7 busts per sheet: joy, sadness, anger, fear, surprise, love, disgust)
  2. Equipment items (weapons, armors, accessories from the EQUIPMENT panel)
  3. Combat & magic effects (4 tiers per character from EFFECTS / CASTING panels)

Writes:
  src/game/assets/characters/expressions-atlas.png   all 105 expression busts (64x64 RGBA)
  src/game/assets/characters/expressionFrames.js     EXPRESSION_FRAMES
  src/game/assets/characters/gear-atlas.png          all equipment icons (24x24 RGBA, #1c1726 outline)
  src/game/assets/characters/gearFrames.js           GEAR_FRAMES
  src/game/assets/characters/effects-atlas.png       4 effect tiers per character (RGBA)
  src/game/assets/characters/effectFrames.js         EFFECT_FRAMES

Run: python3 tools/cut_character_extras.py
Needs: Pillow, numpy, scipy.
"""

from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = Path(__file__).resolve().parent.parent
SHEETS = ROOT / 'art' / 'Characters'
OUT = ROOT / 'src' / 'game' / 'assets' / 'characters'

OUTLINE = (28, 23, 38, 255)  # matches tools/cut_characters.py
EXPRESSION_SIZE = 64
GEAR_SIZE = 24
CHARACTER_HEIGHT = 38  # target character sprite height in game pixels (used for relative scaling)

EXPRESSION_NAMES = ['joy', 'sadness', 'anger', 'fear', 'surprise', 'love', 'disgust']

# All 15 character sheets (14 NPCs from cut_characters.py + hero).
CHARACTER_SHEETS = {
    'hero': 'Hero.png',
    'luna': 'Luna (mage).png',
    'selene': 'Selene (arcanist).png',
    'elara': 'Elara (witch heal).png',
    'darius': 'Darius (smith).png',
    'dorian': 'Darius (brigand).png',
    'arthur': 'Arthur (knight).png',
    'lyra': 'Lyra (paladin).png',
    'hinata': 'Hinata (samurai).png',
    'kaelthra': 'Kaelthra (runeblade).png',
    'lucien': 'Lucien (puppeter).png',
    'sylvia': 'Sylvia (druid rare).png',
    'vespera': 'Vespera (necromancer).png',
    'corvin': '? (plague doctor).png',
    'kael': 'Kael (beastmaster).png',
}


# ---------- Shared pixel helpers ----------

def trim_rgba(picture):
    """Removes fully transparent rows and columns around an RGBA array."""
    alpha = picture[:, :, 3] > 0
    if not alpha.any():
        return picture
    rows = np.where(alpha.any(axis=1))[0]
    cols = np.where(alpha.any(axis=0))[0]
    return picture[rows.min() : rows.max() + 1, cols.min() : cols.max() + 1]


def shrink_crisp(piece, target_w, target_h, alpha_cutoff=110):
    """Scales an RGBA array using BOX filtering with premultiplied alpha and snaps alpha to 0/255."""
    alpha = piece[:, :, 3:4] / 255.0
    premul = np.concatenate([piece[:, :, :3] * alpha, piece[:, :, 3:4]], axis=2).astype(np.uint8)
    small = np.array(Image.fromarray(premul, 'RGBA').resize((max(1, target_w), max(1, target_h)), Image.BOX)).astype(float)
    a = small[:, :, 3:4] / 255.0
    colors = np.where(a > 0, small[:, :, :3] / np.maximum(a, 1e-6), 0)
    result = np.zeros_like(small)
    result[:, :, :3] = np.clip(colors, 0, 255)
    result[:, :, 3] = np.where(small[:, :, 3] >= alpha_cutoff, 255, 0)
    return result.astype(np.uint8)


def shrink_soft(piece, target_w, target_h):
    """Scales a glowing RGBA effect sprite with premultiplied BOX filtering, keeping smooth alpha."""
    alpha = piece[:, :, 3:4] / 255.0
    premul = np.concatenate([piece[:, :, :3] * alpha, piece[:, :, 3:4]], axis=2).astype(np.uint8)
    small = np.array(Image.fromarray(premul, 'RGBA').resize((max(1, target_w), max(1, target_h)), Image.BOX)).astype(float)
    a = small[:, :, 3:4] / 255.0
    colors = np.where(a > 0, small[:, :, :3] / np.maximum(a, 1e-6), 0)
    result = np.zeros_like(small)
    result[:, :, :3] = np.clip(colors, 0, 255)
    result[:, :, 3] = np.clip(small[:, :, 3], 0, 255)
    return result.astype(np.uint8)


def add_outline(picture):
    """Adds a 1px dark outline (#1c1726) around opaque pixels."""
    opaque = picture[:, :, 3] > 0
    padded = np.zeros((picture.shape[0] + 2, picture.shape[1] + 2, 4), dtype=np.uint8)
    padded[1:-1, 1:-1] = picture
    inside = np.zeros(padded.shape[:2], dtype=bool)
    inside[1:-1, 1:-1] = opaque
    edge = ndimage.binary_dilation(inside, structure=[[0, 1, 0], [1, 1, 1], [0, 1, 0]]) & ~inside
    padded[edge] = OUTLINE
    return padded


def fit_square(picture, size, align_bottom=False):
    """Centers an RGBA sprite on a square transparent canvas of `size x size`."""
    canvas = np.zeros((size, size, 4), dtype=np.uint8)
    h, w = picture.shape[:2]
    if h > size or w > size:
        scale = min(size / w, size / h)
        nw, nh = max(1, round(w * scale)), max(1, round(h * scale))
        picture = shrink_crisp(picture, nw, nh)
        h, w = picture.shape[:2]
    x = (size - w) // 2
    y = (size - h) if align_bottom else (size - h) // 2
    canvas[y : y + h, x : x + w] = picture
    return canvas


def remove_bg_floodfill(piece_rgb, bg_hint=None, diff_threshold=12, min_island=12):
    """Removes background connected to the patch border while preserving interior dark details and valid floating marks."""
    piece = piece_rgb.astype(float)
    edge = np.concatenate([piece[0], piece[-1], piece[:, 0], piece[:, -1]])
    ref = np.median(edge, axis=0) if bg_hint is None else bg_hint.astype(float)
    # Use whichever of edge median or panel bg hint is closer to empty edge pixels
    edge_diff = np.abs(edge - ref).sum(axis=1)
    if np.median(edge_diff) > 8:
        ref = np.median(edge, axis=0)

    looks_empty = np.abs(piece - ref).sum(axis=2) < diff_threshold
    labels, _ = ndimage.label(looks_empty)
    border_labels = set(np.unique(np.concatenate([labels[0], labels[-1], labels[:, 0], labels[:, -1]]))) - {0}
    solid = ~np.isin(labels, list(border_labels))

    # Drop tiny 1-11px isolated JPEG/grid specks while keeping hearts, '!', '#', sweat drops, sparks
    comp_lbl, comp_n = ndimage.label(solid, structure=np.ones((3, 3)))
    if comp_n > 0:
        sizes = ndimage.sum(solid, comp_lbl, range(1, comp_n + 1))
        keep = [i + 1 for i, s in enumerate(sizes) if s >= min_island]
        solid = np.isin(comp_lbl, keep)

    out = np.zeros((*piece.shape[:2], 4), dtype=np.uint8)
    out[:, :, :3] = piece_rgb
    out[:, :, 3] = np.where(solid, 255, 0)
    return out


def character_scale_factor(sheet):
    """Estimates the sheet's hero/NPC scale factor (raw standing height / 38) from the DIRECTIONS idle front sprite."""
    piece = sheet[62:168, 560:670, :3].astype(int)
    bg = np.median(piece.reshape(-1, 3), axis=0)
    drawn = np.abs(piece - bg).sum(axis=2) > 50
    rows = np.where(drawn.any(axis=1))[0]
    raw_h = int(rows.max() - rows.min() + 1) if len(rows) > 0 else 95
    return max(2.0, raw_h / CHARACTER_HEIGHT)


def panel_bg(sheet, y0, y1, x0, x1):
    """Robustly estimates the dark background color of a panel from border strips."""
    strips = np.concatenate([sheet[y0:y1, x0 : x0 + 10], sheet[y0:y1, x1 - 10 : x1]], axis=1)
    return np.median(strips.reshape(-1, 3), axis=0)


# ---------- 1. Expressions ----------

def cut_expressions(sheet):
    """Detects and extracts the 7 expression busts (joy..disgust) as 64x64 RGBA PNG arrays."""
    bg = panel_bg(sheet, 530, 640, 14, 456)
    diff = np.abs(sheet.astype(int) - bg).sum(axis=2) > 35
    hlines = [y for y in range(295, 685) if diff[y, 20:440].mean() > 0.85]
    y_top = max([y for y in hlines if y < 340], default=310) + 3
    y_bot = min([y for y in hlines if y > 640], default=660) - 3
    x_left, x_right = 12, 462

    pdiff = np.abs(sheet[y_top:y_bot, x_left:x_right].astype(int) - bg).sum(axis=2) > 32
    # Strip thin full-width horizontal divider lines (present in Hero and Corvin)
    full_rows = pdiff.mean(axis=1) > 0.93
    lbl_d, nd = ndimage.label(full_rows)
    for i in range(1, nd + 1):
        ys = np.where(lbl_d == i)[0]
        if len(ys) <= 4:
            pdiff[max(0, ys.min() - 1) : ys.max() + 2, :] = False

    # The 2 face bands are the two tall horizontal spans (height >= 60px), excluding 13px text labels
    lbl_r, nr = ndimage.label(pdiff.mean(axis=1) > 0.015)
    face_bands = []
    for i in range(1, nr + 1):
        ys = np.where(lbl_r == i)[0]
        if ys.max() - ys.min() + 1 >= 60:
            face_bands.append((int(ys.min()), int(ys.max()) + 1))
    assert len(face_bands) == 2, f'Expected 2 expression face bands, got {face_bands}'

    results = {}
    idx = 0
    for expected, (ry0, ry1) in zip([4, 3], face_bands):
        sub = pdiff[ry0:ry1, :]
        w = sub.shape[1]
        # Use upper head region (12%..42% height) where adjacent shoulders/cloaks/hair never touch
        upper = sub[int(sub.shape[0] * 0.12) : int(sub.shape[0] * 0.42), :]
        col_sum = upper.sum(axis=0)
        splits = [0]
        for k in range(1, expected):
            center = int(round(w * k / expected))
            a = max(0, center - 48)
            b = min(w, center + 48)
            window = col_sum[a:b]
            min_val = window.min()
            # Pick the center of the widest contiguous near-minimum gap so floating '!' or hearts aren't clipped
            gap_lbl, gap_n = ndimage.label(window <= min_val + 1)
            best_pos = a + int(np.argmin(window))
            best_len = -1
            for gi in range(1, gap_n + 1):
                gxs = np.where(gap_lbl == gi)[0]
                if len(gxs) > best_len:
                    best_len = len(gxs)
                    best_pos = a + int(round((gxs.min() + gxs.max()) / 2))
            splits.append(best_pos)
        splits.append(w)

        for k in range(expected):
            sx0, sx1 = splits[k], splits[k + 1]
            px0 = max(0, x_left + sx0)
            px1 = min(sheet.shape[1], x_left + sx1)
            py0 = max(0, y_top + ry0 - 2)
            py1 = min(sheet.shape[0], y_top + ry1 + 2)
            patch = sheet[py0:py1, px0:px1]

            # Remove background via flood fill; tight threshold preserves dark hats/coats (e.g. Corvin)
            rgba = remove_bg_floodfill(patch, bg_hint=bg, diff_threshold=9, min_island=15)
            # Clear out any stray pixels outside the slice's core vertical span if border leaked
            trimmed = trim_rgba(rgba)
            th, tw = trimmed.shape[:2]
            assert th >= 40 and tw >= 40, f'Expression {EXPRESSION_NAMES[idx]} too small: {tw}x{th}'
            scale = min((EXPRESSION_SIZE - 2) / tw, (EXPRESSION_SIZE - 2) / th)
            nw, nh = max(1, round(tw * scale)), max(1, round(th * scale))
            resized = shrink_crisp(trimmed, nw, nh)
            results[EXPRESSION_NAMES[idx]] = fit_square(resized, EXPRESSION_SIZE, align_bottom=True)
            idx += 1

    return results


# ---------- 2. Equipment ----------

def cut_equipment(sheet):
    """Detects and extracts weapons, armors, and accessories from the EQUIPMENT panel."""
    h, w, _ = sheet.shape
    bg = np.median(sheet[15:42, 1400:1515].reshape(-1, 3), axis=0)
    diff = np.abs(sheet.astype(int) - bg).sum(axis=2) > 30
    vlines = [x for x in range(1135, 1160) if diff[20:380, x].mean() > 0.85]
    x_left = max(vlines) + 3 if vlines else 1152
    x_right = min([x for x in range(1520, w) if diff[20:380, x].mean() > 0.85], default=w - 5) - 3
    hlines = [y for y in range(0, 410) if diff[y, 1160 : w - 15].mean() > 0.85]
    y_top = max([y for y in hlines if y < 25], default=9) + 3
    y_bot = min([y for y in hlines if y > 370], default=392) - 3

    panel_rgb = sheet[y_top:y_bot, x_left:x_right]
    panel_diff = np.abs(panel_rgb.astype(int) - bg).sum(axis=2) > 25

    # Remove full-width divider lines
    div_rows = panel_diff.mean(axis=1) > 0.65
    for shift in (-2, -1, 0, 1, 2):
        panel_diff[np.roll(div_rows, shift)] = False

    # Mask top EQUIPMENT header and Hero's red header underline flourish
    panel_diff[: max(0, 48 - y_top), :] = False
    panel_diff[: max(0, 78 - y_top), : max(0, 1255 - x_left)] = False

    # Mask left-aligned ARMORS and ACCESSORIES label text without touching items to the right
    strip = panel_diff[:, :120]
    for band_y0, band_y1, max_w in [(170, 196, 85), (290, 318, 118)]:
        ry0, ry1 = max(0, band_y0 - y_top), min(panel_diff.shape[0], band_y1 - y_top)
        row_act = strip[ry0:ry1, :max_w].mean(axis=1) > 0.05
        lbl, n = ndimage.label(row_act)
        for i in range(1, n + 1):
            ys = np.where(lbl == i)[0]
            if 5 <= (ys.max() - ys.min() + 1) <= 18:
                xs = np.where(strip[ry0 + ys.min() : ry0 + ys.max() + 1, :max_w].any(axis=0))[0]
                if len(xs) > 10 and xs.min() < 35:
                    panel_diff[ry0 + ys.min() - 2 : ry0 + ys.max() + 3, : xs.max() + 4] = False

    # Find horizontal split rows between Weapons / Armors / Accessories
    y_div1 = (160 - y_top) + int(np.argmin(panel_diff[160 - y_top : 195 - y_top].sum(axis=1)))
    y_div2 = (280 - y_top) + int(np.argmin(panel_diff[280 - y_top : 315 - y_top].sum(axis=1)))

    items = {}
    for prefix, r0, r1 in [('w', 0, y_div1), ('a', y_div1, y_div2), ('acc', y_div2, panel_diff.shape[0])]:
        sub = panel_diff[r0:r1, :]
        closed = ndimage.binary_closing(sub, structure=np.ones((3, 3)))
        lbl, n = ndimage.label(closed, structure=np.ones((3, 3)))

        mains = []
        smalls = []
        for i, sl in enumerate(ndimage.find_objects(lbl)):
            if sl is None:
                continue
            comp_mask = lbl == (i + 1)
            area = int((sub[sl] & comp_mask[sl]).sum())
            bw = sl[1].stop - sl[1].start
            bh = sl[0].stop - sl[0].start
            if area >= 650 and bw >= 12 and bh >= 12:
                mains.append((i + 1, sl, area))
            elif area >= 60:
                smalls.append((i + 1, sl, area))

        mains.sort(key=lambda item: item[1][1].start)

        # Attach detached sub-parts (halos, crowns, hat brims, pauldrons) to their nearest parent item
        attached = {idx: [idx] for idx, _, _ in mains}
        for s_idx, s_sl, _ in smalls:
            scx = (s_sl[1].start + s_sl[1].stop) / 2.0
            scy = (s_sl[0].start + s_sl[0].stop) / 2.0
            best_m = None
            best_dist = 1e9
            for m_idx, m_sl, _ in mains:
                dx = max(0.0, m_sl[1].start - scx, scx - m_sl[1].stop)
                dy = max(0.0, m_sl[0].start - scy, scy - m_sl[0].stop)
                dist = (dx * dx + dy * dy) ** 0.5
                if dx <= 12 and dy <= 14 and dist < best_dist:
                    best_dist = dist
                    best_m = m_idx
            if best_m is not None:
                attached[best_m].append(s_idx)

        for item_i, (m_idx, _, _) in enumerate(mains):
            # Build exact label mask for this item (excluding other main items that may overlap its bbox)
            item_mask = np.isin(lbl, attached[m_idx])
            other_mask = np.isin(lbl, [o_idx for o_idx, _, _ in mains if o_idx != m_idx])
            ys, xs = np.where(item_mask)
            pad = 4
            by0 = max(0, int(ys.min()) - pad)
            by1 = min(sub.shape[0], int(ys.max()) + 1 + pad)
            bx0 = max(0, int(xs.min()) - pad)
            bx1 = min(sub.shape[1], int(xs.max()) + 1 + pad)

            patch_rgb = panel_rgb[r0 + by0 : r0 + by1, bx0:bx1].copy()
            # Keep only foreground pixels belonging to this item (dilated 2px for crisp original edges)
            local_keep = ndimage.binary_dilation(item_mask[by0:by1, bx0:bx1], structure=np.ones((5, 5)))
            local_other = other_mask[by0:by1, bx0:bx1] & ~local_keep
            # Neutralize pixels from overlapping neighbor components to background color
            patch_rgb[local_other] = bg.astype(np.uint8)

            rgba = remove_bg_floodfill(patch_rgb, bg_hint=bg, diff_threshold=14, min_island=8)
            # Also zero out any remaining neighbor pixels that slipped past dilation
            rgba[:, :, 3] = np.where(local_other, 0, rgba[:, :, 3])
            trimmed = trim_rgba(rgba)

            th, tw = trimmed.shape[:2]
            inner_max = GEAR_SIZE - 2  # leave 1px all around for dark #1c1726 outline
            scale = min(inner_max / tw, inner_max / th)
            nw, nh = max(1, round(tw * scale)), max(1, round(th * scale))
            shrunk = shrink_crisp(trimmed, nw, nh)
            outlined = add_outline(trim_rgba(shrunk))
            items[f'{prefix}{item_i}'] = fit_square(outlined, GEAR_SIZE, align_bottom=False)

    return items


# ---------- 3. Effects ----------

def _rgba_effect_patch(patch_rgb, bg):
    """Converts a dark-background glowing effect patch into smooth-alpha RGBA."""
    rgb = patch_rgb.astype(float)
    diff = np.abs(rgb - bg).sum(axis=2)
    # Remove panel background cleanly, fade glow edges smoothly, keep core opaque
    alpha = np.clip((diff - 14.0) / 30.0, 0.0, 1.0)
    # Un-mix dark navy background tint from glowing semi-transparent border pixels
    bright_rgb = np.where(alpha[:, :, None] > 0.05, (rgb - bg * (1.0 - alpha[:, :, None])) / np.maximum(alpha[:, :, None], 0.05), 0.0)
    out = np.zeros((*patch_rgb.shape[:2], 4), dtype=np.uint8)
    out[:, :, :3] = np.clip(bright_rgb, 0, 255).astype(np.uint8)
    out[:, :, 3] = np.round(alpha * 255).astype(np.uint8)
    return out


def _split_wide_cluster(sub_mask, cx, cy, cw, ch):
    """Splits a horizontally merged EFFECTS mega-cluster (>210px wide) at smooth upper-panel column valleys."""
    cs = sub_mask[: int(ch * 0.75)].sum(axis=0)
    smooth = np.convolve(cs, np.ones(9) / 9.0, mode='same')
    cuts = [0]
    if cw > 250:
        m1 = int(cw * 0.18) + int(np.argmin(smooth[int(cw * 0.18) : int(cw * 0.45)]))
        m2 = int(cw * 0.52) + int(np.argmin(smooth[int(cw * 0.52) : int(cw * 0.82)]))
        if m2 - m1 > 45:
            cuts.extend([m1, m2])
        else:
            cuts.append(int(cw * 0.30) + int(np.argmin(smooth[int(cw * 0.30) : int(cw * 0.70)])))
    else:
        cuts.append(int(cw * 0.30) + int(np.argmin(smooth[int(cw * 0.30) : int(cw * 0.70)])))
    cuts.append(cw)

    pieces = []
    for k in range(len(cuts) - 1):
        sx0, sx1 = cuts[k], cuts[k + 1]
        part = sub_mask[:, sx0:sx1]
        ys, xs = np.where(part)
        if len(xs) >= 250:
            x0, x1 = int(xs.min()), int(xs.max()) + 1
            y0, y1 = int(ys.min()), int(ys.max()) + 1
            pieces.append((cx + sx0 + x0, cy + y0, x1 - x0, y1 - y0, len(xs)))
    return pieces


def _extract_casting_sigil(sheet):
    """Returns the standalone right-side CASTING magic circle from ATTACKS & SKILLS if clean, else None."""
    bg_mid = np.median(sheet[415:435, 950:1120].reshape(-1, 3), axis=0)
    cast = np.abs(sheet[910:1010, 480:1138].astype(int) - bg_mid).sum(axis=2) > 35
    closed_c = ndimage.binary_closing(cast, structure=np.ones((5, 5)))
    lbl_c, _ = ndimage.label(closed_c, structure=np.ones((3, 3)))
    cboxes = []
    for i, sl in enumerate(ndimage.find_objects(lbl_c)):
        if sl is None:
            continue
        area = int((cast[sl] & (lbl_c[sl] == i + 1)).sum())
        if area > 400:
            cboxes.append((sl[1].start + 480, sl[0].start + 910, sl[1].stop - sl[1].start, sl[0].stop - sl[0].start, area, bg_mid))
    cboxes.sort(key=lambda c: c[0])
    if len(cboxes) >= 6 and cboxes[-1][0] >= 910:
        return cboxes[-1]
    return None


def _cluster_small_particles(small_boxes, max_gap=18):
    """Merges nearby small petals/stars/crows in EFFECTS into coherent burst groups."""
    groups = []
    for bx, by, bw, bh, barea, bbg in sorted(small_boxes, key=lambda b: b[0]):
        merged = False
        for g in groups:
            gx0, gy0, gx1, gy1, garea, gbg = g
            dx = max(0, gx0 - (bx + bw), bx - gx1)
            dy = max(0, gy0 - (by + bh), by - gy1)
            if dx <= max_gap and dy <= max_gap:
                g[0] = min(gx0, bx)
                g[1] = min(gy0, by)
                g[2] = max(gx1, bx + bw)
                g[3] = max(gy1, by + bh)
                g[4] = garea + barea
                merged = True
                break
        if not merged:
            groups.append([bx, by, bx + bw, by + bh, barea, bbg])
    return [(g[0], g[1], g[2] - g[0], g[3] - g[1], g[4], g[5]) for g in groups if g[4] >= 700]


def cut_effects(sheet, cid):
    """Extracts 4 representative effect sprites (tiers 1..4) from EFFECTS & CASTING panels."""
    h, w, _ = sheet.shape
    bg = np.median(sheet[15:42, 1400:1515].reshape(-1, 3), axis=0)
    diff = np.abs(sheet.astype(int) - bg).sum(axis=2) > 35
    vlines = [x for x in range(1135, 1160) if diff[760:1005, x].mean() > 0.85]
    x_left = max(vlines) + 3 if vlines else 1152
    x_right = min([x for x in range(1520, w) if diff[760:1005, x].mean() > 0.85], default=w - 5) - 3
    hlines = [y for y in range(735, 1020) if diff[y, 1160 : w - 15].mean() > 0.85]
    y_top = max([y for y in hlines if y < 775], default=760) + 3
    y_bot = min([y for y in hlines if y > 1000], default=1014) - 3

    pdiff = np.abs(sheet[y_top:y_bot, x_left:x_right].astype(int) - bg).sum(axis=2) > 40
    pdiff[:32, :105] = False  # mask "EFFECTS" header

    lbl, _ = ndimage.label(pdiff, structure=np.ones((3, 3)))
    large_cands = []
    small_cands = []
    for i, sl in enumerate(ndimage.find_objects(lbl)):
        if sl is None:
            continue
        area = int((pdiff[sl] & (lbl[sl] == i + 1)).sum())
        bw = sl[1].stop - sl[1].start
        bh = sl[0].stop - sl[0].start
        if area >= 1200 and bw >= 22 and bh >= 22:
            if bw > 210:
                sub_mask = pdiff[sl] & (lbl[sl] == i + 1)
                for px, py, pw, ph, parea in _split_wide_cluster(sub_mask, sl[1].start, sl[0].start, bw, bh):
                    large_cands.append((x_left + px, y_top + py, pw, ph, parea, bg))
            else:
                large_cands.append((x_left + sl[1].start, y_top + sl[0].start, bw, bh, area, bg))
        elif area >= 150 and bw >= 12 and bh >= 12:
            small_cands.append((x_left + sl[1].start, y_top + sl[0].start, bw, bh, area, bg))

    # Group scattered petals/stars/crows into coherent particle clusters
    candidates = large_cands + _cluster_small_particles(small_cands)

    # Supplement with standalone CASTING sigil when available (great for Tier 1-2 spell circles!)
    cast = _extract_casting_sigil(sheet)
    if cast is not None and cid in ('hero', 'darius', 'arthur', 'hinata', 'sylvia'):
        candidates.append(cast)
    elif len(candidates) < 4 and cast is not None:
        candidates.append(cast)

    if cid == 'lucien':
        # Use Lucien's clean ATTACK 1 puppet & ATTACK 2 slash instead of sliced puppeteer edges
        bg_mid = np.median(sheet[415:435, 950:1120].reshape(-1, 3), axis=0)
        candidates = [
            c for c in candidates if c[2] < 130 or c[2] > 140  # keep left doll + giant puppeteer
        ]
        # Explicit clean regions from Lucien's EFFECTS & ATTACKS panels:
        # left hanging doll, ATK1 floating puppet, ATK2 spectral slash, giant puppeteer
        candidates = [
            (1165, 816, 34, 118, 1570, bg),
            (1055, 426, 74, 88, 3200, bg_mid),
            (1025, 523, 105, 85, 4500, bg_mid),
            (1235, 777, 200, 227, 24000, bg),
        ]

    # Prefer well-proportioned effects (>= 36px wide/tall) when at least 4 exist
    full_cands = [c for c in candidates if c[2] >= 36 and c[3] >= 30]
    pool = full_cands if len(full_cands) >= 4 else [c for c in candidates if c[2] >= 20 and c[3] >= 20] or candidates
    assert len(pool) >= 4, f'{cid}: only found {len(pool)} effect candidates'

    # Avoid picking two near-identical small particle clusters (e.g. Hinata's twin petal scatters, Sylvia's twin butterflies)
    if cid == 'sylvia':
        # Keep the crisper butterfly + CASTING circle + sapling ring + vine pillar
        pool = [c for c in pool if not (c[2] < 70 and c[3] < 60)]
    if cid == 'hinata':
        # Keep blossom cluster + CASTING kanji circle + torii gate + beam
        pool = [c for c in pool if c[4] >= 1200]

    # Sort by visual bounding area (small/light -> huge/special) and pick 4 spread tiers
    pool_sorted = sorted(pool, key=lambda c: c[2] * c[3])
    if len(pool_sorted) > 4:
        indices = [0, len(pool_sorted) // 3, (2 * len(pool_sorted)) // 3, len(pool_sorted) - 1]
        chosen = [pool_sorted[idx] for idx in indices]
    else:
        chosen = pool_sorted

    factor = character_scale_factor(sheet)
    tier_max_dim = {1: 26, 2: 34, 3: 44, 4: 56}
    effects = {}
    for tier, (ex, ey, ew, eh, _, eff_bg) in enumerate(chosen, start=1):
        pad = 2
        patch = sheet[max(0, ey - pad) : min(h, ey + eh + pad), max(0, ex - pad) : min(w, ex + ew + pad)]
        rgba = trim_rgba(_rgba_effect_patch(patch, eff_bg))
        rh, rw = rgba.shape[:2]
        scale = min(1.0 / factor, tier_max_dim[tier] / max(rw, rh))
        nw, nh = max(6, round(rw * scale)), max(6, round(rh * scale))
        shrunk = trim_rgba(shrink_soft(rgba, nw, nh))
        effects[tier] = shrunk

    return effects


# ---------- Packing & JS emission ----------

def pack(pictures, max_width=512):
    """Packs { key: RGBA array } row-by-row with 1px gutters."""
    x = y = row_height = 0
    places = {}
    for key, picture in pictures.items():
        h, w = picture.shape[:2]
        if x + w > max_width:
            x, y, row_height = 0, y + row_height + 1, 0
        places[key] = (x, y, w, h)
        x += w + 1
        row_height = max(row_height, h)
    atlas = np.zeros((max(1, y + row_height), max_width, 4), dtype=np.uint8)
    for key, picture in pictures.items():
        px, py, w, h = places[key]
        atlas[py : py + h, px : px + w] = picture
    return atlas, places


def write_expressions_js(places):
    lines = [
        '// Made by tools/cut_character_extras.py from art/Characters/*.png: do not change by hand.',
        '// character -> expression -> [x, y, width, height] in expressions-atlas.png.',
        'export const EXPRESSION_FRAMES = {',
    ]
    for cid in CHARACTER_SHEETS:
        lines.append(f'  {cid}: {{')
        for expr in EXPRESSION_NAMES:
            x, y, w, h = places[(cid, expr)]
            lines.append(f'    {expr}: [{x}, {y}, {w}, {h}],')
        lines.append('  },')
    lines.append('};')
    (OUT / 'expressionFrames.js').write_text('\n'.join(lines) + '\n')


def write_gear_js(places):
    lines = [
        '// Made by tools/cut_character_extras.py from art/Characters/*.png: do not change by hand.',
        '// gearKey -> [x, y, width, height] in gear-atlas.png.',
        'export const GEAR_FRAMES = {',
    ]
    for key, (x, y, w, h) in places.items():
        lines.append(f"  '{key}': [{x}, {y}, {w}, {h}],")
    lines.append('};')
    (OUT / 'gearFrames.js').write_text('\n'.join(lines) + '\n')


def write_effects_js(places):
    lines = [
        '// Made by tools/cut_character_extras.py from art/Characters/*.png: do not change by hand.',
        '// character -> tier (1..4) -> [x, y, width, height] in effects-atlas.png.',
        'export const EFFECT_FRAMES = {',
    ]
    for cid in CHARACTER_SHEETS:
        lines.append(f'  {cid}: {{')
        for tier in (1, 2, 3, 4):
            x, y, w, h = places[(cid, tier)]
            lines.append(f'    {tier}: [{x}, {y}, {w}, {h}],')
        lines.append('  },')
    lines.append('};')
    (OUT / 'effectFrames.js').write_text('\n'.join(lines) + '\n')


def verify_non_empty(name, pictures):
    for key, arr in pictures.items():
        assert arr.ndim == 3 and arr.shape[2] == 4, f'{name} {key}: invalid shape {arr.shape}'
        opaque = int((arr[:, :, 3] > 20).sum())
        assert opaque >= 15, f'{name} {key}: nearly empty sprite ({opaque} visible pixels)'


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    all_expressions = {}
    all_gear = {}
    all_effects = {}

    for cid, fname in CHARACTER_SHEETS.items():
        sheet = np.array(Image.open(SHEETS / fname).convert('RGB'))

        exprs = cut_expressions(sheet)
        assert len(exprs) == 7, f'{cid}: expected 7 expressions, got {len(exprs)}'
        for expr_name, img in exprs.items():
            all_expressions[(cid, expr_name)] = img

        gear = cut_equipment(sheet)
        assert len(gear) >= 9, f'{cid}: expected >= 9 gear items, got {len(gear)}'
        for gkey, img in gear.items():
            all_gear[f'{cid}_{gkey}'] = img

        effects = cut_effects(sheet, cid)
        assert len(effects) == 4, f'{cid}: expected 4 effects, got {len(effects)}'
        for tier, img in effects.items():
            all_effects[(cid, tier)] = img

        print(f'{cid:9s} exprs={len(exprs)} gear={len(gear):2d} effects={len(effects)} ({[effects[t].shape[:2][::-1] for t in (1, 2, 3, 4)]})')

    verify_non_empty('expression', all_expressions)
    verify_non_empty('gear', all_gear)
    verify_non_empty('effect', all_effects)

    expr_atlas, expr_places = pack(all_expressions, max_width=455)
    Image.fromarray(expr_atlas, 'RGBA').save(OUT / 'expressions-atlas.png')
    write_expressions_js(expr_places)

    gear_atlas, gear_places = pack(all_gear, max_width=512)
    Image.fromarray(gear_atlas, 'RGBA').save(OUT / 'gear-atlas.png')
    write_gear_js(gear_places)

    eff_atlas, eff_places = pack(all_effects, max_width=512)
    Image.fromarray(eff_atlas, 'RGBA').save(OUT / 'effects-atlas.png')
    write_effects_js(eff_places)

    print(f'Saved expressions-atlas.png {expr_atlas.shape[1]}x{expr_atlas.shape[0]} ({len(all_expressions)} sprites)')
    print(f'Saved gear-atlas.png {gear_atlas.shape[1]}x{gear_atlas.shape[0]} ({len(all_gear)} sprites)')
    print(f'Saved effects-atlas.png {eff_atlas.shape[1]}x{eff_atlas.shape[0]} ({len(all_effects)} sprites)')


if __name__ == '__main__':
    main()
