// On the web, there is no file system: the photo is saved as TEXT (a "data URL")
// in the browser storage. The storage is small (~5 MB), so we shrink the photo first.
const MAX_SIDE = 1080; // pixels: enough for a phone screen
const MAX_LENGTH = 3000000; // characters (~2 MB)

// 🔒 Security: we only accept "data:image/jpeg;base64," + base64 letters, nothing else.
// This text goes inside CSS (background-image: url(...)): a modified save could
// otherwise inject CSS (a quote or a parenthesis would close the url).
const SAFE_WALLPAPER = /^data:image\/jpeg;base64,[A-Za-z0-9+/]+=*$/;

export function isSafeWallpaper(value) {
  return typeof value === 'string' && value.length <= MAX_LENGTH && SAFE_WALLPAPER.test(value);
}

// The image -> a small JPEG, as text. Throws an error if it can't.
function shrink(image) {
  const scale = Math.min(1, MAX_SIDE / Math.max(image.width, image.height));
  const canvas = document.createElement('canvas'); // an invisible drawing sheet
  canvas.width = Math.round(image.width * scale);
  canvas.height = Math.round(image.height * scale);
  canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
  const wallpaper = canvas.toDataURL('image/jpeg', 0.8); // quality 80%
  // 🔒 The SAME check as when the save is read. Else a broken result ("data:," for an image of size 0)
  // would be saved, then refused after a reload... and the theme with it.
  if (!isSafeWallpaper(wallpaper)) throw new Error('this image cannot be a wallpaper');
  return wallpaper;
}

// The file chosen by the user -> a small JPEG, as text.
// 🔒 Not a real photo (a text file renamed "photo.jpg", an SVG with a web page inside...): it fails (reject).
export function photoToWallpaper(file) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      try {
        resolve(shrink(image));
      } catch (error) {
        reject(error);
      }
      URL.revokeObjectURL(image.src);
    };
    image.onerror = () => {
      URL.revokeObjectURL(image.src);
      reject(new Error('this file is not an image'));
    };
    image.src = URL.createObjectURL(file);
  });
}
