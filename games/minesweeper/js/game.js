/**
 * Minesweeper — Game Logic
 */

const CONFIG = {
  easy: { rows: 9, cols: 9, mines: 10 },
  medium: { rows: 16, cols: 16, mines: 40 },
  hard: { rows: 16, cols: 30, mines: 99 }
};

class Minesweeper {
  constructor(difficulty = 'easy') {
    this.difficulty = difficulty;
    this.init();
  }

  init() {
    const { rows, cols, mines } = CONFIG[this.difficulty];
    this.rows = rows;
    this.cols = cols;
    this.mineCount = mines;
    this.grid = [];
    this.isGameOver = false;
    this.isFirstClick = true;
    this.timer = 0;
    this.flagsPlaced = 0;
    this.cellsRevealed = 0;

    this.createGrid();
  }

  createGrid() {
    this.grid = [];
    for (let r = 0; r < this.rows; r++) {
      const row = [];
      for (let c = 0; c < this.cols; c++) {
        row.push({
          r, c,
          isMine: false,
          isRevealed: false,
          isFlagged: false,
          neighborMines: 0
        });
      }
      this.grid.push(row);
    }
  }

  placeMines(excludeR, excludeC) {
    let placed = 0;
    while (placed < this.mineCount) {
      const r = Math.floor(Math.random() * this.rows);
      const c = Math.floor(Math.random() * this.cols);

      // Don't place on first click or already placed
      if ((r === excludeR && c === excludeC) || this.grid[r][c].isMine) continue;
      
      // Don't place in immediate neighbors of first click for a better start
      if (Math.abs(r - excludeR) <= 1 && Math.abs(c - excludeC) <= 1) continue;

      this.grid[r][c].isMine = true;
      placed++;
    }

    this.calculateNeighbors();
  }

  calculateNeighbors() {
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (this.grid[r][c].isMine) continue;
        let count = 0;
        this.getNeighbors(r, c).forEach(n => {
          if (n.isMine) count++;
        });
        this.grid[r][c].neighborMines = count;
      }
    }
  }

  getNeighbors(r, c) {
    const neighbors = [];
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < this.rows && nc >= 0 && nc < this.cols) {
          neighbors.push(this.grid[nr][nc]);
        }
      }
    }
    return neighbors;
  }

  revealCell(r, c) {
    if (this.isGameOver || this.grid[r][c].isRevealed || this.grid[r][c].isFlagged) return;

    if (this.isFirstClick) {
      this.isFirstClick = false;
      this.placeMines(r, c);
    }

    const cell = this.grid[r][c];
    cell.isRevealed = true;
    this.cellsRevealed++;

    if (cell.isMine) {
      this.isGameOver = true;
      return 'gameover';
    }

    if (cell.neighborMines === 0) {
      this.getNeighbors(r, c).forEach(n => this.revealCell(n.r, n.c));
    }

    if (this.checkWin()) {
      this.isGameOver = true;
      return 'win';
    }

    return 'continue';
  }

  toggleFlag(r, c) {
    if (this.isGameOver || this.grid[r][c].isRevealed) return;
    const cell = this.grid[r][c];
    cell.isFlagged = !cell.isFlagged;
    this.flagsPlaced += cell.isFlagged ? 1 : -1;
  }

  checkWin() {
    return this.cellsRevealed === (this.rows * this.cols - this.mineCount);
  }
}
