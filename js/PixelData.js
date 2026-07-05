export default class PixelData {
  constructor(width, height, pixels) {
    this.width = width;
    this.height = height;
    this.pixels = pixels;
  }

  indexOf(x, y) {
    return y * this.width + x;
  }

  colorAt(x, y) {
    return this.pixels[this.indexOf(x, y)];
  }

  setColorAt(x, y, hex) {
    this.pixels[this.indexOf(x, y)] = hex;
  }

  coordsOf(index) {
    return { x: index % this.width, y: Math.floor(index / this.width) };
  }

  toJSON() {
    return { width: this.width, height: this.height, pixels: this.pixels };
  }

  static fromJSON(data) {
    return new PixelData(data.width, data.height, data.pixels);
  }
}
