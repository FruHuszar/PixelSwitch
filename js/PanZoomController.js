export default class PanZoomController {
  constructor(viewport, target, onTap) {
    this.viewport = viewport;
    this.target = target;
    this.onTap = onTap;
    this.zoom = 1;
    this.panX = 0;
    this.panY = 0;
    this.pointers = new Map();
    this.mode = null;
    this.moved = false;
    this.dragStart = null;
    this.pinchStart = null;
    this.bind();
  }

  bind() {
    this.viewport.style.touchAction = 'none';
    this.viewport.addEventListener('pointerdown', e => this.onPointerDown(e));
    this.viewport.addEventListener('pointermove', e => this.onPointerMove(e));
    this.viewport.addEventListener('pointerup', e => this.onPointerUp(e));
    this.viewport.addEventListener('pointercancel', e => this.onPointerUp(e));
    this.viewport.addEventListener('wheel', e => this.onWheel(e), { passive: false });
  }

  onWheel(e) {
    e.preventDefault();
    const step = -e.deltaY * 0.0015;
    this.zoomBy(step);
  }

  onPointerDown(e) {
    this.viewport.setPointerCapture(e.pointerId);
    this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    this.moved = false;

    if (this.pointers.size === 1) {
      this.mode = 'pan';
      const p = this.pointers.get(e.pointerId);
      this.dragStart = { x: p.x, y: p.y, panX: this.panX, panY: this.panY };
    } else if (this.pointers.size === 2) {
      this.mode = 'pinch';
      const pts = [...this.pointers.values()];
      this.pinchStart = { dist: this.distance(pts[0], pts[1]), zoom: this.zoom };
    }
  }

  onPointerMove(e) {
    if (!this.pointers.has(e.pointerId)) return;
    this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (this.mode === 'pan' && this.pointers.size === 1) {
      const dx = e.clientX - this.dragStart.x;
      const dy = e.clientY - this.dragStart.y;
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) this.moved = true;
      this.panX = this.dragStart.panX + dx;
      this.panY = this.dragStart.panY + dy;
      this.apply();
    } else if (this.mode === 'pinch' && this.pointers.size === 2) {
      const pts = [...this.pointers.values()];
      const dist = this.distance(pts[0], pts[1]);
      const scale = dist / this.pinchStart.dist;
      this.zoom = this.clamp(this.pinchStart.zoom * scale, 1, 8);
      this.moved = true;
      this.apply();
    }
  }

  onPointerUp(e) {
    const wasTap = this.pointers.size === 1 && !this.moved;
    this.pointers.delete(e.pointerId);

    if (this.pointers.size === 0) {
      if (wasTap && this.onTap) this.onTap(e);
      this.mode = null;
    } else if (this.pointers.size === 1) {
      const p = [...this.pointers.values()][0];
      this.mode = 'pan';
      this.dragStart = { x: p.x, y: p.y, panX: this.panX, panY: this.panY };
    }
  }

  distance(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  clamp(v, min, max) {
    return Math.min(max, Math.max(min, v));
  }

  zoomBy(step) {
    this.zoom = this.clamp(this.zoom + step, 1, 8);
    this.apply();
  }

  reset() {
    this.zoom = 1;
    this.panX = 0;
    this.panY = 0;
    this.apply();
  }

  apply() {
    this.target.style.transform = `translate(${this.panX}px, ${this.panY}px) scale(${this.zoom})`;
  }
}
