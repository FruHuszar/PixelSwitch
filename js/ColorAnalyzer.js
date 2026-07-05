export default class ColorAnalyzer {
  analyze(pixelData) {
    const counts = new Map();
    for (const hex of pixelData.pixels) {
      counts.set(hex, (counts.get(hex) || 0) + 1);
    }
    return [...counts.entries()]
      .map(([hex, count]) => ({ hex, count }))
      .sort((a, b) => b.count - a.count);
  }
}
