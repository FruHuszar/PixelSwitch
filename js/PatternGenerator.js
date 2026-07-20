export default class PatternGenerator {
  generate(pixelData, pattern) {
    const slots = [];
    const counts = new Map();
    let sumX = 0;
    let sumY = 0;

    for (let y = 0; y < pixelData.height; y++) {
      for (let x = 0; x < pixelData.width; x++) {
        const hex = pixelData.colorAt(x, y);
        if (hex === 'transparent') continue;
        slots.push({ x, y });
        counts.set(hex, (counts.get(hex) || 0) + 1);
        sumX += x;
        sumY += y;
      }
    }

    if (slots.length === 0) return false;

    const geometry = {
      width: pixelData.width,
      height: pixelData.height,
      centerX: sumX / slots.length,
      centerY: sumY / slots.length
    };

    const ordered = pattern.order(slots, geometry);
    const entries = [...counts.entries()];
    const colors = pattern.colorOrder === 'gradient' ? this.#gradientOrder(entries) : this.#shuffle(entries);

    let k = 0;
    for (const [hex, count] of colors) {
      for (let i = 0; i < count; i++) {
        const slot = ordered[k++];
        pixelData.setColorAt(slot.x, slot.y, hex);
      }
    }
    return true;
  }

  #gradientOrder(entries) {
    return [...entries].sort((a, b) => this.#hueKey(a[0]) - this.#hueKey(b[0]));
  }

  #hueKey(hex) {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;
    const lightness = (max + min) / 2;
    if (delta < 0.04) return lightness * 0.999;
    let hue;
    if (max === r) hue = ((g - b) / delta) % 6;
    else if (max === g) hue = (b - r) / delta + 2;
    else hue = (r - g) / delta + 4;
    hue /= 6;
    if (hue < 0) hue += 1;
    return 1 + hue + lightness * 0.0001;
  }

  #shuffle(entries) {
    const arr = [...entries];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
}
