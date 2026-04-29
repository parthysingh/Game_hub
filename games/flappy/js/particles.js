/* ============================================
   Particle System — Visual effects
   ============================================ */

class Particle {
  constructor(x, y, vx, vy, size, color, life) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.size = size;
    this.color = color;
    this.life = life;
    this.maxLife = life;
    this.alive = true;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.1; // particle gravity
    this.life--;
    if (this.life <= 0) this.alive = false;
  }

  draw(ctx) {
    var alpha = this.life / this.maxLife;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * alpha, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

class ParticleSystem {
  constructor() {
    this.particles = [];
  }

  /** Emit a burst of particles (used on score, hit, etc.) */
  emit(x, y, count, colors, opts) {
    opts = opts || {};
    var speedMin = opts.speedMin || 1;
    var speedMax = opts.speedMax || 4;
    var sizeMin = opts.sizeMin || 2;
    var sizeMax = opts.sizeMax || 5;
    var lifeMin = opts.lifeMin || 15;
    var lifeMax = opts.lifeMax || 40;

    for (var i = 0; i < count; i++) {
      var angle = Math.random() * Math.PI * 2;
      var speed = speedMin + Math.random() * (speedMax - speedMin);
      var size = sizeMin + Math.random() * (sizeMax - sizeMin);
      var life = lifeMin + Math.random() * (lifeMax - lifeMin);
      var color = colors[Math.floor(Math.random() * colors.length)];

      this.particles.push(new Particle(
        x, y,
        Math.cos(angle) * speed,
        Math.sin(angle) * speed,
        size, color, life
      ));
    }
  }

  /** Score celebration particles */
  emitScore(x, y) {
    this.emit(x, y, 12, ['#FFD700', '#FFA500', '#FF6347', '#FFFF00', '#FFF'], {
      speedMin: 1, speedMax: 5,
      sizeMin: 2, sizeMax: 6,
      lifeMin: 20, lifeMax: 45
    });
  }

  /** Hit/crash particles */
  emitHit(x, y) {
    this.emit(x, y, 20, ['#FFF', '#CCC', '#F7DC6F', '#E74C3C', '#FF6347'], {
      speedMin: 2, speedMax: 7,
      sizeMin: 2, sizeMax: 7,
      lifeMin: 15, lifeMax: 35
    });
  }

  /** Update all particles */
  update() {
    for (var i = this.particles.length - 1; i >= 0; i--) {
      this.particles[i].update();
      if (!this.particles[i].alive) {
        this.particles.splice(i, 1);
      }
    }
  }

  /** Draw all particles */
  draw(ctx) {
    for (var i = 0; i < this.particles.length; i++) {
      this.particles[i].draw(ctx);
    }
  }

  /** Clear all particles */
  clear() {
    this.particles = [];
  }
}
