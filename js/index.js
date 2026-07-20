import ImageFileReader from './ImageFileReader.js';
import PixelDataFactory from './PixelDataFactory.js';
import ColorAnalyzer from './ColorAnalyzer.js';
import StorageService from './StorageService.js';
import PixelCanvasRenderer from './PixelCanvasRenderer.js';
import ColorListRenderer from './ColorListRenderer.js';
import PixelSwapService from './PixelSwapService.js';
import PngExporter from './PngExporter.js';
import PanZoomController from './PanZoomController.js';
import PatternGenerator from './PatternGenerator.js';
import { createDefaultPatternRegistry } from './Patterns.js';

class App {
  constructor() {
    this.imageFileReader = new ImageFileReader();
    this.pixelDataFactory = new PixelDataFactory();
    this.colorAnalyzer = new ColorAnalyzer();
    this.storageService = new StorageService();
    this.pixelSwapService = new PixelSwapService();
    this.pngExporter = new PngExporter();
    this.patternGenerator = new PatternGenerator();
    this.patternRegistry = createDefaultPatternRegistry();

    this.canvas = document.getElementById('pixelCanvas');
    this.canvasViewport = document.getElementById('canvasViewport');
    this.canvasRenderer = new PixelCanvasRenderer(this.canvas, this.canvasViewport);
    this.colorListEl = document.getElementById('colorList');
    this.colorListRenderer = new ColorListRenderer(this.colorListEl, {
      onSelect: hex => (this.selectedHex = hex),
      onColorChange: (oldHex, newHex) => this.recolor(oldHex, newHex)
    });
    this.panZoom = new PanZoomController(this.canvasViewport, this.canvas, e => this.handleCanvasTap(e));

    this.appMain = document.getElementById('appMain');
    this.dropZone = document.getElementById('dropZone');
    this.dropZoneText = document.getElementById('dropZoneText');
    this.fileInput = document.getElementById('fileInput');
    this.downloadBtn = document.getElementById('downloadBtn');
    this.clearBtn = document.getElementById('clearBtn');
    this.toolButtons = [...document.querySelectorAll('.tool-btn[data-tool]')];
    this.zoomInBtn = document.getElementById('zoomInBtn');
    this.zoomOutBtn = document.getElementById('zoomOutBtn');
    this.generateBtn = document.getElementById('generateBtn');
    this.patternMenu = document.getElementById('patternMenu');
    this.infoPanel = document.getElementById('infoPanel');
    this.infoOpenBtn = document.getElementById('infoOpenBtn');
    this.infoCloseBtn = document.getElementById('infoCloseBtn');

    this.pixelData = null;
    this.selectedHex = null;
    this.tool = 'pen';
    this.pendingPixel = null;

    this.buildPatternMenu();
    this.bindEvents();
    this.restore();
    this.setInfoOpen(true);
  }

  bindEvents() {
    this.dropZone.addEventListener('click', () => {
      if (!this.pixelData) this.fileInput.click();
    });
    this.fileInput.addEventListener('change', e => {
      if (e.target.files[0]) this.loadFile(e.target.files[0]);
    });
    this.dropZone.addEventListener('dragover', e => {
      e.preventDefault();
      this.dropZone.classList.add('drag-over');
    });
    this.dropZone.addEventListener('dragleave', () => {
      this.dropZone.classList.remove('drag-over');
    });
    this.dropZone.addEventListener('drop', e => {
      e.preventDefault();
      this.dropZone.classList.remove('drag-over');
      if (e.dataTransfer.files[0]) this.loadFile(e.dataTransfer.files[0]);
    });
    this.downloadBtn.addEventListener('click', () => {
      if (this.pixelData) this.pngExporter.export(this.pixelData);
    });
    this.clearBtn.addEventListener('click', () => this.clear());
    this.toolButtons.forEach(btn => {
      btn.addEventListener('click', () => this.setTool(btn.dataset.tool));
    });
    this.zoomInBtn.addEventListener('click', () => this.panZoom.zoomBy(0.5));
    this.zoomOutBtn.addEventListener('click', () => this.panZoom.zoomBy(-0.5));
    this.generateBtn.addEventListener('click', () => this.togglePatternMenu());
    document.addEventListener('click', e => {
      if (!e.target.closest('.tool-generate')) this.closePatternMenu();
    });
    this.infoOpenBtn.addEventListener('click', () => this.setInfoOpen(true));
    this.infoCloseBtn.addEventListener('click', () => this.setInfoOpen(false));
  }

  setInfoOpen(open) {
    this.infoPanel.hidden = !open;
    this.appMain.classList.toggle('info-closed', !open);
    this.infoOpenBtn.style.display = open ? 'none' : 'flex';
  }

