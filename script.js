const DOM = {
  wpm: document.getElementById('wpm-val'),
  acc: document.getElementById('acc-val'),
  time: document.getElementById('time-val'),
  pb: document.getElementById('pb-val'),
  textDisplay: document.getElementById('text-display'),
  startOverlay: document.getElementById('start-overlay'),
  startBtn: document.getElementById('start-btn'),
  hiddenInput: document.getElementById('hidden-input'),
  restartBtn: document.getElementById('restart-test-btn'),
  typingSection: document.getElementById('typing-section'),
  resultsSection: document.getElementById('results-section'),
  diffBtns: document.querySelectorAll('.diff-btn'),
  modeBtns: document.querySelectorAll('.mode-btn'),
  goAgainBtn: document.getElementById('go-again-btn')
};

let state = {
  passages: {},
  status: 'idle', // idle, playing, finished
  difficulty: 'medium',
  mode: 'timed',
  timeLeft: 60,
  timeElapsed: 0,
  timer: null,
  targetText: '',
  chars: [],
  currentIndex: 0,
  mistakes: 0,
  totalKeystrokes: 0,
  personalBest: localStorage.getItem('typingPB') || 0
};

DOM.pb.innerText = state.personalBest;

// Fetch data
fetch('./data.json')
  .then(res => res.json())
  .then(data => {
    state.passages = data;
    initTest();
  })
  .catch(err => console.error("Error loading data.json", err));

// Event Listeners
DOM.startBtn.addEventListener('click', startTyping);
DOM.textDisplay.addEventListener('click', startTyping);
DOM.hiddenInput.addEventListener('input', handleInput);
DOM.restartBtn.addEventListener('click', initTest);
DOM.goAgainBtn.addEventListener('click', initTest);

DOM.diffBtns.forEach(btn => {
  btn.addEventListener('click', (e) => {
    DOM.diffBtns.forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    state.difficulty = e.target.dataset.diff;
    initTest();
  });
});

DOM.modeBtns.forEach(btn => {
  btn.addEventListener('click', (e) => {
    DOM.modeBtns.forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    state.mode = e.target.dataset.mode;
    initTest();
  });
});

function initTest() {
  clearInterval(state.timer);
  state.status = 'idle';
  state.timeElapsed = 0;
  state.timeLeft = state.mode === 'timed' ? 60 : 0;
  state.currentIndex = 0;
  state.mistakes = 0;
  state.totalKeystrokes = 0;
  DOM.hiddenInput.value = '';

  updateStatsUI();
  DOM.typingSection.classList.remove('hidden');
  DOM.resultsSection.classList.add('hidden');
  DOM.startOverlay.classList.remove('hidden');
  DOM.textDisplay.classList.add('blurred');
  DOM.restartBtn.classList.add('hidden');

  const passagesArr = state.passages[state.difficulty];
  if(!passagesArr) return;
  const p = passagesArr[Math.floor(Math.random() * passagesArr.length)].text;
  state.targetText = p;
  renderText();
}

function renderText() {
  DOM.textDisplay.innerHTML = '';
  state.chars = state.targetText.split('').map(char => {
    const span = document.createElement('span');
    span.innerText = char;
    span.className = 'char';
    DOM.textDisplay.appendChild(span);
    return span;
  });
}

function startTyping() {
  if (state.status === 'playing') {
    DOM.hiddenInput.focus();
    return;
  }
  state.status = 'playing';
  DOM.startOverlay.classList.add('hidden');
  DOM.textDisplay.classList.remove('blurred');
  DOM.restartBtn.classList.remove('hidden');
  DOM.hiddenInput.focus();
  state.chars[0].classList.add('current');

  state.timer = setInterval(() => {
    state.timeElapsed++;
    if (state.mode === 'timed') {
      state.timeLeft--;
      if (state.timeLeft <= 0) endGame();
    }
    updateStatsUI();
  }, 1000);
}

