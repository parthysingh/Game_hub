/**
 * Game Hub — Core Logic
 * Handles theme switching, high scores, background animation, and card previews.
 */

(function () {
  'use strict';

  /* --- CONFIGURATION --- */
  const GAMES = [
    { id: 'flappy', name: 'Flappy Bird', scoreKey: 'flappybird_highscore', color: '#4EC0CA', emoji: '🐦' },
    { id: 'snake', name: 'Snake', scoreKey: 'snake_highscore', color: '#00b894', emoji: '🐍' },
    { id: 'tictactoe', name: 'Tic Tac Toe', scoreKey: 'tictactoe_wins', color: '#e17055', emoji: '❌' },
    { id: 'asteroids', name: 'Asteroid Shooter', scoreKey: 'asteroids_highscore', color: '#D900FF', emoji: '☄️' },
    { id: 'minesweeper', name: 'Minesweeper', scoreKey: 'minesweeper_highscore', color: '#808080', emoji: '💣' },
    { id: 'pacman', name: 'Pac-Man', scoreKey: 'pacman_highscore', color: '#fdcb6e', emoji: '🟡' }
  ];

  /* --- THEME MANAGER --- */
  class ThemeManager {
    constructor() {
      this.toggleBtn = document.getElementById('theme-toggle');
      this.darkIcon = document.getElementById('theme-icon-dark');
      this.lightIcon = document.getElementById('theme-icon-light');
      this.currentTheme = localStorage.getItem('hub_theme') || 'dark';
      
      this.init();
    }

    init() {
      this.applyTheme(this.currentTheme);
      this.toggleBtn.addEventListener('click', () => {
        this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.applyTheme(this.currentTheme);
        localStorage.setItem('hub_theme', this.currentTheme);
      });
    }

    applyTheme(theme) {
      if (theme === 'light') {
        document.body.classList.add('light-theme');
        this.darkIcon.style.display = 'none';
        this.lightIcon.style.display = 'block';
      } else {
        document.body.classList.remove('light-theme');
        this.darkIcon.style.display = 'block';
        this.lightIcon.style.display = 'none';
      }
    }
  }

  /* --- SCORE MANAGER --- */
  class ScoreManager {
    constructor() {
      this.scores = {};
      this.loadScores();
    }

    loadScores() {
      GAMES.forEach(game => {
        const val = localStorage.getItem(game.scoreKey);
        this.scores[game.id] = val || (game.id === 'memory' ? '—' : '0');
      });
      this.updateUI();
    }

    updateUI() {
      // Update cards
      Object.keys(this.scores).forEach(gameId => {
        const el = document.querySelector(`.score-val[data-game="${gameId}"]`);
        if (el) {
          let suffix = '';
          if (gameId === 'tictactoe') suffix = 'W';
          if (gameId === 'rps') suffix = '🔥';
          el.textContent = this.scores[gameId] + suffix;
        }
      });

      // Update leaderboard
      const lbContainer = document.getElementById('leaderboard');
      if (!lbContainer) return;

      const sortedGames = GAMES.filter(g => {
        const s = this.scores[g.id];
        return s !== '0' && s !== '—';
      }).sort((a, b) => parseInt(this.scores[b.id]) - parseInt(this.scores[a.id]));

      if (sortedGames.length === 0) {
        lbContainer.innerHTML = '<div class="lb-empty">No scores recorded yet. Play a game to start your journey!</div>';
        return;
      }

      lbContainer.innerHTML = sortedGames.map((game, index) => `
        <div class="lb-row">
          <div class="lb-rank">${index + 1}</div>
          <div class="lb-game">
            <div>${game.name}</div>
            <div class="lb-game-sub">Personal Best</div>
          </div>
          <div class="lb-score" style="color:${game.color}">${this.scores[game.id]}</div>
        </div>
      `).join('');
    }
  }

  /* --- BACKGROUND ANIMATION --- */
  class BackgroundAnimation {
    constructor() {
      this.canvas = document.getElementById('bg-canvas');
      if (!this.canvas) return;
      this.ctx = this.canvas.getContext('2d');
      this.particles = [];
      this.resize();
      this.init();
      
      window.addEventListener('resize', () => this.resize());
      this.animate();
    }

    resize() {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }

    init() {
      const count = Math.floor((window.innerWidth * window.innerHeight) / 25000);
      this.particles = [];
      for (let i = 0; i < count; i++) {
        this.particles.push({
          x: Math.random() * this.canvas.width,
          y: Math.random() * this.canvas.height,
          size: Math.random() * 2 + 1,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          color: `rgba(108, 92, 231, ${Math.random() * 0.3 + 0.1})`
        });
      }
    }

    animate() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      
      this.particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = this.canvas.width;
        if (p.x > this.canvas.width) p.x = 0;
        if (p.y < 0) p.y = this.canvas.height;
        if (p.y > this.canvas.height) p.y = 0;

        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.fillStyle = p.color;
        this.ctx.fill();
      });

      requestAnimationFrame(() => this.animate());
    }
  }

  /* --- PREVIEW RENDERER --- */
  class PreviewRenderer {
    constructor() {
      this.canvases = document.querySelectorAll('.card-canvas');
      this.renderAll();
    }

    renderAll() {
      this.canvases.forEach(canvas => {
        const gameId = canvas.getAttribute('data-game');
        const ctx = canvas.getContext('2d');
        const game = GAMES.find(g => g.id === gameId);
        if (game) this.drawPreview(ctx, game, canvas.width, canvas.height);
      });
    }

    drawPreview(ctx, game, w, h) {
      // Draw background gradient
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, '#1a1a2e');
      grad.addColorStop(1, '#16213e');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Draw stylized icon
      ctx.font = '70px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Floating effect
      const yOff = Math.sin(Date.now() / 1000 + (w * h)) * 10;
      
      ctx.shadowBlur = 20;
      ctx.shadowColor = game.color;
      ctx.fillText(game.emoji, w / 2, h / 2 + yOff);
      
      // Decorative elements
      ctx.shadowBlur = 0;
      ctx.strokeStyle = game.color;
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.2;
      ctx.strokeRect(20, 20, w - 40, h - 40);
      ctx.globalAlpha = 1.0;
    }
  }

  /* --- INITIALIZATION --- */
  document.addEventListener('DOMContentLoaded', () => {
    new ThemeManager();
    new ScoreManager();
    new BackgroundAnimation();
    const previews = new PreviewRenderer();
    
    // Dynamic updates for previews
    function tick() {
      previews.renderAll();
      requestAnimationFrame(tick);
    }
    tick();
  });

})();
