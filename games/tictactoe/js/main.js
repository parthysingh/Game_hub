/**
 * Ultimate Tic-Tac-Toe — UI Controller
 */

(function() {
  const game = new UltimateGame();
  const boardEl = document.getElementById('ultimate-board');
  const smallBoardEls = document.querySelectorAll('.small-board');
  
  const turnIndicator = document.getElementById('turn-indicator');
  const moveStatus = document.getElementById('move-status');
  const restartBtn = document.getElementById('restart-btn');
  const overlay = document.getElementById('overlay');
  const statusMsg = document.getElementById('status-msg');
  const playAgainBtn = document.getElementById('play-again-btn');
  const scoreXEl = document.getElementById('score-x');
  const scoreOEl = document.getElementById('score-o');
  const modeBtns = document.querySelectorAll('.mode-btn');
  
  const dynamicHintText = document.getElementById('dynamic-hint-text');

  function init() {
    // Generate 9 cells for each small board
    smallBoardEls.forEach(board => {
      board.innerHTML = '';
      for (let i = 0; i < 9; i++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.index = i;
        cell.addEventListener('click', () => handleCellClick(board.dataset.board, i));
        board.appendChild(cell);
      }
    });

    modeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        modeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        game.gameMode = btn.dataset.mode;
        reset();
      });
    });

    restartBtn.addEventListener('click', reset);
    playAgainBtn.addEventListener('click', reset);

    updateUI();
  }

  function handleCellClick(boardIdx, cellIdx) {
    if (game.isGameOver) return;
    if (game.gameMode === 'ai' && game.currentPlayer === 'O') return;

    if (game.makeMove(parseInt(boardIdx), parseInt(cellIdx))) {
      updateUI();
      
      if (!game.isGameOver && game.gameMode === 'ai' && game.currentPlayer === 'O') {
        setTimeout(handleAiTurn, 600);
      }
    }
  }

  function handleAiTurn() {
    if (game.isGameOver) return;
    
    const move = game.getAiMove();
    if (move) {
      game.makeMove(move.b, move.c);
      updateUI();
    }
  }

  function updateUI() {
    smallBoardEls.forEach((boardEl, bIdx) => {
      const cells = boardEl.querySelectorAll('.cell');
      const boardData = game.boards[bIdx];
      const winner = game.globalBoard[bIdx];

      // Update cells
      cells.forEach((cell, cIdx) => {
        cell.textContent = boardData[cIdx] || '';
        cell.dataset.symbol = boardData[cIdx] || '';
        cell.classList.toggle('taken', boardData[cIdx] !== null);
      });

      // Update board state
      boardEl.classList.toggle('active', !game.isGameOver && (game.activeBoardIndex === -1 || game.activeBoardIndex === bIdx) && !winner);
      boardEl.classList.toggle('won', winner !== null);
      if (winner) boardEl.dataset.winner = winner;
      else boardEl.removeAttribute('data-winner');
    });

    // Info
    turnIndicator.textContent = `${game.currentPlayer}'s Turn`;
    turnIndicator.style.color = game.currentPlayer === 'X' ? 'var(--x-color)' : 'var(--o-color)';
    
    if (game.activeBoardIndex === -1) {
      moveStatus.textContent = 'Play anywhere';
      dynamicHintText.textContent = 'You can play anywhere';
    } else {
      const boardNum = game.activeBoardIndex + 1;
      moveStatus.textContent = `Play in board ${boardNum}`;
      dynamicHintText.textContent = `You must play in board ${boardNum}`;
    }

    scoreXEl.textContent = game.scores.X;
    scoreOEl.textContent = game.scores.O;

    // Game Over
    if (game.isGameOver) {
      const winner = game.checkWinner(game.globalBoard);
      if (winner === 'draw') {
        statusMsg.textContent = "IT'S A DRAW!";
      } else {
        statusMsg.textContent = `${winner} WINS THE GAME!`;
      }
      overlay.classList.remove('hidden');
    }
  }

  function reset() {
    game.boards = Array(9).fill(null).map(() => Array(9).fill(null));
    game.globalBoard = Array(9).fill(null);
    game.currentPlayer = 'X';
    game.activeBoardIndex = -1;
    game.isGameOver = false;
    overlay.classList.add('hidden');
    updateUI();
  }

  init();
})();
