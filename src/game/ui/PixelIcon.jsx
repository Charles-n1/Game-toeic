import { iconUrl } from '../draw/icons';
import { ITEMS } from '../data/items';
import { hasGearIcon, gearIconUrl } from '../draw/gearArt';

const KIND_FALLBACK = { weapon: 'ironSword', armor: 'chainMail', boots: 'windBoots', accessory: 'ring' };

// A small pixel picture of the menus (an item, a type, a power...). size: in screen pixels (28 = 2 times bigger).
export default function PixelIcon({ name, size = 28 }) {
  const item = ITEMS[name];
  const gear = item?.gearIcon;
  const fallback = item && KIND_FALLBACK[item.kind] ? KIND_FALLBACK[item.kind] : name;
  const src = (gear && hasGearIcon(gear) && gearIconUrl(gear)) || iconUrl(fallback);
  return <img src={src} width={size} height={size} alt="" style={{ ...styles.icon, imageRendering: 'pixelated', objectFit: 'contain' }} />;
}

const styles = {
  icon: {
    flexShrink: 0,
  },
};
