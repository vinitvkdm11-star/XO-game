const board = document.getElementById('board');
const status = document.getElementById('status');
const clickSound = document.getElementById('clickSound');

const gameModeSelector = document.getElementById('gameMode');
const difficultySelector = document.getElementById('difficulty');
const playerChoiceSelector = document.getElementById('playerChoice');

const scoreXEl = document.getElementById('scoreX');
const scoreOEl = document.getElementById('scoreO');
const scoreDrawEl = document.getElementById('scoreDraw');

let cells, currentPlayer, gameActive, boardState;
let aiPlayer, humanPlayer;
let scoreX = 0, scoreO = 0, scoreDraw = 0;

function initGame() {
  board.innerHTML = '';
  boardState = Array(9).fill(null);
  currentPlayer = playerChoiceSelector.value;
  humanPlayer = currentPlayer;
  aiPlayer = currentPlayer === 'X' ? 'O' : 'X';
  gameActive = true;

  for (let i = 0; i < 9; i++) {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    cell.dataset.index = i;
    cell.addEventListener('click', handleMove);
    board.appendChild(cell);
  }

  cells = document.querySelectorAll('.cell');
  status.textContent = `${currentPlayer}'s turn`;

  if (gameModeSelector.value === 'ai' && aiPlayer === 'X') {
    setTimeout(makeAIMove, 300);
  }
}

function handleMove(e) {
  const index = e.target.dataset.index;
  if (!gameActive || boardState[index]) return;

  playMove(index, currentPlayer);

  if (checkWin(boardState, currentPlayer)) return endGame(`${currentPlayer} wins!`, true);
  if (boardState.every(cell => cell)) return endGame("It's a draw!");

  if (gameModeSelector.value === 'ai') {
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    status.textContent = `${currentPlayer}'s turn`;
    if (currentPlayer === aiPlayer) {
      setTimeout(makeAIMove, 300);
    }
  } else {
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    status.textContent = `${currentPlayer}'s turn`;
  }
}

function playMove(index, player) {
  boardState[index] = player;
  cells[index].textContent = player;
  cells[index].classList.add(player.toLowerCase());
  clickSound.play();
}

function endGame(msg, showConfetti = false) {
  gameActive = false;
  status.textContent = msg;

  if (msg.includes('X')) scoreX++;
  else if (msg.includes('O')) scoreO++;
  else scoreDraw++;

  updateScores();

  if (showConfetti) {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 }
    });
  }
}

function updateScores() {
  scoreXEl.textContent = scoreX;
  scoreOEl.textContent = scoreO;
  scoreDrawEl.textContent = scoreDraw;
}

function resetScores() {
  scoreX = 0;
  scoreO = 0;
  scoreDraw = 0;
  updateScores();
}

function makeAIMove() {
  const difficulty = difficultySelector.value;
  let move;
  if (difficulty === 'easy') {
    move = getRandomMove();
  } else if (difficulty === 'medium') {
    move = Math.random() < 0.5 ? getRandomMove() : getBestMove();
  } else {
    move = getBestMove();
  }

  playMove(move, aiPlayer);

  if (checkWin(boardState, aiPlayer)) return endGame(`${aiPlayer} wins!`, true);
  if (boardState.every(cell => cell)) return endGame("It's a draw!");

  currentPlayer = humanPlayer;
  status.textContent = `${currentPlayer}'s turn`;
}

function getRandomMove() {
  const empty = boardState.map((v, i) => v ? null : i).filter(v => v !== null);
  return empty[Math.floor(Math.random() * empty.length)];
}

function getBestMove() {
  return minimax(boardState, aiPlayer).index;
}

function minimax(newBoard, player) {
  const empty = newBoard.map((v, i) => v ? null : i).filter(v => v !== null);

  if (checkWin(newBoard, humanPlayer)) return { score: -10 };
  if (checkWin(newBoard, aiPlayer)) return { score: 10 };
  if (empty.length === 0) return { score: 0 };

  const moves = [];

  for (let i of empty) {
    const move = { index: i };
    newBoard[i] = player;
    const result = minimax(newBoard, player === aiPlayer ? humanPlayer : aiPlayer);
    move.score = result.score;
    newBoard[i] = null;
    moves.push(move);
  }

  return player === aiPlayer
    ? moves.reduce((a, b) => (a.score > b.score ? a : b))
    : moves.reduce((a, b) => (a.score < b.score ? a : b));
}

function checkWin(board, player) {
  const wins = [
    [0,1,2], [3,4,5], [6,7,8],
    [0,3,6], [1,4,7], [2,5,8],
    [0,4,8], [2,4,6]
  ];
  return wins.some(combo => combo.every(i => board[i] === player));
}

function toggleMode() {
  document.body.classList.toggle('dark');
}

function resetGame() {
  initGame();
}

gameModeSelector.addEventListener('change', () => {
  const aiControls = document.querySelectorAll('#playerChoice, #difficulty');
  aiControls.forEach(ctrl => ctrl.disabled = gameModeSelector.value !== 'ai');
  initGame();
});

initGame();
