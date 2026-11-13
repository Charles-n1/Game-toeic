import { iconUrl } from '../draw/icons';

// A small pixel picture of the menus (an item, a type, a power...). size: in screen pixels (28 = 2 times bigger).
export default function PixelIcon({ name, size = 28 }) {
  return <img src={iconUrl(name)} width={size} height={size} alt="" style={styles.icon} />;
}

const styles = {
  icon: {
    flexShrink: 0,
  },
};
