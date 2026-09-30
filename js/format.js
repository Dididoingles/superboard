/* ==========================================================================
   FORMATAÇÃO DE TEXTO (parcial + global)
   ========================================================================== */
function setupFormatColorInput() {
  const input = document.getElementById('fmtColorInput');
  if (!input) return;

  input.addEventListener('mousedown', () => {
    isPickingColor = true;
    const active = canvas.getActiveObject();
    if (active && (active.type === 'textbox' || active.type === 'i-text' || active.type === 'text')) {
      lastActiveTextObj = active;
    }
  });

  input.addEventListener('input', (e) => { applyTextColor(e.target.value); isPickingColor = false; });
  input.addEventListener('change', (e) => { applyTextColor(e.target.value); isPickingColor = false; });
  input.addEventListener('click', () => setTimeout(() => { isPickingColor = false; }, 400));
}

function getActiveTextObject() {
  const active = canvas.getActiveObject();
  if (active && (active.type === 'textbox' || active.type === 'i-text' || active.type === 'text')) return active;
  if (lastActiveTextObj && canvas.getObjects().includes(lastActiveTextObj)) return lastActiveTextObj;
  return null;
}

function getPartialSelection(textObj) {
  if (!textObj || !textObj.isEditing) return null;
  const s = textObj.selectionStart;
  const e = textObj.selectionEnd;
  if (typeof s !== 'number' || typeof e !== 'number') return null;
  if (e <= s) return null;
  return { start: s, end: e };
}

function applyStyleToRange(textObj, start, end, styleName, value) {
  if (!textObj.styles) textObj.styles = {};

  for (let i = start; i < end; i++) {
    const loc = textObj.get2DCursorLocation(i, false);
    const li = loc.lineIndex;
    const ci = loc.charIndex;

    if (!textObj.styles[li]) textObj.styles[li] = {};
    if (!textObj.styles[li][ci]) textObj.styles[li][ci] = {};

    if (value === null || value === undefined) {
      delete textObj.styles[li][ci][styleName];
      if (Object.keys(textObj.styles[li][ci]).length === 0) delete textObj.styles[li][ci];
      if (Object.keys(textObj.styles[li]).length === 0) delete textObj.styles[li];
    } else {
      textObj.styles[li][ci][styleName] = value;
    }
  }
}

function updateTextFormatBar(textObj) {
  const bar = document.getElementById('text-format-bar');
  if (!textObj || (textObj.type !== 'textbox' && textObj.type !== 'i-text' && textObj.type !== 'text')) {
    hideTextFormatBar();
    return;
  }
  bar.classList.add('visible');

  let ref = {
    fontWeight: textObj.fontWeight,
    fontStyle: textObj.fontStyle,
    underline: textObj.underline,
    linethrough: textObj.linethrough,
    fill: textObj.fill,
    textBackgroundColor: textObj.textBackgroundColor
  };

  const sel = getPartialSelection(textObj);
  if (sel) {
    const loc = textObj.get2DCursorLocation(sel.start, false);
    const s = textObj.styles?.[loc.lineIndex]?.[loc.charIndex];
    if (s) {
      ref.fontWeight = s.fontWeight ?? ref.fontWeight;
      ref.fontStyle = s.fontStyle ?? ref.fontStyle;
      ref.underline = s.underline ?? ref.underline;
      ref.linethrough = s.linethrough ?? ref.linethrough;
      ref.fill = s.fill ?? ref.fill;
    }
  }

  document.getElementById('fmtBold').classList.toggle('active', ref.fontWeight === 'bold');
  document.getElementById('fmtItalic').classList.toggle('active', ref.fontStyle === 'italic');
  document.getElementById('fmtUnderline').classList.toggle('active', !!ref.underline);
  document.getElementById('fmtStrike').classList.toggle('active', !!ref.linethrough);

  const color = ref.fill || '#000000';
  document.getElementById('fmtColorDot').style.background = color;
  document.getElementById('fmtColorInput').value = normalizeHex(color);
}

function hideTextFormatBar() {
  document.getElementById('text-format-bar').classList.remove('visible');
  hideHighlightPalette();
}

function applyTextColor(hex) {
  const textObj = getActiveTextObject();
  if (!textObj) return;

  const sel = getPartialSelection(textObj);
  if (sel) {
    applyStyleToRange(textObj, sel.start, sel.end, 'fill', hex);
    textObj.dirty = true;
    canvas.requestRenderAll();
    pushHistoryState();
  } else {
    textObj.set('fill', hex);
    textObj.dirty = true;
    canvas.setActiveObject(textObj);
    canvas.requestRenderAll();
    textObj.setCoords();
    pushHistoryState();
  }

  document.getElementById('fmtColorDot').style.background = hex;
  document.getElementById('fmtColorInput').value = normalizeHex(hex);
  updateTextFormatBar(textObj);
}