  setTool(tool) {
    this.tool = tool;
    this.pendingPixel = null;
    this.selectedHex = null;
    this.colorListRenderer.clearSelection();
    this.toolButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.tool === tool));
    this.colorListEl.classList.toggle('disabled', tool === 'strict');
    if (this.pixelData) this.canvasRenderer.render(this.pixelData, this.pendingPixel);
  }

  async loadFile(file) {
    const imageData = await this.imageFileReader.read(file);
    this.pixelData = this.pixelDataFactory.fromImageData(imageData);
    this.selectedHex = null;
    this.pendingPixel = null;
    this.panZoom.reset();
    this.storageService.save(this.pixelData);
    this.refresh();
  }

  restore() {
    const saved = this.storageService.load();
    if (saved) {
      this.pixelData = saved;
      this.refresh();
    }
  }

  refresh() {
    this.dropZoneText.hidden = true;
    this.canvasViewport.hidden = false;
    this.canvasRenderer.render(this.pixelData, this.pendingPixel);
    const stats = this.colorAnalyzer.analyze(this.pixelData);
    this.colorListRenderer.render(stats);
    this.downloadBtn.disabled = false;
    this.clearBtn.disabled = false;
    this.generateBtn.disabled = false;
  }

  handleCanvasTap(evt) {
    if (!this.pixelData) return;
    const { x, y } = this.canvasRenderer.pixelFromEvent(evt);
    if (x < 0 || y < 0 || x >= this.pixelData.width || y >= this.pixelData.height) return;

    if (this.tool === 'strict') {
      if (!this.pendingPixel) {
        this.pendingPixel = { x, y };
        this.canvasRenderer.render(this.pixelData, this.pendingPixel);
        return;
      }
      const swapped = this.pixelSwapService.swapExact(this.pixelData, this.pendingPixel.x, this.pendingPixel.y, x, y);
      this.pendingPixel = null;
      this.canvasRenderer.render(this.pixelData, this.pendingPixel);
      if (swapped) this.storageService.save(this.pixelData);
      return;
    }

    if (this.tool === 'bucket') {
      if (!this.selectedHex) return;
      const clickedHex = this.pixelData.colorAt(x, y);
      const changed = this.pixelSwapService.bucketSwap(this.pixelData, this.selectedHex, clickedHex);
      if (changed) {
        this.canvasRenderer.render(this.pixelData, this.pendingPixel);
        this.storageService.save(this.pixelData);
      }
      return;
    }

    if (!this.selectedHex) return;
    const swapped = this.pixelSwapService.swap(this.pixelData, this.selectedHex, x, y);
    if (swapped) {
      this.canvasRenderer.render(this.pixelData, this.pendingPixel);
      this.storageService.save(this.pixelData);
    }
  }

  buildPatternMenu() {
    for (const pattern of this.patternRegistry.all) {
      const option = document.createElement('button');
      option.type = 'button';
      option.className = 'pattern-option';
      option.textContent = pattern.name;
      option.addEventListener('click', () => {
        this.generatePattern(pattern.name);
        this.closePatternMenu();
      });
      this.patternMenu.appendChild(option);
    }
  }

  togglePatternMenu() {
    if (this.generateBtn.disabled) return;
    this.patternMenu.hidden = !this.patternMenu.hidden;
  }

  closePatternMenu() {
    this.patternMenu.hidden = true;
  }

  generatePattern(name) {
    if (!this.pixelData) return;
    const pattern = this.patternRegistry.get(name);
    const changed = this.patternGenerator.generate(this.pixelData, pattern);
    if (changed) {
      this.canvasRenderer.render(this.pixelData, this.pendingPixel);
      this.storageService.save(this.pixelData);
    }
  }

  recolor(oldHex, newHex) {
    if (!this.pixelData) return;
    for (let i = 0; i < this.pixelData.pixels.length; i++) {
      if (this.pixelData.pixels[i] === oldHex) this.pixelData.pixels[i] = newHex;
    }
    if (this.selectedHex === oldHex) this.selectedHex = newHex;
    this.storageService.save(this.pixelData);
    this.canvasRenderer.render(this.pixelData, this.pendingPixel);
    const stats = this.colorAnalyzer.analyze(this.pixelData);
    this.colorListRenderer.render(stats);
  }

  clear() {
    this.storageService.clear();
    this.pixelData = null;
    this.selectedHex = null;
    this.pendingPixel = null;
    this.panZoom.reset();
    this.canvas.width = 0;
    this.canvas.height = 0;
    this.canvasViewport.hidden = true;
    this.dropZoneText.hidden = false;
    this.colorListRenderer.reset();
    this.downloadBtn.disabled = true;
    this.clearBtn.disabled = true;
    this.generateBtn.disabled = true;
    this.closePatternMenu();
    this.fileInput.value = '';
  }
}

document.addEventListener('DOMContentLoaded', () => new App());
