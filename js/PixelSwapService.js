export default class PixelSwapService {
  swapExact(pixelData, x1, y1, x2, y2) {
    if (x1 === x2 && y1 === y2) return false;
    const c1 = pixelData.colorAt(x1, y1);
    const c2 = pixelData.colorAt(x2, y2);
    if (c1 === c2) return false;
    pixelData.setColorAt(x1, y1, c2);
    pixelData.setColorAt(x2, y2, c1);
    return true;
  }

  swap(pixelData, selectedHex, targetX, targetY) {
    const targetHex = pixelData.colorAt(targetX, targetY);
    if (targetHex === selectedHex) return false;

    const candidates = [];
    for (let i = 0; i < pixelData.pixels.length; i++) {
      if (pixelData.pixels[i] === selectedHex) candidates.push(i);
    }
    if (candidates.length === 0) return false;

    const randomIndex = candidates[Math.floor(Math.random() * candidates.length)];
    const { x: rx, y: ry } = pixelData.coordsOf(randomIndex);

    pixelData.setColorAt(targetX, targetY, selectedHex);
    pixelData.setColorAt(rx, ry, targetHex);
    return true;
  }

  bucketSwap(pixelData, selectedHex, clickedHex) {
    if (selectedHex === clickedHex) return false;

    const selectedIndices = [];
    const clickedIndices = [];
    for (let i = 0; i < pixelData.pixels.length; i++) {
      const c = pixelData.pixels[i];
      if (c === selectedHex) selectedIndices.push(i);
      else if (c === clickedHex) clickedIndices.push(i);
    }

    const count = Math.min(selectedIndices.length, clickedIndices.length);
    if (count === 0) return false;

    this.shuffle(selectedIndices);
    this.shuffle(clickedIndices);

    for (let i = 0; i < count; i++) {
      const { x: sx, y: sy } = pixelData.coordsOf(selectedIndices[i]);
      const { x: cx, y: cy } = pixelData.coordsOf(clickedIndices[i]);
      pixelData.setColorAt(sx, sy, clickedHex);
      pixelData.setColorAt(cx, cy, selectedHex);
    }
    return true;
  }

  shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }
}