function handleInput(e) {
  if (state.status !== 'playing') return;
  const inputVal = e.target.value;
  const inputChar = inputVal.slice(-1);
  const targetChar = state.targetText[state.currentIndex];

  if (e.inputType === 'insertText') {
    state.totalKeystrokes++;
    state.chars[state.currentIndex].classList.remove('current');
    
    if (inputChar === targetChar) {
      state.chars[state.currentIndex].classList.add('correct');
    } else {
      state.chars[state.currentIndex].classList.add('incorrect');
      state.mistakes++;
    }
    state.currentIndex++;
  } else if (e.inputType === 'deleteContentBackward' && state.currentIndex > 0) {
    state.chars[state.currentIndex].classList.remove('current');
    if (state.chars[state.currentIndex - 1].classList.contains('incorrect')) {
      state.mistakes--;
    }
    state.currentIndex--;
    state.chars[state.currentIndex].className = 'char';
  }

  if (state.currentIndex < state.targetText.length) {
    state.chars[state.currentIndex].classList.add('current');
  } else if (state.mode === 'passage' || state.currentIndex === state.targetText.length) {
    endGame();
  }
  updateStatsUI();
}

function updateStatsUI() {
  const mins = state.timeElapsed / 60;
  const correctChars = Math.max(0, state.currentIndex - state.mistakes);
  const wpm = mins > 0 ? Math.round((correctChars / 5) / mins) : 0;
  const acc = state.currentIndex > 0 ? Math.round((correctChars / state.currentIndex) * 100) : 100;
  
  DOM.wpm.innerText = wpm > 0 ? wpm : 0;
  DOM.acc.innerText = acc + '%';
  
  if (state.mode === 'timed') {
    DOM.time.innerText = '0:' + state.timeLeft.toString().padStart(2, '0');
  } else {
    const m = Math.floor(state.timeElapsed / 60);
    const s = state.timeElapsed % 60;
    DOM.time.innerText = m + ':' + s.toString().padStart(2, '0');
  }
}

function endGame() {
  clearInterval(state.timer);
  state.status = 'finished';
  DOM.typingSection.classList.add('hidden');
  DOM.resultsSection.classList.remove('hidden');

  const mins = state.timeElapsed / 60;
  const correctChars = Math.max(0, state.currentIndex - state.mistakes);
  const finalWpm = Math.max(0, Math.round((correctChars / 5) / mins));
  const finalAcc = state.currentIndex > 0 ? Math.round((correctChars / state.currentIndex) * 100) : 100;

  document.getElementById('r-wpm').innerText = finalWpm;
  document.getElementById('r-acc').innerText = finalAcc + '%';
  document.getElementById('r-char-correct').innerText = correctChars;
  document.getElementById('r-char-incorrect').innerText = state.mistakes;

  let isNewPb = false;
  let isFirstTest = state.personalBest == 0;

  if (finalWpm > state.personalBest) {
    isNewPb = true;
    state.personalBest = finalWpm;
    localStorage.setItem('typingPB', finalWpm);
    DOM.pb.innerText = finalWpm;
  }

  const title = document.getElementById('result-title');
  const subtitle = document.getElementById('result-subtitle');
  const icon = document.getElementById('result-icon-img');
  const goAgain = document.getElementById('go-again-btn');

  if (isFirstTest) {
    title.innerText = 'Baseline Established!';
    subtitle.innerText = "You've set the bar. Now the real challenge begins—time to beat it.";
    icon.src = './assets/images/icon-completed.svg';
    goAgain.innerHTML = 'Beat This Score <img src="./assets/images/icon-restart.svg">';
  } else if (isNewPb) {
    title.innerText = 'High Score Smashed!';
    subtitle.innerText = "You're getting faster. That was incredible typing.";
    icon.src = './assets/images/icon-new-pb.svg';
    goAgain.innerHTML = 'Beat This Score <img src="./assets/images/icon-restart.svg">';
  } else {
    title.innerText = 'Test Complete!';
    subtitle.innerText = "Solid run. Keep pushing to beat your high score.";
    icon.src = './assets/images/icon-completed.svg';
    goAgain.innerHTML = 'Go Again <img src="./assets/images/icon-restart.svg">';
  }
}
