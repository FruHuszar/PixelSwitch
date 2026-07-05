export default class PixelCanvasRenderer {
  constructor(canvas, viewport, maxScale = 40) {
    this.canvas = canvas;
    this.viewport = viewport;
    this.ctx = canvas.getContext('2d');
    this.maxScale = maxScale;
    this.scale = 1;
  }

  computeScale(pixelData) {
    const vpWidth = (this.viewport && this.viewport.clientWidth) || 480;
    const vpHeight = (this.viewport && this.viewport.clientHeight) || 340;
    const fitScale = Math.min(vpWidth / pixelData.width, vpHeight / pixelData.height);
    return Math.max(0.05, Math.min(this.maxScale, fitScale));
  }

  render(pixelData, highlight = null) {
    this.scale = this.computeScale(pixelData);
    const w = pixelData.width * this.scale;
    const h = pixelData.height * this.scale;
    this.canvas.width = w;
    this.canvas.height = h;

    for (let y = 0; y < pixelData.height; y++) {
      for (let x = 0; x < pixelData.width; x++) {
        this.ctx.fillStyle = pixelData.colorAt(x, y);
        this.ctx.fillRect(x * this.scale, y * this.scale, this.scale, this.scale);
      }
    }

    if (this.scale >= 6) {
      this.ctx.strokeStyle = 'rgba(0,0,0,0.08)';
      this.ctx.lineWidth = 1;
      for (let x = 0; x <= pixelData.width; x++) {
        this.ctx.beginPath();
        this.ctx.moveTo(x * this.scale, 0);
        this.ctx.lineTo(x * this.scale, h);
        this.ctx.stroke();
      }
      for (let y = 0; y <= pixelData.height; y++) {
        this.ctx.beginPath();
        this.ctx.moveTo(0, y * this.scale);
        this.ctx.lineTo(w, y * this.scale);
        this.ctx.stroke();
      }
    }

    if (highlight) {
      this.ctx.strokeStyle = '#2563eb';
      this.ctx.lineWidth = Math.max(2, this.scale * 0.15);
      this.ctx.strokeRect(
        highlight.x * this.scale + this.ctx.lineWidth / 2,
        highlight.y * this.scale + this.ctx.lineWidth / 2,
        this.scale - this.ctx.lineWidth,
        this.scale - this.ctx.lineWidth
      );
    }
  }

  pixelFromEvent(evt) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    const cx = (evt.clientX - rect.left) * scaleX;
    const cy = (evt.clientY - rect.top) * scaleY;
    return { x: Math.floor(cx / this.scale), y: Math.floor(cy / this.scale) };
  }
}