function toggleTextStyle(style) {
  const textObj = getActiveTextObject();
  if (!textObj) return;

  const styleMap = {
    'bold': { key: 'fontWeight', on: 'bold', off: 'normal' },
    'italic': { key: 'fontStyle', on: 'italic', off: 'normal' },
    'underline': { key: 'underline', on: true, off: false },
    'strikethrough': { key: 'linethrough', on: true, off: false }
  };

  const map = styleMap[style];
  if (!map) return;

  const sel = getPartialSelection(textObj);

  if (sel) {
    const loc = textObj.get2DCursorLocation(sel.start, false);
    const current = textObj.styles?.[loc.lineIndex]?.[loc.charIndex]?.[map.key]
      ?? textObj[map.key];
    const isOn = (current === map.on) || (current === true);
    const newValue = isOn ? map.off : map.on;

    if (typeof map.on === 'boolean' && newValue === false) {
      applyStyleToRange(textObj, sel.start, sel.end, map.key, null);
    } else {
      applyStyleToRange(textObj, sel.start, sel.end, map.key, newValue);
    }
  } else {
    if (map.key === 'fontWeight') {
      textObj.set('fontWeight', textObj.fontWeight === 'bold' ? 'normal' : 'bold');
    } else if (map.key === 'fontStyle') {
      textObj.set('fontStyle', textObj.fontStyle === 'italic' ? 'normal' : 'italic');
    } else if (map.key === 'underline') {
      textObj.set('underline', !textObj.underline);
    } else if (map.key === 'linethrough') {
      textObj.set('linethrough', !textObj.linethrough);
    }
  }

  textObj.dirty = true;
  textObj.setCoords();
  canvas.requestRenderAll();
  pushHistoryState();
  updateTextFormatBar(textObj);
}

function changeFontSize(delta) {
  const textObj = getActiveTextObject();
  if (!textObj) return;

  const sel = getPartialSelection(textObj);

  if (sel) {
    const loc = textObj.get2DCursorLocation(sel.start, false);
    const current = textObj.styles?.[loc.lineIndex]?.[loc.charIndex]?.fontSize
      ?? textObj.fontSize
      ?? 24;
    const next = Math.min(Math.max(current + delta, 10), 96);
    applyStyleToRange(textObj, sel.start, sel.end, 'fontSize', next);
  } else {
    const current = textObj.fontSize || 24;
    const next = Math.min(Math.max(current + delta, 10), 96);
    textObj.set('fontSize', next);
  }

  textObj.dirty = true;
  textObj.setCoords();
  canvas.requestRenderAll();
  pushHistoryState();
  updateTextFormatBar(textObj);
}

function normalizeHex(color) {
  if (!color) return '#000000';
  if (color.startsWith('#')) {
    return color.length === 4
      ? '#' + color[1] + color[1] + color[2] + color[2] + color[3] + color[3]
      : color;
  }
  const m = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (m) {
    const toHex = n => parseInt(n, 10).toString(16).padStart(2, '0');
    return '#' + toHex(m[1]) + toHex(m[2]) + toHex(m[3]);
  }
  return '#000000';
}

/* ==========================================================================
   MARCA-TEXTO
   ========================================================================== */
function toggleHighlightPalette(e) {
  if (e) e.stopPropagation();
  const palette = document.getElementById('highlight-palette');
  if (!palette) return;
  palette.classList.toggle('visible');
}

function hideHighlightPalette() {
  const palette = document.getElementById('highlight-palette');
  if (palette) palette.classList.remove('visible');
}

function setupHighlightPaletteOutsideClick() {
  document.addEventListener('click', (e) => {
    const wrapper = document.querySelector('.highlight-wrapper');
    if (!wrapper) return;
    if (!wrapper.contains(e.target)) hideHighlightPalette();
  });
}

function applyHighlight(colorHex) {
  const textObj = getActiveTextObject();
  if (!textObj) { hideHighlightPalette(); return; }

  const sel = getPartialSelection(textObj);
  const value = colorHex === null ? null : colorHex;

  if (sel) {
    applyStyleToRange(textObj, sel.start, sel.end, 'textBackgroundColor', value);
  } else {
    textObj.set('textBackgroundColor', value === null ? '' : value);
  }

  textObj.dirty = true;
  textObj.setCoords();
  canvas.requestRenderAll();
  pushHistoryState();
  updateTextFormatBar(textObj);
  hideHighlightPalette();
}

/* ==========================================================================
   CONTADOR DE PALAVRAS
   ========================================================================== */
function updateCounter() {
  if (!canvas) return;
  const counterEl = document.getElementById('word-counter');
  if (!counterEl) return;

  let fullText = '';
  canvas.getObjects().forEach(obj => {
    if (obj.type === 'textbox' || obj.type === 'i-text' || obj.type === 'text') {
      const t = (obj.text || '').trim();
      if (t) fullText += (fullText ? ' ' : '') + t;
    }
  });

  const chars = fullText.length;
  const words = chars === 0 ? 0 : fullText.split(/\s+/).filter(Boolean).length;

  counterEl.textContent = `${words} palavra${words === 1 ? '' : 's'} · ${chars} caractere${chars === 1 ? '' : 's'}`;
}
