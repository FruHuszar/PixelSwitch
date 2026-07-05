import PixelData from './PixelData.js';

export default class StorageService {
  constructor(key = 'pixelArtState') {
    this.key = key;
  }

  save(pixelData) {
    localStorage.setItem(this.key, JSON.stringify(pixelData.toJSON()));
  }

  load() {
    const raw = localStorage.getItem(this.key);
    if (!raw) return null;
    try {
      return PixelData.fromJSON(JSON.parse(raw));
    } catch {
      return null;
    }
  }

  clear() {
    localStorage.removeItem(this.key);
  }
}
