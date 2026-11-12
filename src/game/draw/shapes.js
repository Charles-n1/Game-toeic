// Small helpers to draw on a canvas. Every drawing of the game is made of these simple shapes.

export function rect(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

export function circle(ctx, x, y, radius, color) {
  ellipse(ctx, x, y, radius, radius, color);
}

export function ellipse(ctx, x, y, radiusX, radiusY, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, radiusX, radiusY, 0, 0, Math.PI * 2);
  ctx.fill();
}

export function triangle(ctx, x1, y1, x2, y2, x3, y3, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.lineTo(x3, y3);
  ctx.fill();
}

export function roundRect(ctx, x, y, w, h, radius, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, radius);
  ctx.fill();
}

export function line(ctx, x1, y1, x2, y2, color, width = 1) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

// A text centered on x. An emoji is a text too.
export function text(ctx, value, x, y, size, color = '#ffffff') {
  ctx.font = 'bold ' + size + 'px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = color;
  ctx.fillText(value, x, y);
}

// The same text with a dark edge: readable on any ground.
export function outlinedText(ctx, value, x, y, size, color = '#ffffff') {
  ctx.font = 'bold ' + size + 'px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineWidth = 3;
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.75)';
  ctx.strokeText(value, x, y);
  ctx.fillStyle = color;
  ctx.fillText(value, x, y);
}

// '#ff8800' -> a darker (amount < 0) or lighter (amount > 0) version. amount: from -1 to 1.
export function shade(color, amount) {
  const value = parseInt(color.slice(1), 16);
  const target = amount < 0 ? 0 : 255;
  const mix = Math.abs(amount);
  const red = Math.round(((value >> 16) & 255) * (1 - mix) + target * mix);
  const green = Math.round(((value >> 8) & 255) * (1 - mix) + target * mix);
  const blue = Math.round((value & 255) * (1 - mix) + target * mix);
  return 'rgb(' + red + ',' + green + ',' + blue + ')';
}
