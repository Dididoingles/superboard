/* ==========================================================================
   HISTÓRICO / UNDO / REDO
   ========================================================================== */
function pushHistoryState() {
  if (!canvas || !canvas.toJSON || isRestoringState) return;

  const state = JSON.stringify(canvas);

  if (historyIndex < history.length - 1) {
    history = history.slice(0, historyIndex + 1);
  }

  if (history.length > 0 && history[history.length - 1] === state) return;

  history.push(state);
  if (history.length > MAX_HISTORY_STEPS) history.shift();
  historyIndex = history.length - 1;
  updateUndoRedoButtons();
}

function undo() {
  if (historyIndex <= 0) return;
  historyIndex--;
  restoreStateFromHistory();
}

function redo() {
  if (historyIndex >= history.length - 1) return;
  historyIndex++;
  restoreStateFromHistory();
}

function restoreStateFromHistory() {
  const state = history[historyIndex];
  isRestoringState = true;
  canvas.loadFromJSON(state, () => {
    canvas.renderAll();
    applyCanvasBackground();
    isRestoringState = false;
    updateUndoRedoButtons();
    updateCounter();
  });
}

function updateUndoRedoButtons() {
  const redoBtn = document.getElementById('redoBtn');
  if (!redoBtn) return;
  if (historyIndex >= history.length - 1) {
    redoBtn.classList.add('disabled');
  } else {
    redoBtn.classList.remove('disabled');
  }
}

/* ==========================================================================
   AÇÕES DO QUADRO
   ========================================================================== */
function promptClearBoard() {
  openConfirmModal(
    "Limpar quadro",
    "Tem certeza de que deseja apagar todo o conteúdo do quadro?",
    () => {
      canvas.clear();
      applyCanvasBackground();
      canvas.renderAll();
      history = [];
      historyIndex = -1;
      pushHistoryState();
      hideTextFormatBar();
      lastActiveTextObj = null;
      updateCounter();
    }
  );
}

function promptDeleteSelected() {
  const activeObjects = canvas.getActiveObjects();
  if (!activeObjects.length) return;

  openConfirmModal(
    "Excluir elementos",
    `Deseja remover os ${activeObjects.length} item(ns) selecionados?`,
    () => {
      activeObjects.forEach(obj => canvas.remove(obj));
      canvas.discardActiveObject().renderAll();
      hideTextFormatBar();
      lastActiveTextObj = null;
      updateCounter();
    }
  );
}
