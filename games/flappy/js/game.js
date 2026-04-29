/* ============================================
   Game — Main game loop, state management,
   rendering, UI overlays, and score tracking.
   ============================================ */

var STATE = {
  MENU: 0,
  PLAYING: 1,
  GAME_OVER: 2
};

class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    // Dimensions
    this.width = 400;
    this.height = 600;
    this.groundH = 112;
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    // Modules
    this.sprites = new SpriteRenderer();
    this.audio = new AudioManager();
    this.particles = new ParticleSystem();

    // Game objects
    this.bird = new Bird(80, this.height / 2 - 12);
    this.pipeManager = new PipeManager(this.width, this.height, this.groundH);

    // State
    this.state = STATE.MENU;
    this.score = 0;
    this.highScore = this.loadHighScore();
    this.newHighScore = false;

    // Screen shake
    this.shakeAmount = 0;
    this.shakeDuration = 0;

    // Screen flash
    this.flashAlpha = 0;

    // Ground scroll
    this.groundX = 0;
    this.bgX = 0;

    // Game over UI timing
    this.gameOverTimer = 0;
    this.gameOverReady = false; // can restart?

    // Score display animation
    this.displayScore = 0;
    this.scoreScale = 1;

    // FPS tracking
    this.fps = 60;
    this.fpsFrames = 0;
    this.fpsTime = 0;
    this.lastTime = 0;
    this.deltaTime = 0;

    // Pre-render sprites
    this.bgSprite = this.sprites.drawBackground(this.width, this.height);
    this.groundSprite = this.sprites.drawGround(this.width);

    // Bind methods
    this.loop = this.loop.bind(this);
  }

  /* ---- STATE TRANSITIONS ---- */

  startGame() {
    this.state = STATE.PLAYING;
    this.score = 0;
    this.displayScore = 0;
    this.newHighScore = false;
    this.bird.reset(80, this.height / 2 - 12);
    this.pipeManager.reset();
    this.particles.clear();
    this.bird.flap();
    this.audio.playFlap();
  }

  gameOver() {
    if (this.state !== STATE.PLAYING) return;
    this.state = STATE.GAME_OVER;
    this.bird.alive = false;
    this.gameOverTimer = 0;
    this.gameOverReady = false;

    // Screen effects
    this.shakeAmount = 8;
    this.shakeDuration = 15;
    this.flashAlpha = 0.7;

    // Particles
    this.particles.emitHit(
      this.bird.x + this.bird.w / 2,
      this.bird.y + this.bird.h / 2
    );

    // Sounds
    this.audio.playHit();
    setTimeout(function() { this.audio.playDie(); }.bind(this), 300);

    // High score
    if (this.score > this.highScore) {
      this.highScore = this.score;
      this.newHighScore = true;
      this.saveHighScore(this.highScore);
    }
  }

  restart() {
    if (!this.gameOverReady) return;
    this.audio.playSwoosh();
    this.state = STATE.MENU;
    this.bird.reset(80, this.height / 2 - 12);
    this.pipeManager.reset();
    this.particles.clear();
    this.shakeAmount = 0;
    this.flashAlpha = 0;
  }

  /* ---- INPUT ---- */

  handleInput() {
    this.audio.init(); // init on first interaction

    if (this.state === STATE.MENU) {
      this.startGame();
    } else if (this.state === STATE.PLAYING) {
      this.bird.flap();
      this.audio.playFlap();
    } else if (this.state === STATE.GAME_OVER) {
      this.restart();
    }
  }

  /* ---- MAIN LOOP ---- */

  loop(timestamp) {
    // Delta time
    if (!this.lastTime) this.lastTime = timestamp;
    this.deltaTime = timestamp - this.lastTime;
    this.lastTime = timestamp;

    // FPS counter
    this.fpsFrames++;
    this.fpsTime += this.deltaTime;
    if (this.fpsTime >= 1000) {
      this.fps = this.fpsFrames;
      this.fpsFrames = 0;
      this.fpsTime = 0;
    }

    this.update();
    this.render();

    requestAnimationFrame(this.loop);
  }

  start() {
    requestAnimationFrame(this.loop);
  }

  /* ---- UPDATE ---- */

  update() {
    var groundTop = this.height - this.groundH;

    if (this.state === STATE.PLAYING) {
      // Update bird
      this.bird.update(true);

      // Update pipes
      this.pipeManager.update(this.score);

      // Check scoring
      var scored = this.pipeManager.checkScore(this.bird.x + this.bird.w / 2);
      if (scored > 0) {
        this.score += scored;
        this.scoreScale = 1.5;
        this.audio.playScore();
        this.particles.emitScore(this.bird.x + this.bird.w, this.bird.y);
      }

      // Score display animation
      if (this.displayScore < this.score) this.displayScore++;

      // Score scale animation
      if (this.scoreScale > 1) {
        this.scoreScale = Math.max(1, this.scoreScale - 0.05);
      }

      // Check collision with pipes
      var hitbox = this.bird.getHitbox();
      if (this.pipeManager.checkCollision(hitbox)) {
        this.gameOver();
      }

      // Check collision with ground
      if (this.bird.y + this.bird.h >= groundTop) {
        this.bird.y = groundTop - this.bird.h;
        this.gameOver();
      }

      // Check ceiling
      if (this.bird.y < -this.bird.h) {
        this.bird.y = -this.bird.h;
        this.bird.velocity = 0;
      }

      // Scroll ground
      this.groundX -= this.pipeManager.speed;
      if (this.groundX <= -this.width) this.groundX += this.width;

      // Scroll background (parallax - slower)
      this.bgX -= this.pipeManager.speed * 0.3;
      if (this.bgX <= -this.width) this.bgX += this.width;

    } else if (this.state === STATE.MENU) {
      this.bird.update(false);

      // Scroll ground slowly
      this.groundX -= 1;
      if (this.groundX <= -this.width) this.groundX += this.width;
      this.bgX -= 0.3;
      if (this.bgX <= -this.width) this.bgX += this.width;

    } else if (this.state === STATE.GAME_OVER) {
      this.bird.update(false);
      this.gameOverTimer++;

      // Allow restart after delay
      if (this.gameOverTimer > 40) {
        this.gameOverReady = true;
      }

      // Bird falls to ground
      if (this.bird.y + this.bird.h >= groundTop) {
        this.bird.y = groundTop - this.bird.h;
        this.bird.velocity = 0;
      }
    }

    // Screen shake
    if (this.shakeDuration > 0) {
      this.shakeDuration--;
      if (this.shakeDuration <= 0) this.shakeAmount = 0;
    }

    // Flash fade
    if (this.flashAlpha > 0) {
      this.flashAlpha = Math.max(0, this.flashAlpha - 0.05);
    }

    // Particles
    this.particles.update();
  }

  /* ---- RENDER ---- */

  render() {
    var ctx = this.ctx;

    ctx.save();

    // Screen shake offset
    if (this.shakeAmount > 0) {
      var sx = (Math.random() - 0.5) * this.shakeAmount * 2;
      var sy = (Math.random() - 0.5) * this.shakeAmount * 2;
      ctx.translate(sx, sy);
      this.shakeAmount *= 0.85;
    }

    // Background
    ctx.drawImage(this.bgSprite, Math.round(this.bgX), 0);

    // Pipes
    this.pipeManager.draw(ctx, this.sprites);

    // Particles (behind bird)
    this.particles.draw(ctx);

    // Bird
    this.bird.draw(ctx, this.sprites);

    // Ground
    var groundTop = this.height - this.groundH;
    ctx.drawImage(this.groundSprite, Math.round(this.groundX), groundTop);

    ctx.restore();

    // Flash overlay
    if (this.flashAlpha > 0) {
      ctx.fillStyle = 'rgba(255, 255, 255, ' + this.flashAlpha + ')';
      ctx.fillRect(0, 0, this.width, this.height);
    }

    // UI overlays
    if (this.state === STATE.MENU) {
      this.drawMenuUI(ctx);
    } else if (this.state === STATE.PLAYING) {
      this.drawPlayingUI(ctx);
    } else if (this.state === STATE.GAME_OVER) {
      this.drawGameOverUI(ctx);
    }

    // FPS counter
    var fpsEl = document.getElementById('fps-counter');
    if (fpsEl) fpsEl.textContent = this.fps + ' FPS';
  }

  /* ---- UI DRAWING ---- */

  drawMenuUI(ctx) {
    var cx = this.width / 2;

    // Title
    ctx.save();
    ctx.textAlign = 'center';

    // Title shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.font = 'bold 38px "Press Start 2P", monospace';
    ctx.fillText('FlapPy', cx + 2, 142);
    ctx.font = 'bold 42px "Press Start 2P", monospace';
    ctx.fillText('Bird', cx + 2, 192);

    // Title main
    ctx.fillStyle = '#FFF';
    ctx.strokeStyle = '#2E6B1C';
    ctx.lineWidth = 4;
    ctx.font = 'bold 38px "Press Start 2P", monospace';
    ctx.strokeText('FlapPy', cx, 140);
    ctx.fillText('FlapPy', cx, 140);

    ctx.font = 'bold 42px "Press Start 2P", monospace';
    ctx.strokeText('Bird', cx, 190);
    ctx.fillText('Bird', cx, 190);

    // Instruction (blinking)
    var blink = Math.sin(Date.now() * 0.005) > 0;
    if (blink) {
      ctx.font = '10px "Press Start 2P", monospace';
      ctx.fillStyle = '#FFF';
      ctx.strokeStyle = 'rgba(0,0,0,0.5)';
      ctx.lineWidth = 3;
      ctx.strokeText('Press SPACE or Tap', cx, 420);
      ctx.fillText('Press SPACE or Tap', cx, 420);
    }

    // High score
    if (this.highScore > 0) {
      ctx.font = '9px "Press Start 2P", monospace';
      ctx.fillStyle = '#FFD700';
      ctx.fillText('Best: ' + this.highScore, cx, 460);
    }

    ctx.restore();
  }

  drawPlayingUI(ctx) {
    var cx = this.width / 2;

    // Score
    ctx.save();
    ctx.textAlign = 'center';
    ctx.translate(cx, 55);
    ctx.scale(this.scoreScale, this.scoreScale);

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.font = 'bold 40px "Press Start 2P", monospace';
    ctx.fillText(String(this.displayScore), 2, 2);

    // Main
    ctx.fillStyle = '#FFF';
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 4;
    ctx.strokeText(String(this.displayScore), 0, 0);
    ctx.fillText(String(this.displayScore), 0, 0);

    ctx.restore();
  }

  drawGameOverUI(ctx) {
    var cx = this.width / 2;
    var t = Math.min(this.gameOverTimer / 30, 1); // animation progress

    // Dim overlay
    ctx.fillStyle = 'rgba(0, 0, 0, ' + (0.3 * t) + ')';
    ctx.fillRect(0, 0, this.width, this.height);

    if (t < 0.3) return; // wait a moment

    ctx.save();
    ctx.textAlign = 'center';

    // "Game Over" text with slide-in
    var yOff = (1 - t) * -50;

    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.font = 'bold 28px "Press Start 2P", monospace';
    ctx.fillText('Game Over', cx + 2, 152 + yOff);

    ctx.fillStyle = '#E74C3C';
    ctx.strokeStyle = '#8B0000';
    ctx.lineWidth = 3;
    ctx.strokeText('Game Over', cx, 150 + yOff);
    ctx.fillText('Game Over', cx, 150 + yOff);

    // Score panel
    if (t > 0.5) {
      var panelT = Math.min((t - 0.5) / 0.5, 1);
      var panelAlpha = panelT;

      ctx.globalAlpha = panelAlpha;

      // Panel background
      var panelW = 240;
      var panelH = 140;
      var panelX = cx - panelW / 2;
      var panelY = 180;

      // Panel shadow
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      this.roundRect(ctx, panelX + 3, panelY + 3, panelW, panelH, 10);

      // Panel
      var panelGrad = ctx.createLinearGradient(panelX, panelY, panelX, panelY + panelH);
      panelGrad.addColorStop(0, '#DEB887');
      panelGrad.addColorStop(1, '#C49A5E');
      ctx.fillStyle = panelGrad;
      this.roundRect(ctx, panelX, panelY, panelW, panelH, 10);

      // Panel border
      ctx.strokeStyle = '#8B6914';
      ctx.lineWidth = 3;
      this.roundRect(ctx, panelX, panelY, panelW, panelH, 10);

      // Medal
      var medal = this.getMedalType();
      if (medal) {
        var medalSprite = this.sprites.drawMedal(medal);
        ctx.drawImage(medalSprite, panelX + 18, panelY + 42);
      }

      // Score labels
      ctx.font = '10px "Press Start 2P", monospace';
      ctx.textAlign = 'right';
      ctx.fillStyle = '#543D10';

      ctx.fillText('Score', panelX + panelW - 20, panelY + 40);
      ctx.fillText('Best', panelX + panelW - 20, panelY + 85);

      ctx.font = '16px "Press Start 2P", monospace';
      ctx.fillStyle = '#FFF';
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 2;

      ctx.strokeText(String(this.score), panelX + panelW - 20, panelY + 62);
      ctx.fillText(String(this.score), panelX + panelW - 20, panelY + 62);

      ctx.strokeText(String(this.highScore), panelX + panelW - 20, panelY + 107);
      ctx.fillText(String(this.highScore), panelX + panelW - 20, panelY + 107);

      // New high score badge
      if (this.newHighScore) {
        ctx.font = '7px "Press Start 2P", monospace';
        ctx.fillStyle = '#E74C3C';
        ctx.textAlign = 'left';
        ctx.fillText('NEW!', panelX + 80, panelY + 107);
      }

      ctx.globalAlpha = 1;
    }

    // Restart instruction
    if (this.gameOverReady) {
      var blink = Math.sin(Date.now() * 0.005) > 0;
      if (blink) {
        ctx.textAlign = 'center';
        ctx.font = '9px "Press Start 2P", monospace';
        ctx.fillStyle = '#FFF';
        ctx.strokeStyle = 'rgba(0,0,0,0.5)';
        ctx.lineWidth = 3;
        ctx.strokeText('Tap to Restart', cx, 380);
        ctx.fillText('Tap to Restart', cx, 380);
      }
    }

    ctx.restore();
  }

  /** Helper: draw and fill/stroke a rounded rect */
  roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  /** Determine medal type based on score */
  getMedalType() {
    if (this.score >= 40) return 'platinum';
    if (this.score >= 30) return 'gold';
    if (this.score >= 20) return 'silver';
    if (this.score >= 10) return 'bronze';
    return null;
  }

  /* ---- HIGH SCORE PERSISTENCE ---- */

  loadHighScore() {
    try {
      return parseInt(localStorage.getItem('flappybird_highscore')) || 0;
    } catch (e) {
      return 0;
    }
  }

  saveHighScore(score) {
    try {
      localStorage.setItem('flappybird_highscore', String(score));
    } catch (e) { /* ignore */ }
  }
}
