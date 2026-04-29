/**
 * Minesweeper — UI Controller
 */

(function() {
  let game = new Minesweeper();
  let timerInterval = null;

  const gridEl = document.getElementById('mine-grid');
  const mineCounterEl = document.getElementById('mine-counter');
  const timerEl = document.getElementById('timer');
  const faceBtn = document.getElementById('face-btn');
  const diffDropdown = document.getElementById('diff-dropdown');
  const scoreEl = document.getElementById('current-score');
  const highScoreEl = document.getElementById('high-score');

  function renderGrid() {
    gridEl.style.gridTemplateColumns = `repeat(${game.cols}, 24px)`;
    gridEl.innerHTML = '';

    for (let r = 0; r < game.rows; r++) {
      for (let c = 0; c < game.cols; c++) {
        const cellData = game.grid[r][c];
        const cellEl = document.createElement('div');
        cellEl.className = 'cell';
        cellEl.dataset.r = r;
        cellEl.dataset.c = c;

        if (cellData.isRevealed) {
          cellEl.classList.add('revealed');
          if (cellData.isMine) {
            cellEl.classList.add('mine');
          } else if (cellData.neighborMines > 0) {
            cellEl.textContent = cellData.neighborMines;
            cellEl.dataset.num = cellData.neighborMines;
          }
        } else if (cellData.isFlagged) {
          cellEl.classList.add('flagged');
        }

        cellEl.addEventListener('click', () => handleCellClick(r, c));
        cellEl.addEventListener('contextmenu', (e) => {
          e.preventDefault();
          handleRightClick(r, c);
        });

        gridEl.appendChild(cellEl);
      }
    }
    updateStats();
  }

  function handleCellClick(r, c) {
    if (game.isGameOver) return;
    
    // Start timer on first move
    if (game.isFirstClick) {
      startTimer();
    }

    const result = game.revealCell(r, c);
    renderGrid();

    if (result === 'gameover') {
      stopTimer();
      faceBtn.textContent = '😵';
      revealAllMines();
    } else if (result === 'win') {
      stopTimer();
      faceBtn.textContent = '😎';
      saveHighScore();
    }
  }

  function handleRightClick(r, c) {
    if (game.isGameOver) return;
    game.toggleFlag(r, c);
    renderGrid();
  }

  function updateStats() {
    const remaining = Math.max(0, game.mineCount - game.flagsPlaced);
    mineCounterEl.textContent = String(remaining).padStart(3, '0');
    scoreEl.textContent = game.cellsRevealed;
  }

  function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    game.timer = 0;
    timerInterval = setInterval(() => {
      game.timer++;
      if (game.timer > 999) game.timer = 999;
      timerEl.textContent = String(game.timer).padStart(3, '0');
    }, 1000);
  }

  function stopTimer() {
    clearInterval(timerInterval);
  }

  function resetGame() {
    stopTimer();
    timerEl.textContent = '000';
    faceBtn.textContent = '😊';
    game = new Minesweeper(diffDropdown.value);
    renderGrid();
  }

  function revealAllMines() {
    for (let r = 0; r < game.rows; r++) {
      for (let c = 0; c < game.cols; c++) {
        if (game.grid[r][c].isMine) {
          game.grid[r][c].isRevealed = true;
        }
      }
    }
    renderGrid();
  }

  function saveHighScore() {
    const current = game.cellsRevealed;
    const best = parseInt(localStorage.getItem(`minesweeper_best_${game.difficulty}`)) || 0;
    if (current > best) {
      localStorage.setItem(`minesweeper_best_${game.difficulty}`, current);
      // For general hub ranking
      localStorage.setItem('minesweeper_highscore', current);
    }
    loadHighScore();
  }

  function loadHighScore() {
    const best = localStorage.getItem(`minesweeper_best_${game.difficulty}`) || 0;
    highScoreEl.textContent = best;
  }

  // Event Listeners
  faceBtn.addEventListener('click', resetGame);
  diffDropdown.addEventListener('change', resetGame);

  // Init
  loadHighScore();
  renderGrid();
})();
