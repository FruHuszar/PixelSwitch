export default class ColorListRenderer {
  constructor(listEl, { onSelect, onColorChange } = {}) {
    this.listEl = listEl;
    this.onSelect = onSelect;
    this.onColorChange = onColorChange;
    this.selectedHex = null;
  }

  render(colorStats) {
    this.listEl.innerHTML = '';
    for (const { hex, count } of colorStats) {
      const li = document.createElement('li');
      li.className = 'color-item' + (hex === this.selectedHex ? ' selected' : '');

      const swatch = document.createElement('button');
      swatch.type = 'button';
      swatch.className = 'color-swatch';
      if (hex === 'transparent') {
        swatch.classList.add('checkerboard', 'transparent-swatch');
      } else {
        swatch.style.background = hex;
      }
      swatch.dataset.hex = hex;
      swatch.addEventListener('click', () => this.handleSelect(hex));

      const hexInput = document.createElement('input');
      hexInput.type = 'text';
      hexInput.className = 'color-hex-input';
      hexInput.value = hex;
      hexInput.maxLength = 11;
      hexInput.spellcheck = false;
      hexInput.addEventListener('change', () => this.handleHexChange(hex, hexInput));
      hexInput.addEventListener('keydown', e => {
        if (e.key === 'Enter') hexInput.blur();
      });

      const countLabel = document.createElement('span');
      countLabel.className = 'color-count';
      countLabel.textContent = count;

      li.append(swatch, hexInput, countLabel);
      this.listEl.appendChild(li);
    }
  }

  handleSelect(hex) {
    this.selectedHex = this.selectedHex === hex ? null : hex;
    this.listEl.querySelectorAll('.color-swatch').forEach(s => {
      s.closest('.color-item').classList.toggle('selected', s.dataset.hex === this.selectedHex);
    });
    if (this.onSelect) this.onSelect(this.selectedHex);
  }

  handleHexChange(oldHex, input) {
    let val = input.value.trim();
    let normalized;
    if (val.toLowerCase() === 'transparent') {
      normalized = 'transparent';
    } else {
      if (!val.startsWith('#')) val = '#' + val;
      if (!/^#[0-9a-fA-F]{6}$/.test(val)) {
        input.value = oldHex;
        return;
      }
      normalized = val.toLowerCase();
    }
    if (normalized === oldHex.toLowerCase()) {
      input.value = oldHex;
      return;
    }
    if (this.onColorChange) this.onColorChange(oldHex, normalized);
  }

  clearSelection() {
    this.selectedHex = null;
  }

  reset() {
    this.selectedHex = null;
    this.listEl.innerHTML = '';
  }
}
