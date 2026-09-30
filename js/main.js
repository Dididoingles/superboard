/* ==========================================================================
   BOOT
   ========================================================================== */
window.addEventListener('load', () => {
  initCanvas();
  setupResizeListener();
  setupKeyboardShortcuts();
  populateIconPicker();
  setupFormatColorInput();
  setupWheelBrushSize();
  setupGlobalTooltips();
  setupHighlightPaletteOutsideClick();
  setupSelectionCaptureOnButtons();
  createKeyboard();
  drawHangman(0);
  updateBrushFill(3);
  setToolMode('text');
  updateCounter();
  updateGridButtonUI();
  updateUndoRedoButtons();
  checkAuthOnLoad();
  pushHistoryState();
});
