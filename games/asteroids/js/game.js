/**
 * Asteroid Shooter — Game logic
 */

class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    // Config
    this.SHIP_SIZE = 30;
    this.FRICTION = 0.7;
    this.TURN_SPEED = 360;
    this.BULLET_SPEED = 500;
    this.ASTEROID_NUM = 4; // Was 1
    this.ASTEROID_SPEED = 80; // Was 50
    this.ASTEROID_SIZE = 100;
    this.ASTEROID_VERTICES = 10;
    this.ASTEROID_JAG = 0.4;
    this.SHIP_INVINCIBILITY_DUR = 3;
    this.SHIP_BLINK_DUR = 0.1;

    // State
    this.score = 0;
    this.lives = 3;
    this.level = 0;
    this.gameOver = false;
    this.asteroids = [];
    this.bullets = [];

    // Modules
    this.ship = new Ship(canvas.width, canvas.height, this.SHIP_SIZE, this.SHIP_INVINCIBILITY_DUR, this.SHIP_BLINK_DUR);
    this.audio = new AudioManager();

    // UI
    this.scoreEl = document.getElementById('score');
    this.livesEl = document.getElementById('lives');
    this.messageBox = document.getElementById('message-box');

    this.resize();
  }

  resize() {
    const maxWidth = 800;
    const maxHeight = 600;
    const windowWidth = window.innerWidth * 0.9;
    const windowHeight = window.innerHeight * 0.7;

    this.canvas.width = Math.min(maxWidth, windowWidth);
    this.canvas.height = Math.min(maxHeight, windowHeight);

    // Update ship bounds
    this.ship.canvasW = this.canvas.width;
    this.ship.canvasH = this.canvas.height;
  }

  newGame() {
    this.score = 0;
    this.lives = 3;
    this.level = 0;
    this.gameOver = false;
    this.bullets = [];
    this.updateUI();
    this.newLevel();
  }

  newLevel() {
    this.ship.reset();
    this.createAsteroidBelt();
  }

  createAsteroidBelt() {
    this.asteroids = [];
    let x, y;
    for (let i = 0; i < this.ASTEROID_NUM + (this.level * 2); i++) {
      do {
        x = Math.floor(Math.random() * this.canvas.width);
        y = Math.floor(Math.random() * this.canvas.height);
      } while (this.distBetweenPoints(this.ship.x, this.ship.y, x, y) < this.ASTEROID_SIZE * 2 + this.ship.r);

      this.asteroids.push(new Asteroid(
        x, y, Math.ceil(this.ASTEROID_SIZE / 2),
        this.level, this.ASTEROID_SPEED, this.ASTEROID_VERTICES, this.ASTEROID_JAG
      ));
    }
  }

  shoot() {
    if (this.ship.dead || this.gameOver || !this.ship.canShoot || this.bullets.length >= 10) return;

    this.bullets.push({
      x: this.ship.x + 4 / 3 * this.ship.r * Math.cos(this.ship.a),
      y: this.ship.y - 4 / 3 * this.ship.r * Math.sin(this.ship.a),
      xv: this.BULLET_SPEED * Math.cos(this.ship.a) / 60,
      yv: -this.BULLET_SPEED * Math.sin(this.ship.a) / 60,
      dist: 0,
      maxDist: 0.6 * this.canvas.width
    });

    this.audio.playShoot();
    this.ship.canShoot = false;
    setTimeout(() => { if (this.ship) this.ship.canShoot = true; }, 200);
  }

  update() {
    if (this.gameOver) return;

    // Smart Thrust Logic
    let angle = this.ship.a % (Math.PI * 2);
    if (angle < 0) angle += Math.PI * 2;
    const boundary1 = 3 * Math.PI / 4;
    const boundary2 = 7 * Math.PI / 4;
    const isUpRight = (angle >= 0 && angle < boundary1) || (angle >= boundary2);
    const isDownLeft = (angle >= boundary1 && angle < boundary2);

    if (this.ship.upInput && isUpRight) this.ship.thrusting = true;
    else if (this.ship.downInput && isDownLeft) this.ship.thrusting = true;
    else this.ship.thrusting = false;

    // Update entities
    this.ship.update(this.FRICTION);

    // Check collisions
    if (this.ship.explodeTime == 0 && !this.ship.dead) {
      if (this.ship.blinkNum == 0) {
        for (let i = 0; i < this.asteroids.length; i++) {
          if (this.distBetweenPoints(this.ship.x, this.ship.y, this.asteroids[i].x, this.asteroids[i].y) < this.ship.r + this.asteroids[i].r) {
            this.explodeShip();
            this.destroyAsteroid(i);
            break;
          }
        }
      }
    } else if (this.ship.explodeTime == 1) { // End of explosion
      this.lives--;
      this.updateUI();
      if (this.lives == 0) {
        this.endGame();
      } else {
        this.ship.reset();
      }
    }

    // Bullets
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      b.x += b.xv;
      b.y += b.yv;
      b.dist += Math.sqrt(b.xv ** 2 + b.yv ** 2);

      // Wrap
      if (b.x < 0) b.x = this.canvas.width; else if (b.x > this.canvas.width) b.x = 0;
      if (b.y < 0) b.y = this.canvas.height; else if (b.y > this.canvas.height) b.y = 0;

      if (b.dist > b.maxDist) {
        this.bullets.splice(i, 1);
        continue;
      }

      // Hit asteroid
      for (let j = this.asteroids.length - 1; j >= 0; j--) {
        if (this.distBetweenPoints(b.x, b.y, this.asteroids[j].x, this.asteroids[j].y) < this.asteroids[j].r) {
          this.bullets.splice(i, 1);
          this.destroyAsteroid(j);
          break;
        }
      }
    }

    // Asteroids
    this.asteroids.forEach(a => a.update(this.canvas.width, this.canvas.height));

    if (this.asteroids.length == 0 && !this.gameOver) {
      this.level++;
      this.newLevel();
    }
  }

  draw() {
    this.ctx.fillStyle = '#0a0a0a';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.asteroids.forEach(a => a.draw(this.ctx));

    this.bullets.forEach(b => {
      this.ctx.fillStyle = 'cyan';
      this.ctx.beginPath();
      this.ctx.arc(b.x, b.y, this.SHIP_SIZE / 15, 0, Math.PI * 2);
      this.ctx.fill();
    });

    this.ship.draw(this.ctx);
  }

  explodeShip() {
    this.ship.explode();
    this.audio.playExplosion(1.5);
  }

  destroyAsteroid(index) {
    const a = this.asteroids[index];
    this.audio.playExplosion(a.r / 50);

    if (a.r > this.ASTEROID_SIZE / 4) {
      this.asteroids.push(new Asteroid(a.x, a.y, Math.ceil(this.ASTEROID_SIZE / 4), this.level, this.ASTEROID_SPEED, this.ASTEROID_VERTICES, this.ASTEROID_JAG));
      this.asteroids.push(new Asteroid(a.x, a.y, Math.ceil(this.ASTEROID_SIZE / 4), this.level, this.ASTEROID_SPEED, this.ASTEROID_VERTICES, this.ASTEROID_JAG));
      this.score += 20;
    } else if (a.r > this.ASTEROID_SIZE / 8) {
      this.asteroids.push(new Asteroid(a.x, a.y, Math.ceil(this.ASTEROID_SIZE / 8), this.level, this.ASTEROID_SPEED, this.ASTEROID_VERTICES, this.ASTEROID_JAG));
      this.asteroids.push(new Asteroid(a.x, a.y, Math.ceil(this.ASTEROID_SIZE / 8), this.level, this.ASTEROID_SPEED, this.ASTEROID_VERTICES, this.ASTEROID_JAG));
      this.score += 50;
    } else {
      this.score += 100;
    }

    this.asteroids.splice(index, 1);
    this.updateUI();
  }

  updateUI() {
    this.scoreEl.textContent = this.score;
    this.livesEl.textContent = this.lives;
  }

  endGame() {
    this.gameOver = true;
    this.ship.dead = true;
    document.getElementById('message-score').textContent = `FINAL SCORE: ${this.score}`;
    this.messageBox.classList.remove('hidden');

    // Save high score
    const high = parseInt(localStorage.getItem('asteroids_highscore')) || 0;
    if (this.score > high) {
      localStorage.setItem('asteroids_highscore', String(this.score));
    }
  }

  distBetweenPoints(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  }
}
