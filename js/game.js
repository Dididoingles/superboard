/* ==========================================================================
   FORCA
   ========================================================================== */
let secretWord = "", guessedLetters = [], errors = 0, usedWords = [];

function createKeyboard() {
  const kb = document.getElementById('game-keyboard');
  kb.innerHTML = '';
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('').forEach(l => {
    const btn = document.createElement('button');
    btn.className = 'key-btn';
    btn.innerText = l;
    btn.onclick = () => makeGuess(l, btn);
    kb.appendChild(btn);
  });
}

function startHangman() {
  const allTexts = canvas.getObjects().filter(obj =>
    (obj.type === 'text' || obj.type === 'i-text' || obj.type === 'textbox') &&
    obj.text.trim().length > 0
  );

  if (allTexts.length === 0) {
    openConfirmModal("Modo game", "Board vazio: Escreva algumas palavras no quadro primeiro para jogar!", () => {});
    return;
  }

  let wordsArray = [];
  allTexts.forEach(obj => {
    const wordsInObject = obj.text.trim().toUpperCase().split(/\s+/);
    wordsInObject.forEach(word => {
      const cleanWord = word.replace(/[^A-ZÀ-Ú]/g, "");
      if (cleanWord.length > 1) wordsArray.push(cleanWord);
    });
  });

  wordsArray = [...new Set(wordsArray)];
  if (wordsArray.length === 0) {
    openConfirmModal("Modo game", "Não foram encontradas palavras válidas no quadro.", () => {});
    return;
  }

  if (usedWords.length >= wordsArray.length) usedWords = [];

  const availableWords = wordsArray.filter(w => !usedWords.includes(w));
  secretWord = availableWords[Math.floor(Math.random() * availableWords.length)];
  usedWords.push(secretWord);

  guessedLetters = [];
  errors = 0;
  document.getElementById('game-message').innerHTML = "";
  document.getElementById('game-message').style.color = "";
  createKeyboard();
  drawHangman(0);
  updateHangmanDisplay();
}

function makeGuess(letter, btn) {
  if (!secretWord || guessedLetters.includes(letter) || errors >= 6) return;
  guessedLetters.push(letter);
  btn.style.visibility = 'hidden';
  if (!secretWord.includes(letter)) errors++;
  drawHangman(errors);
  updateHangmanDisplay();
  checkGameOver();
}

function updateHangmanDisplay() {
  document.getElementById('hangman-word-display').innerText =
    secretWord.split('').map(l => guessedLetters.includes(l) ? l : '_').join(' ');
}

function checkGameOver() {
  const msg = document.getElementById('game-message');
  const isWin = secretWord && !document.getElementById('hangman-word-display').innerText.includes('_');
  if (errors >= 6) {
    msg.innerHTML = `A palavra era: <strong>${secretWord}</strong>`;
    msg.style.color = "#c00000";
  } else if (isWin) {
    msg.innerText = "Parabéns!";
    msg.style.color = "green";
  }
}

function drawHangman(step) {
  const c = document.getElementById('hangman-canvas').getContext('2d');
  c.clearRect(0, 0, 200, 250);
  c.lineWidth = 3;
  c.strokeStyle = '#333';
  c.beginPath();
  c.moveTo(20, 200); c.lineTo(160, 200);
  c.moveTo(40, 200); c.lineTo(40, 10); c.lineTo(110, 10); c.lineTo(110, 30);
  c.stroke();
  if (step > 0) { c.beginPath(); c.arc(110, 50, 20, 0, Math.PI * 2); c.stroke(); }
  if (step > 1) { c.beginPath(); c.moveTo(110, 70); c.lineTo(110, 140); c.stroke(); }
  if (step > 2) { c.beginPath(); c.moveTo(110, 85); c.lineTo(80, 110); c.stroke(); }
  if (step > 3) { c.beginPath(); c.moveTo(110, 85); c.lineTo(140, 110); c.stroke(); }
  if (step > 4) { c.beginPath(); c.moveTo(110, 140); c.lineTo(80, 180); c.stroke(); }
  if (step > 5) { c.beginPath(); c.moveTo(110, 140); c.lineTo(140, 180); c.stroke(); }
}
