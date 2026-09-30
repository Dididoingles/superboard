/* ==========================================================================
   CAPTION MODE (lógica intacta)
   ========================================================================== */
function initCaptionSpeechRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    showLongOperationToast("Speech Recognition is not supported in this browser.");
    return false;
  }

  recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'en-US';

  recognition.onresult = (event) => {
    let interimTranscript = '';
    let finalChunk = '';

    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        finalChunk += event.results[i][0].transcript + ' ';
      } else {
        interimTranscript += event.results[i][0].transcript;
      }
    }

    const combinedText = (finalChunk + interimTranscript).toLowerCase().trim();

    if (!isCaptioningActive && combinedText.includes("caption")) {
      activateCaptioningOnBoard();
      return;
    }

    if (isCaptioningActive && combinedText.includes("stop caption")) {
      if (finalChunk.length > 0) {
        const cleanFinal = finalChunk.replace(/stop caption/gi, '').replace(/caption/gi, '');
        accumulatedTranscript += cleanFinal;
      }
      stopCaptionMode();
      return;
    }

    if (isCaptioningActive) {
      if (finalChunk.length > 0) {
        const cleanChunk = finalChunk.replace(/caption/gi, '');
        accumulatedTranscript += cleanChunk;
      }

      const cleanInterim = interimTranscript.replace(/caption/gi, '');
      const liveDisplay = (accumulatedTranscript + cleanInterim).trim();

      if (liveDisplay.length > 0 && captionTextbox) {
        updateBoardCaptionText(liveDisplay);
      }
    }
  };

  recognition.onerror = (err) => console.error("Speech Recognition Error:", err);

  recognition.onend = () => {
    if (isCaptionModeListening) {
      try { recognition.start(); } catch (e) {}
    }
  };

  return true;
}

function activateCaptioningOnBoard() {
  isCaptioningActive = true;
  accumulatedTranscript = "";
  showLongOperationToast("Caption Mode Activated!");

  const initialWidth = 350;
  const estimatedHeight = 60;
  const freePos = findFreePosition(initialWidth, estimatedHeight);

  const rightMargin = 50;
  const availableWidth = canvas ? (canvas.width - freePos.x - rightMargin) : 600;
  const dynamicMaxWidth = Math.max(availableWidth, 300);

  captionTextbox = new fabric.Textbox("Listening...", {
    left: freePos.x,
    top: freePos.y,
    width: dynamicMaxWidth,
    fontSize: 24,
    fontFamily: 'Poppins, sans-serif',
    fill: '#333333',
    splitByGrapheme: false,
    editable: true
  });

  canvas.add(captionTextbox);
  canvas.setActiveObject(captionTextbox);
  canvas.renderAll();
}

function updateBoardCaptionText(text) {
  if (!captionTextbox || !canvas) return;

  captionTextbox.set('text', text);
  canvas.renderAll();

  const textBottomEdge = captionTextbox.top + captionTextbox.height;
  const maxCanvasHeight = canvas.height - 40;

  if (textBottomEdge >= maxCanvasHeight) {
    limitReachedSound.play().catch(e => console.error("Audio playback error:", e));
    showLongOperationToast("Canvas space limit reached!");
    stopCaptionMode();
  }
}

function stopCaptionMode() {
  isCaptioningActive = false;
  isCaptionModeListening = false;

  if (recognition) {
    try { recognition.abort(); } catch (e) {}
  }

  if (captionTextbox) {
    const finalCleanText = accumulatedTranscript
      .replace(/stop caption/gi, '')
      .replace(/caption/gi, '')
      .trim();

    if (finalCleanText.length > 0) {
      captionTextbox.set('text', finalCleanText);
    }
    canvas.renderAll();
  }

  captionTextbox = null;

  updateCaptionButtonsUI(false);
  showLongOperationToast("Caption Mode Stopped.");
}

function toggleCaptionMode() {
  if (!isCaptionModeListening) {
    if (!recognition) {
      const initialized = initCaptionSpeechRecognition();
      if (!initialized) return;
    }

    isCaptionModeListening = true;
    try { recognition.start(); } catch (e) {}

    updateCaptionButtonsUI(true);
    showLongOperationToast("Listening...");
  } else {
    stopCaptionMode();
  }
}

function updateCaptionButtonsUI(isActive) {
  const drawerBtn = document.getElementById('caption-btn-drawer');
  const headerBtn = document.getElementById('caption-btn-header');

  [drawerBtn, headerBtn].forEach(btn => {
    if (!btn) return;
    if (isActive) {
      btn.classList.add('active-tool', 'active-caption');
    } else {
      btn.classList.remove('active-tool', 'active-caption');
    }
  });
}

/* ==========================================================================
   HELPERS DE POSIÇÃO
   ========================================================================== */
function isOverlapping(rectA, rectB, padding = 20) {
  return !(
    rectA.x + rectA.width + padding < rectB.x ||
    rectA.x > rectB.x + rectB.width + padding ||
    rectA.y + rectA.height + padding < rectB.y ||
    rectA.y > rectB.y + rectB.height + padding
  );
}

function getOccupiedSpaces() {
  if (!canvas) return [];
  return canvas.getObjects().map(obj => {
    const rect = obj.getBoundingRect();
    return { x: rect.left, y: rect.top, width: rect.width, height: rect.height };
  });
}

function findFreePosition(newWidth, newHeight) {
  const occupied = getOccupiedSpaces();
  const startX = 50;
  const startY = 50;
  const step = 20;
  const maxCanvasHeight = (canvas ? canvas.height : 600) - 100;

  let candidate = { x: startX, y: startY, width: newWidth, height: newHeight };
  let hasCollision = true;
  let attempts = 0;
  const maxAttempts = 500;

  while (hasCollision && attempts < maxAttempts) {
    attempts++;
    hasCollision = occupied.some(space => isOverlapping(candidate, space));
    if (hasCollision) {
      candidate.y += step;
      if (candidate.y + candidate.height > maxCanvasHeight) {
        candidate.y = startY;
        candidate.x += step * 6;
      }
    }
  }

  return { x: candidate.x, y: candidate.y };
}
