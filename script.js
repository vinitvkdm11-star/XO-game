const board = document.getElementById('board');
const status = document.getElementById('status');
const clickSound = document.getElementById('clickSound');
const confettiCanvas = document.getElementById('confetti');

const difficultySelector = document.getElementById('difficulty');
const playerChoiceSelector = document.getElementById('playerChoice');

let cells, currentPlayer, gameActive, boardState, aiPlayer, humanPlayer;

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

  if (aiPlayer === 'X') makeAIMove();
}

function handleMove(e) {
  const index = e.target.dataset.index;
  if (!gameActive || boardState[index]) return;
  playMove(index, currentPlayer);
  if (checkWin(boardState, currentPlayer)) return endGame(`${currentPlayer} wins!`, true);
  if (boardState.every(cell => cell)) return endGame("It's a draw!");
  currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
  status.textContent = `${currentPlayer}'s turn`;

  if (currentPlayer === aiPlayer) setTimeout(makeAIMove, 300);
}

function playMove(index, player) {
  boardState[index] = player;
  cells[index].textContent = player;
  cells[index].classList.add(player.toLowerCase()); // ← 👈 Add this line
  clickSound.play();
}


function endGame(msg, showConfetti = false) {
  gameActive = false;
  status.textContent = msg;
  if (showConfetti) confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
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
  const empty = boardState.map((val, idx) => val ? null : idx).filter(v => v !== null);
  return empty[Math.floor(Math.random() * empty.length)];
}

function getBestMove() {
  return minimax(boardState, aiPlayer).index;
}

function minimax(newBoard, player) {
  const empty = newBoard.map((val, idx) => val ? null : idx).filter(v => v !== null);
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

// Optional: Lottie girl animations (you can re-add later if needed)
/*
function loadLottie(id, url) {
  lottie.loadAnimation({
    container: document.getElementById(id),
    renderer: 'svg',
    loop: true,
    autoplay: true,
    path: url
  });
}
loadLottie('lottie-left', 'URL.json');
loadLottie('lottie-right', 'URL.json');
*/

initGame();

