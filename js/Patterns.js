const TAU = Math.PI * 2;
const PRIMARY = 1e6;

export class Pattern {
  get name() {
    throw new Error('name not implemented');
  }

  get colorOrder() {
    return 'shuffle';
  }

  order(slots, geometry) {
    throw new Error('order not implemented');
  }
}

class FieldPattern extends Pattern {
  order(slots, geometry) {
    const context = this.prepare(geometry);
    return [...slots].sort((a, b) => this.key(a, geometry, context) - this.key(b, geometry, context));
  }

  prepare(geometry) {
    return {};
  }

  key(slot, geometry, context) {
    throw new Error('key not implemented');
  }

  radius(slot, geometry) {
    return Math.hypot(slot.x - geometry.centerX, slot.y - geometry.centerY);
  }

  angle(slot, geometry) {
    const a = Math.atan2(slot.y - geometry.centerY, slot.x - geometry.centerX);
    return (a + TAU) % TAU / TAU;
  }
}

class GradientPattern extends FieldPattern {
  get name() {
    return 'Gradient';
  }

  get colorOrder() {
    return 'gradient';
  }

  key(slot, geometry) {
    return this.radius(slot, geometry) * PRIMARY + this.angle(slot, geometry);
  }
}

class PolkaPattern extends FieldPattern {
  get name() {
    return 'Polka dots';
  }

  prepare(geometry) {
    const gap = Math.min(16, Math.max(7, Math.round(geometry.width / 6) + Math.floor(Math.random() * 4) - 1));
    return {
      gap,
      dotRadius: gap * 0.42,
      offsetX: geometry.centerX + Math.random() * gap,
      offsetY: geometry.centerY + Math.random() * gap
    };
  }

  key(slot, geometry, context) {
    const gx = Math.round((slot.x - context.offsetX) / context.gap);
    const gy = Math.round((slot.y - context.offsetY) / context.gap);
    const cx = context.offsetX + gx * context.gap;
    const cy = context.offsetY + gy * context.gap;
    const dist = Math.hypot(slot.x - cx, slot.y - cy);
    if (dist <= context.dotRadius) {
      const dotId = (gy + 500) * 1000 + (gx + 500);
      return dotId * 1000 + dist;
    }
    return 1e12 + slot.y * geometry.width + slot.x;
  }
}

class FlowerPattern extends FieldPattern {
  get name() {
    return 'Flower';
  }

  get colorOrder() {
    return 'gradient';
  }

  prepare() {
    return {
      petals: 5 + Math.floor(Math.random() * 3),
      phase: Math.random() * TAU,
      amplitude: 0.35
    };
  }

  key(slot, geometry, context) {
    const r = this.radius(slot, geometry);
    const a = this.angle(slot, geometry) * TAU;
    const warp = 1 + context.amplitude * Math.cos(context.petals * a + context.phase);
    const effective = r / warp;
    return effective * PRIMARY + this.angle(slot, geometry);
  }
}

class DiamondPattern extends FieldPattern {
  get name() {
    return 'Diamonds';
  }

  prepare() {
    return { size: 5 + Math.floor(Math.random() * 4) };
  }

  key(slot, geometry, context) {
    const u = slot.x + slot.y;
    const v = slot.x - slot.y;
    const du = Math.floor(u / context.size);
    const dv = Math.floor(v / context.size);
    const cellId = (du + 1000) * 10000 + (dv + 1000);
    return cellId * PRIMARY + (slot.x * 1000 + slot.y);
  }
}

export class PatternRegistry {
  #patterns;

  constructor(patterns) {
    this.#patterns = new Map(patterns.map(pattern => [pattern.name, pattern]));
  }

  get all() {
    return [...this.#patterns.values()];
  }

  get(name) {
    return this.#patterns.get(name);
  }
}

export function createDefaultPatternRegistry() {
  return new PatternRegistry([
    new GradientPattern(),
    new PolkaPattern(),
    new FlowerPattern(),
    new DiamondPattern()
  ]);
}
