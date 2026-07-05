import PixelData from './PixelData.js';

export default class PixelDataFactory {
  fromImageData(imageData) {
    const { width, height, data } = imageData;
    const pixels = new Array(width * height);
    for (let i = 0; i < pixels.length; i++) {
      const o = i * 4;
      const a = data[o + 3];
      if (a === 0) {
        pixels[i] = 'transparent';
        continue;
      }
      const r = data[o];
      const g = data[o + 1];
      const b = data[o + 2];
      pixels[i] = this.rgbToHex(r, g, b);
    }
    return new PixelData(width, height, pixels);
  }

  rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(c => c.toString(16).padStart(2, '0')).join('');
  }
}
