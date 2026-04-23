/**
 * Ultimate Tic-Tac-Toe — Game Logic
 */

class UltimateGame {
  constructor() {
    // 9 boards, each with 9 cells
    this.boards = Array(9).fill(null).map(() => Array(9).fill(null));
    // The "Big" board tracking who won each small board
    this.globalBoard = Array(9).fill(null);
    
    this.currentPlayer = 'X';
    this.activeBoardIndex = -1; // -1 means player can play anywhere
    this.isGameOver = false;
    this.gameMode = 'ai'; // 'ai' or 'pvp'
    
    this.scores = { X: 0, O: 0 };
    this.loadScores();

    this.winConditions = [
      [0,1,2], [3,4,5], [6,7,8], // Rows
      [0,3,6], [1,4,7], [2,5,8], // Cols
      [0,4,8], [2,4,6]           // Diagonals
    ];
  }

  makeMove(boardIdx, cellIdx) {
    if (this.isGameOver) return false;
    
    // Check if move is in the active board (or anywhere if -1)
    if (this.activeBoardIndex !== -1 && boardIdx !== this.activeBoardIndex) return false;
    
    // Check if board is already won or cell is taken
    if (this.globalBoard[boardIdx] || this.boards[boardIdx][cellIdx]) return false;

    // Place move
    this.boards[boardIdx][cellIdx] = this.currentPlayer;
    
    // Check sub-board win
    const subWinner = this.checkWinner(this.boards[boardIdx]);
    if (subWinner && !this.globalBoard[boardIdx]) {
      this.globalBoard[boardIdx] = subWinner === 'draw' ? 'D' : subWinner;
      
      // Check global win
      const globalWinner = this.checkWinner(this.globalBoard);
      if (globalWinner) {
        this.isGameOver = true;
        if (globalWinner !== 'draw') this.scores[globalWinner]++;
        this.saveScores();
      }
    }

    // Determine next active board
    // If the board corresponding to cellIdx is already finished, next player can go anywhere
    if (this.globalBoard[cellIdx] !== null) {
      this.activeBoardIndex = -1;
    } else {
      this.activeBoardIndex = cellIdx;
    }

    // Switch player
    this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
    return true;
  }

  checkWinner(board) {
    for (const [a, b, c] of this.winConditions) {
      if (board[a] && board[a] === board[b] && board[a] === board[c] && board[a] !== 'D') {
        return board[a];
      }
    }
    if (!board.includes(null)) return 'draw';
    return null;
  }

  /* ---- AI LOGIC (Hard) ---- */

  getAiMove() {
    const validMoves = this.getValidMoves();
    if (validMoves.length === 0) return null;

    // Rank moves based on quality
    const rankedMoves = validMoves.map(move => {
      let score = 0;
      
      // Simulate move
      const tempSubBoard = [...this.boards[move.b]];
      tempSubBoard[move.c] = 'O';
      const subWinner = this.checkWinner(tempSubBoard);

      // 1. CRITICAL: Does this move win the global game?
      if (subWinner === 'O') {
        const tempGlobal = [...this.globalBoard];
        tempGlobal[move.b] = 'O';
        if (this.checkWinner(tempGlobal) === 'O') score += 1000;
        else score += 100; // Winning a board is good
      }

      // 2. DEFENSIVE: Does blocking here prevent a player win?
      const blockSub = [...this.boards[move.b]];
      blockSub[move.c] = 'X';
      if (this.checkWinner(blockSub) === 'X') {
        const tempGlobal = [...this.globalBoard];
        tempGlobal[move.b] = 'X';
        if (this.checkWinner(tempGlobal) === 'X') score += 900; // Must block global win
        else score += 80; // Blocking a sub-board win
      }

      // 3. STRATEGIC: Where does this send the opponent?
      // Check the board we are sending them to (target board = move.c)
      const targetBoardIdx = move.c;
      const targetWinner = this.globalBoard[targetBoardIdx];
      
      if (targetWinner !== null) {
        // Sending them to a finished board (they get a FREE MOVE)
        score -= 50; 
      } else {
        // Evaluate the target board state
        const targetBoard = this.boards[targetBoardIdx];
        
        // Does the opponent have a winning move there?
        for (let i = 0; i < 9; i++) {
          if (targetBoard[i] === null) {
            const testBoard = [...targetBoard];
            testBoard[i] = 'X';
            if (this.checkWinner(testBoard) === 'X') {
              score -= 60; // BAD: Sending them to a board they can win
              break;
            }
          }
        }
      }

      // 4. POSITIONAL: Prefer centers and corners
      if (move.c === 4) score += 10;
      if ([0, 2, 6, 8].includes(move.c)) score += 5;
      
      // Prefer winning the global center board
      if (move.b === 4) score += 15;

      return { ...move, score };
    });

    // Sort by score and pick the best (add slight randomness to same-score moves)
    rankedMoves.sort((a, b) => b.score - a.score || Math.random() - 0.5);
    
    return rankedMoves[0];
  }

  getValidMoves() {
    const moves = [];
    for (let b = 0; b < 9; b++) {
      if (this.activeBoardIndex !== -1 && b !== this.activeBoardIndex) continue;
      if (this.globalBoard[b]) continue;

      for (let c = 0; c < 9; c++) {
        if (this.boards[b][c] === null) {
          moves.push({ b, c });
        }
      }
    }
    return moves;
  }

  /* ---- PERSISTENCE ---- */

  loadScores() {
    const saved = localStorage.getItem('ultimate_ttt_scores');
    if (saved) this.scores = JSON.parse(saved);
  }

  saveScores() {
    localStorage.setItem('ultimate_ttt_scores', JSON.stringify(this.scores));
    // For hub leaderboard
    localStorage.setItem('tictactoe_wins', String(this.scores.X));
  }
}
