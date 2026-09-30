/* ==========================================================================
   CANVAS
   ========================================================================== */
function initCanvas() {
  const container = document.getElementById('canvas-container');
  canvas = new fabric.Canvas('whiteboard', {
    width: container.clientWidth - 20,
    height: container.clientHeight - 20,
    backgroundColor: '#ffffff',
    isDrawingMode: false,
    preserveObjectStacking: true
  });

  canvas.freeDrawingBrush.color = '#000000';
  canvas.freeDrawingBrush.width = 3;

  canvas.on('mouse:dblclick', (opt) => {
    if (opt.target) return;
    if (currentToolMode !== 'text') return;
    const pointer = canvas.getPointer(opt.e);
    createTextAt(pointer.x, pointer.y);
  });

  canvas.on('text:editing:exited', (opt) => {
    const obj = opt.target;
    if (obj && obj.text.trim() === "") {
      canvas.remove(obj);
      canvas.renderAll();
      updateCounter();
    }
  });

  canvas.on('text:editing:entered', (opt) => {
    updateTextFormatBar(opt.target);
  });

  canvas.on('selection:created', (opt) => {
    const obj = opt.selected[0];
    if (obj && (obj.type === 'textbox' || obj.type === 'i-text' || obj.type === 'text')) {
      lastActiveTextObj = obj;
    }
    updateTextFormatBar(obj);
  });
  canvas.on('selection:updated', (opt) => {
    const obj = opt.selected[0];
    if (obj && (obj.type === 'textbox' || obj.type === 'i-text' || obj.type === 'text')) {
      lastActiveTextObj = obj;
    }
    updateTextFormatBar(obj);
  });
  canvas.on('selection:cleared', () => {
    if (isPickingColor) return;
    lastActiveTextObj = null;
    hideTextFormatBar();
  });

  canvas.on('text:changed', () => {
    updateCounter();
  });

  canvas.on('object:added', onCanvasChanged);
  canvas.on('object:modified', onCanvasChanged);
  canvas.on('object:removed', onCanvasChanged);
}

function onCanvasChanged() {
  if (isRestoringState) return;
  pushHistoryState();
  updateCounter();
}

function createTextAt(x, y) {
  const brushColor = canvas.freeDrawingBrush.color || '#000000';

  const textbox = new fabric.Textbox("", {
    left: x,
    top: y,
    width: 200,
    fontSize: 24,
    fontFamily: 'Poppins, sans-serif',
    fill: brushColor,
    splitByGrapheme: false,
    lockUniScaling: true
  });

  textbox.on('editing:entered', () => {
    textbox.set({ hasControls: false, hasBorders: false });
    canvas.requestRenderAll();
    updateTextFormatBar(textbox);
  });
  textbox.on('editing:exited', () => {
    textbox.set({ hasControls: true, hasBorders: true });
    canvas.requestRenderAll();
  });

  canvas.add(textbox);
  canvas.setActiveObject(textbox);
  canvas.isDrawingMode = false;
  updateDrawingBtnUI();
  textbox.enterEditing();
}

function setupResizeListener() {
  window.addEventListener('resize', () => {
    const container = document.getElementById('canvas-container');
    if (canvas && container) {
      canvas.setWidth(container.clientWidth - 20);
      canvas.setHeight(container.clientHeight - 20);
      canvas.renderAll();
    }
  });
}

/* ==========================================================================
   FERRAMENTAS (texto / desenho)
   ========================================================================== */
function setToolMode(mode) {
  currentToolMode = mode;
  const drawBtn = document.getElementById('toolDrawBtn');
  const textBtn = document.getElementById('toolTextBtn');
  const container = document.getElementById('canvas-container');

  if (mode === 'draw') {
    drawBtn.classList.add('active');
    textBtn.classList.remove('active');
    canvas.isDrawingMode = true;
    container.classList.remove('text-mode');
    hideTextFormatBar();
    hideHighlightPalette();
  } else {
    drawBtn.classList.remove('active');
    textBtn.classList.add('active');
    canvas.isDrawingMode = false;
    canvas.discardActiveObject();
    canvas.renderAll();
    container.classList.add('text-mode');
    hideTextFormatBar();
    hideHighlightPalette();
  }
}

function updateDrawingBtnUI() {
  const drawBtn = document.getElementById('toolDrawBtn');
  const textBtn = document.getElementById('toolTextBtn');
  const container = document.getElementById('canvas-container');
  if (!drawBtn || !textBtn) return;

  if (canvas.isDrawingMode) {
    drawBtn.classList.add('active');
    textBtn.classList.remove('active');
    container.classList.remove('text-mode');
  } else {
    drawBtn.classList.remove('active');
    textBtn.classList.add('active');
    container.classList.add('text-mode');
  }
}

/* ==========================================================================
   COR / ESPESSURA
   ========================================================================== */
function updateBrushColor(colorHex) {
  canvas.freeDrawingBrush.color = colorHex;
  const validHex = colorHex.startsWith('#') ? colorHex : '#000000';
  const modalPicker = document.getElementById('modal-custom-picker');
  if (modalPicker) modalPicker.value = validHex;
}

