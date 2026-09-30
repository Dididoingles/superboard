/* ==========================================================================
   AUTH + IA
   ========================================================================== */
function getStoredToken() {
  return localStorage.getItem('superboard_token') || "";
}

/* ==========================================================================
   SELEÇÃO PARCIAL
   ========================================================================== */
function setupSelectionCaptureOnButtons() {
  const buttons = document.querySelectorAll(
    '#text-format-bar button[onclick*="triggerAi"], ' +
    '.side-item[onclick*="triggerAi"]'
  );

  buttons.forEach(btn => {
    btn.addEventListener('mousedown', (e) => {
      e.preventDefault();
      const obj = getActiveTextObject();
      if (obj && obj.isEditing &&
          typeof obj.selectionStart === 'number' &&
          typeof obj.selectionEnd === 'number' &&
          obj.selectionEnd > obj.selectionStart) {
        savedTextSelection = obj.text.substring(obj.selectionStart, obj.selectionEnd);
      } else {
        savedTextSelection = null;
      }
    });
  });
}

function getSelectedTextOrPrompt() {
  /* 1. Seleção parcial salva tem prioridade */
  if (savedTextSelection && savedTextSelection.trim()) {
    const q = savedTextSelection.trim();
    savedTextSelection = null;
    return q;
  }

  /* 2. Texto inteiro do objeto ativo */
  const activeObj = canvas ? canvas.getActiveObject() : null;
  if (activeObj && (activeObj.type === 'textbox' || activeObj.type === 'text' || activeObj.type === 'i-text')) {
    return activeObj.text;
  }

  /* 3. Último texto ativo */
  if (lastActiveTextObj && canvas.getObjects().includes(lastActiveTextObj)) {
    return lastActiveTextObj.text;
  }

  return null;
}

/* ==========================================================================
   REQUISIÇÃO À IA
   ========================================================================== */
async function executeAiRequest(actionType, promptText, extraParam = null) {
  const userToken = getStoredToken();

  if (!userToken) {
    showLongOperationToast("Acesso negado. Digite a senha primeiro.");
    openModal('authModal');
    return;
  }

  if (actionType !== "verifyToken" && (!promptText || !promptText.trim())) {
    showLongOperationToast("Selecione um texto no quadro primeiro!");
    return;
  }

  if (actionType !== "verifyToken") {
    showLongOperationToast("Processando...");
  }

  try {
    const response = await fetch(BACKEND_URL, {
      method: "POST",
      mode: "cors",
      redirect: "follow",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        actionType,
        promptText: promptText || "verify",
        extraParam,
        authToken: userToken,
        origin: window.location.origin
      })
    });

    const result = await response.json();

    if (result.success) {
      if (actionType === "verifyToken") {
        closeModal('authModal');
        showLongOperationToast("Acesso liberado com sucesso!");
        return true;
      }

      const activeObj = canvas.getActiveObject() ||
                        (lastActiveTextObj && canvas.getObjects().includes(lastActiveTextObj) ? lastActiveTextObj : null);
      const left = activeObj ? activeObj.left + activeObj.width + 20 : 120;
      const top = activeObj ? activeObj.top : 120;

      addAiResponseToBoard(result.response, left, top);
    } else {
      showLongOperationToast("Erro: " + (result.error || "Falha na requisição"));
      if (result.error && result.error.toLowerCase().includes("unauthorized")) {
        localStorage.removeItem('superboard_token');
        openModal('authModal');
      }
      return false;
    }
  } catch (error) {
    showLongOperationToast("Erro de conexão! Verifique sua internet.");
    console.error("AI Request Failed:", error);
    return false;
  }
}

function checkAuthOnLoad() {
  const savedToken = getStoredToken();
  if (savedToken) {
    executeAiRequest("verifyToken", "check");
  } else {
    openModal('authModal');
  }
}

async function saveAuthToken() {
  const input = document.getElementById('auth-token-input');
  const token = input.value.trim();
  const confirmBtn = document.getElementById('authModalConfirmBtn');

  if (!token) {
    showLongOperationToast("Por favor, digite a chave de acesso.");
    return;
  }

  const originalText = confirmBtn.innerHTML;
  confirmBtn.disabled = true;
  confirmBtn.classList.add('btn-loading');
  confirmBtn.innerHTML = '<span class="btn-spinner"></span>';

  localStorage.setItem('superboard_token', token);
  const isValid = await executeAiRequest("verifyToken", "check");

  if (!isValid) input.value = "";

  confirmBtn.disabled = false;
  confirmBtn.classList.remove('btn-loading');
  confirmBtn.innerHTML = originalText;
}

/* ==========================================================================
   TRIGGERS
   ========================================================================== */
function triggerAiTranslate() {
  const text = getSelectedTextOrPrompt();
  if (!text || !text.trim()) { showLongOperationToast("Selecione um texto primeiro!"); return; }
  executeAiRequest("translate", text);
}

function triggerAiCorrection() {
  const text = getSelectedTextOrPrompt();
  if (!text || !text.trim()) { showLongOperationToast("Selecione um texto primeiro!"); return; }
  executeAiRequest("correct", text);
}

function triggerAiExamples() {
  const text = getSelectedTextOrPrompt();
  if (!text || !text.trim()) { showLongOperationToast("Selecione uma palavra ou frase!"); return; }
  executeAiRequest("examples", text);
}

function triggerAiDialogue() {
  const text = getSelectedTextOrPrompt();
  if (!text || !text.trim()) { showLongOperationToast("Selecione um tópico no quadro!"); return; }
  openModal('dialogueModal');
}

function submitDialogueRequest(level) {
  closeModal('dialogueModal');
  const text = getSelectedTextOrPrompt();
  if (!text || !text.trim()) {
    showLongOperationToast("Selecione um tópico no quadro!");
    return;
  }
  executeAiRequest("dialogue", text, level);
}

/* ==========================================================================
   ADICIONAR RESPOSTA AO QUADRO
   ========================================================================== */
function addAiResponseToBoard(responseContent, sourceObjLeft = 100, sourceObjTop = 100) {
  if (!responseContent || responseContent.trim() === "") {
    showLongOperationToast("Nenhuma resposta recebida da IA.");
    return;
  }

  const aiTextbox = new fabric.Textbox(responseContent, {
    left: sourceObjLeft,
    top: sourceObjTop,
    width: 320,
    fontSize: 16,
    fontFamily: 'Poppins, sans-serif',
    fill: '#000000',
    backgroundColor: 'transparent',
    padding: 8,
    borderColor: '#c00000',
    cornerColor: '#c00000',
    cornerSize: 8,
    transparentCorners: false,
    splitByGrapheme: false,
    shadow: new fabric.Shadow({ color: 'rgba(0,0,0,0.1)', blur: 10, offsetX: 2, offsetY: 4 })
  });

  canvas.add(aiTextbox);
  canvas.setActiveObject(aiTextbox);
  canvas.isDrawingMode = false;
  updateDrawingBtnUI();
  canvas.renderAll();
}
