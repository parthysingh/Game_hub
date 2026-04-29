/* ============================================
   Pipe — Pipe pair (top + bottom) logic
   ============================================ */

class Pipe {
  constructor(x, gapY, gapSize, canvasH, groundH) {
    this.x = x;
    this.w = 52;
    this.gapY = gapY;         // top of the gap
    this.gapSize = gapSize;   // vertical gap size
    this.canvasH = canvasH;
    this.groundH = groundH;
    this.scored = false;       // has bird passed this pipe?

    // Calculate pipe heights
    this.topH = gapY;
    this.bottomY = gapY + gapSize;
    this.bottomH = canvasH - groundH - this.bottomY;

    // Cache pipe sprites
    this.topSprite = null;
    this.bottomSprite = null;
  }

  /** Update position */
  update(speed) {
    this.x -= speed;
  }

  /** Check if pipe is off screen */
  isOffScreen() {
    return this.x + this.w < -10;
  }

  /** Check collision with a hitbox */
  collides(hitbox) {
    // Top pipe collision
    if (hitbox.x + hitbox.w > this.x &&
        hitbox.x < this.x + this.w &&
        hitbox.y < this.topH) {
      return true;
    }
    // Bottom pipe collision
    if (hitbox.x + hitbox.w > this.x &&
        hitbox.x < this.x + this.w &&
        hitbox.y + hitbox.h > this.bottomY) {
      return true;
    }
    return false;
  }

  /** Draw both pipe segments */
  draw(ctx, sprites) {
    // Cache pipe sprites for this height
    if (!this.topSprite && this.topH > 0) {
      this.topSprite = sprites.drawPipe(this.topH, true);
    }
    if (!this.bottomSprite && this.bottomH > 0) {
      this.bottomSprite = sprites.drawPipe(this.bottomH, false);
    }

    // Draw top pipe
    if (this.topSprite) {
      ctx.drawImage(this.topSprite, Math.round(this.x), 0);
    }
    // Draw bottom pipe
    if (this.bottomSprite) {
      ctx.drawImage(this.bottomSprite, Math.round(this.x), Math.round(this.bottomY));
    }
  }
}

/* ============================================
   PipeManager — Spawns and manages pipes
   ============================================ */

class PipeManager {
  constructor(canvasW, canvasH, groundH) {
    this.canvasW = canvasW;
    this.canvasH = canvasH;
    this.groundH = groundH;
    this.pipes = [];

    // Spawn settings
    this.spawnInterval = 90;   // frames between pipe spawns
    this.spawnTimer = 0;

    // Difficulty settings
    this.baseSpeed = 2.5;
    this.speed = this.baseSpeed;
    this.baseGapSize = 140;
    this.gapSize = this.baseGapSize;
    this.minGapSize = 95;
    this.minPipeHeight = 50;
  }

  /** Update all pipes */
  update(score) {
    // Increase difficulty based on score (more aggressive)
    this.speed = this.baseSpeed + Math.min(score * 0.08, 3.5); // Faster acceleration and higher cap
    this.gapSize = Math.max(this.baseGapSize - score * 1.8, 90); // Gaps shrink faster
    this.spawnInterval = Math.max(90 - score * 1.2, 50); // Pipes spawn more frequently

    // Move pipes
    for (var i = this.pipes.length - 1; i >= 0; i--) {
      this.pipes[i].update(this.speed);
      if (this.pipes[i].isOffScreen()) {
        this.pipes.splice(i, 1);
      }
    }

    // Spawn new pipes
    this.spawnTimer++;
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0;
      this.spawn();
    }
  }

  /** Spawn a new pipe pair */
  spawn() {
    var playableH = this.canvasH - this.groundH;
    var minY = this.minPipeHeight;
    var maxY = playableH - this.gapSize - this.minPipeHeight;
    var gapY = minY + Math.random() * (maxY - minY);

    this.pipes.push(new Pipe(
      this.canvasW + 10,
      gapY,
      this.gapSize,
      this.canvasH,
      this.groundH
    ));
  }

  /** Check score — has bird passed center of any pipe? */
  checkScore(birdX) {
    var scored = 0;
    for (var i = 0; i < this.pipes.length; i++) {
      var pipe = this.pipes[i];
      if (!pipe.scored && birdX > pipe.x + pipe.w / 2) {
        pipe.scored = true;
        scored++;
      }
    }
    return scored;
  }

  /** Check collision with bird hitbox */
  checkCollision(hitbox) {
    for (var i = 0; i < this.pipes.length; i++) {
      if (this.pipes[i].collides(hitbox)) return true;
    }
    return false;
  }

  /** Draw all pipes */
  draw(ctx, sprites) {
    for (var i = 0; i < this.pipes.length; i++) {
      this.pipes[i].draw(ctx, sprites);
    }
  }

  /** Reset pipe manager */
  reset() {
    this.pipes = [];
    this.spawnTimer = 0;
    this.speed = this.baseSpeed;
    this.gapSize = this.baseGapSize;
  }
}