function updateBrushSize(size) {
  const px = parseInt(size, 10) || 3;
  canvas.freeDrawingBrush.width = px;
  updateBrushFill(px);
}

function updateBrushFill(px) {
  const slider = document.getElementById('brush-size');
  if (!slider) return;
  const min = parseFloat(slider.min) || 1;
  const max = parseFloat(slider.max) || 40;
  const clamped = Math.min(Math.max(px, min), max);
  const percent = ((clamped - min) / (max - min)) * 100;
  slider.style.setProperty('--fill-percent', percent + '%');
}

function openColorPaletteModal() {
  const current = (canvas.freeDrawingBrush.color || '#000000').toLowerCase();
  document.querySelectorAll('.color-swatch[data-color]').forEach(sw => {
    sw.classList.toggle('selected', sw.dataset.color.toLowerCase() === current);
  });
  openModal('colorPaletteModal');
}

function selectColorFromModal(hex, el) {
  updateBrushColor(hex);
  document.querySelectorAll('.color-swatch').forEach(sw => sw.classList.remove('selected'));
  if (el) el.classList.add('selected');
  closeModal('colorPaletteModal');
}

function setupWheelBrushSize() {
  if (!canvas) return;
  canvas.on('mouse:wheel', (opt) => {
    if (!canvas.isDrawingMode) return;
    const e = opt.e;
    e.preventDefault();
    e.stopPropagation();
    const step = e.deltaY < 0 ? 1 : -1;
    const current = canvas.freeDrawingBrush.width || 3;
    const next = Math.min(Math.max(current + step, 1), 40);
    if (next === current) return;
    canvas.freeDrawingBrush.width = next;
    const slider = document.getElementById('brush-size');
    if (slider) { slider.value = next; updateBrushFill(next); }
  });
}

/* ==========================================================================
   POST-ITS
   ========================================================================== */
function openPostItModal() { openModal('postItModal'); }

function addPostIt(color) {
  closeModal('postItModal');
  const rect = new fabric.Rect({
    left: 150,
    top: 150,
    width: 150,
    height: 150,
    fill: color,
    rx: 6,
    ry: 6,
    shadow: new fabric.Shadow({ color: 'rgba(0,0,0,0.18)', blur: 12, offsetX: 2, offsetY: 4 }),
    cornerColor: '#c00000',
    cornerSize: 8,
    transparentCorners: false
  });

  canvas.add(rect);
  canvas.setActiveObject(rect);
  canvas.renderAll();
  pushHistoryState();
  updateCounter();
}

/* ==========================================================================
   GRADE DE FUNDO
   ========================================================================== */
function toggleGrid() {
  isGridOn = !isGridOn;
  applyCanvasBackground();
  updateGridButtonUI();
  showLongOperationToast(isGridOn ? "Grade ativada" : "Grade desativada");
}

function updateGridButtonUI() {
  const btn = document.getElementById('gridToggleBtn');
  if (!btn) return;
  if (isGridOn) btn.classList.add('toggle-on');
  else btn.classList.remove('toggle-on');
}

function applyCanvasBackground() {
  if (!canvas) return;

  if (isGridOn) {
    const pattern = createGridPattern();
    canvas.setBackgroundColor(pattern, () => canvas.renderAll());
  } else {
    canvas.setBackgroundColor('#ffffff', () => canvas.renderAll());
  }
}

function createGridPattern() {
  const size = 40;
  const offCanvas = document.createElement('canvas');
  offCanvas.width = size;
  offCanvas.height = size;
  const ctx = offCanvas.getContext('2d');

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, size, size);

  ctx.strokeStyle = '#e8e8e8';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, 0); ctx.lineTo(size, 0);
  ctx.moveTo(0, 0); ctx.lineTo(0, size);
  ctx.stroke();

  return new fabric.Pattern({
    source: offCanvas,
    repeat: 'repeat'
  });
}

/* ==========================================================================
   MODO APRESENTAÇÃO
   ========================================================================== */
function enterPresentationMode() {
  document.body.classList.add('presentation-mode');
  document.getElementById('sidebar').classList.remove('active');
  document.getElementById('drawerOverlay').classList.remove('active');
  hideTextFormatBar();
  hideHighlightPalette();
  if (canvas.getActiveObject()) {
    canvas.discardActiveObject();
    canvas.renderAll();
  }
  showLongOperationToast("Modo apresentação — pressione Esc para sair");
}

function exitPresentationMode() {
  document.body.classList.remove('presentation-mode');
}

/* ==========================================================================
   DOWNLOAD
   ========================================================================== */
function downloadCanvas() {
  showLongOperationToast("Gerando imagem...");
  const today = new Date().toISOString().slice(0, 10);
  setTimeout(() => {
    const link = document.createElement('a');
    link.download = `aula-superboard-${today}.png`;
    link.href = canvas.toDataURL({ format: 'png', quality: 1.0 });
    link.click();
  }, 800);
}
