/**
 * Snake — Game logic
 */

const STATE = {
  MENU: 'menu',
  PLAYING: 'playing',
  PAUSED: 'paused',
  GAMEOVER: 'gameover'
};

class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    
    // Grid settings
    this.cols = 20;
    this.rows = 20;
    this.cellSize = 0; // calculated on resize
    
    // Modules
    this.snake = new Snake(10, 10);
    this.food = new Food();
    this.audio = new AudioManager();
    
    // State
    this.state = STATE.MENU;
    this.score = 0;
    this.highScore = this.loadHighScore();
    
    // Timing
    this.lastTime = 0;
    this.tickTimer = 0;
    this.tickInterval = 150; // ms per move
    this.minTickInterval = 60;
    
    // UI Elements
    this.scoreEl = document.getElementById('current-score');
    this.highScoreEl = document.getElementById('high-score');
    this.overlay = document.getElementById('overlay');
    this.screens = {
      menu: document.getElementById('start-screen'),
      pause: document.getElementById('pause-screen'),
      gameover: document.getElementById('gameover-screen')
    };

    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.updateHighScoreUI();
  }

  resize() {
    // Make canvas square and responsive
    const size = Math.min(this.canvas.parentElement.clientWidth, 600);
    this.canvas.width = size;
    this.canvas.height = size;
    this.cellSize = size / this.cols;
  }

  start() {
    this.state = STATE.PLAYING;
    this.score = 0;
    this.tickInterval = 150;
    this.snake.reset(10, 10);
    this.food.spawn(this.snake.segments, this.cols, this.rows);
    this.updateScoreUI();
    this.hideAllScreens();
  }

  pause() {
    if (this.state === STATE.PLAYING) {
      this.state = STATE.PAUSED;
      this.showScreen('pause');
    } else if (this.state === STATE.PAUSED) {
      this.resume();
    }
  }

  resume() {
    this.state = STATE.PLAYING;
    this.hideAllScreens();
  }

  gameOver() {
    this.state = STATE.GAMEOVER;
    this.audio.playGameOver();
    
    if (this.score > this.highScore) {
      this.highScore = this.score;
      this.saveHighScore(this.highScore);
      this.updateHighScoreUI();
    }
    
    document.getElementById('final-score-msg').textContent = `Final Score: ${this.score}`;
    this.showScreen('gameover');
  }

  update(timestamp) {
    if (this.state !== STATE.PLAYING) {
      this.lastTime = timestamp;
      return;
    }

    const deltaTime = timestamp - this.lastTime;
    this.lastTime = timestamp;
    this.tickTimer += deltaTime;

    if (this.tickTimer >= this.tickInterval) {
      this.tickTimer = 0;
      this.tick();
    }
  }

  tick() {
    const alive = this.snake.update(this.cols, this.rows);
    
    if (!alive) {
      this.gameOver();
      return;
    }

    // Check food
    const head = this.snake.segments[0];
    if (head.x === this.food.x && head.y === this.food.y) {
      this.eat();
    }
  }

  eat() {
    this.score += 10;
    this.snake.grow();
    this.food.spawn(this.snake.segments, this.cols, this.rows);
    this.audio.playEat();
    this.updateScoreUI();
    
    // Increase speed more aggressively
    if (this.tickInterval > this.minTickInterval) {
      this.tickInterval -= 5; // Was 2
    }
  }

  draw() {
    // Clear
    this.ctx.fillStyle = '#0a0a0a';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw Grid (subtle)
    this.ctx.strokeStyle = 'rgba(255,255,255,0.03)';
    this.ctx.lineWidth = 1;
    for (let i = 0; i <= this.cols; i++) {
      this.ctx.beginPath();
      this.ctx.moveTo(i * this.cellSize, 0);
      this.ctx.lineTo(i * this.cellSize, this.canvas.height);
      this.ctx.stroke();
      
      this.ctx.beginPath();
      this.ctx.moveTo(0, i * this.cellSize);
      this.ctx.lineTo(this.canvas.width, i * this.cellSize);
      this.ctx.stroke();
    }

    this.food.draw(this.ctx, this.cellSize);
    this.snake.draw(this.ctx, this.cellSize);
  }

  /* ---- UI HELPERS ---- */

  updateScoreUI() {
    this.scoreEl.textContent = String(this.score).padStart(3, '0');
  }

  updateHighScoreUI() {
    this.highScoreEl.textContent = String(this.highScore).padStart(3, '0');
  }

  showScreen(id) {
    this.overlay.style.display = 'flex';
    this.hideAllScreens();
    this.screens[id].style.display = 'block';
  }

  hideAllScreens() {
    this.overlay.style.display = this.state === STATE.PLAYING ? 'none' : 'flex';
    Object.values(this.screens).forEach(s => s.style.display = 'none');
  }

  /* ---- PERSISTENCE ---- */

  loadHighScore() {
    return parseInt(localStorage.getItem('snake_highscore')) || 0;
  }

  saveHighScore(score) {
    localStorage.setItem('snake_highscore', score);
  }
}
