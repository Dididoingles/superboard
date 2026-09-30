/* ==========================================================================
   ATALHOS
   ========================================================================== */
function setupKeyboardShortcuts() {
  window.addEventListener('keydown', (e) => {
    /* Esc sempre sai do modo apresentação */
    if (e.key === 'Escape') {
      if (document.body.classList.contains('presentation-mode')) {
        e.preventDefault();
        exitPresentationMode();
        return;
      }
    }

    const activeModal = document.querySelector('.modal-overlay.active');
    const activeObj = canvas ? canvas.getActiveObject() : null;
    const isEditingText = activeObj && activeObj.isEditing;

    const el = document.activeElement;
    const tag = el ? el.tagName : "";
    const inputType = el ? (el.type || "").toLowerCase() : "";
    const isTypingField =
      tag === "TEXTAREA" ||
      (tag === "INPUT" && ["text", "password", "email", "number", "search", "tel", "url"].includes(inputType));

    if (isTypingField || isEditingText) return;

    if (e.key === 'Enter' && activeModal) {
      e.preventDefault();
      const primaryBtn = activeModal.querySelector('.btn-modal-primary');
      if (primaryBtn) primaryBtn.click();
      return;
    }

    if (e.altKey && e.key.toLowerCase() === 'c') {
      e.preventDefault();
      toggleCaptionMode();
      return;
    }

    /* Ctrl+Shift+Z = redo (vem antes do Ctrl+Z) */
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'z') {
      e.preventDefault();
      redo();
      return;
    }
    if (e.ctrlKey && !e.shiftKey && e.key.toLowerCase() === 'z') {
      e.preventDefault();
      undo();
      return;
    }

    /* Ctrl+S = baixar PNG */
    if (e.ctrlKey && e.key.toLowerCase() === 's') {
      e.preventDefault();
      downloadCanvas();
      return;
    }

    /* Ctrl+L = modo desenho */
    if (e.ctrlKey && e.key.toLowerCase() === 'l') {
      e.preventDefault();
      setToolMode('draw');
      return;
    }

    if (e.key === "Delete") { promptDeleteSelected(); }
  });
}
