export default class PngExporter {
  export(pixelData, filename = 'pixel-art.png') {
    const canvas = document.createElement('canvas');
    canvas.width = pixelData.width;
    canvas.height = pixelData.height;
    const ctx = canvas.getContext('2d');
    for (let y = 0; y < pixelData.height; y++) {
      for (let x = 0; x < pixelData.width; x++) {
        ctx.fillStyle = pixelData.colorAt(x, y);
        ctx.fillRect(x, y, 1, 1);
      }
    }
    canvas.toBlob(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    });
  }
}
