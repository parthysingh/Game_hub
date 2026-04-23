/* ============================================
   Bird — Physics, animation and rendering
   ============================================ */

class Bird {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.w = 34;
    this.h = 24;
    this.velocity = 0;
    this.gravity = 0.45;
    this.jumpForce = -7.5;
    this.rotation = 0;
    this.targetRotation = 0;

    // Wing animation
    this.wingFrame = 0;      // 0, 1, 2
    this.wingTimer = 0;
    this.wingSpeed = 8;      // frames per wing cycle
    this.wingFrames = ['up', 'mid', 'down', 'mid'];
    this.wingIndex = 0;

    // Alive state
    this.alive = true;

    // Idle hover (menu state)
    this.idleTimer = 0;
  }

  /** Flap! Apply upward velocity */
  flap() {
    if (!this.alive) return;
    this.velocity = this.jumpForce;
    this.targetRotation = -0.5; // tilt up on flap
  }

  /** Update bird physics */
  update(playing) {
    if (playing && this.alive) {
      // Gravity
      this.velocity += this.gravity;
      this.y += this.velocity;

      // Rotation — tilt up on flap, tilt down as falling
      if (this.velocity < 0) {
        this.targetRotation = -0.5;
      } else {
        this.targetRotation = Math.min(this.velocity * 0.08, 1.5);
      }
      this.rotation += (this.targetRotation - this.rotation) * 0.15;

      // Wing animation — faster during flight
      this.wingTimer++;
      if (this.wingTimer >= this.wingSpeed) {
        this.wingTimer = 0;
        this.wingIndex = (this.wingIndex + 1) % this.wingFrames.length;
      }
    } else if (!playing && this.alive) {
      // Idle hover on menu screen
      this.idleTimer += 0.05;
      this.y += Math.sin(this.idleTimer) * 0.5;
      this.rotation = 0;

      // Slow wing flap during idle
      this.wingTimer++;
      if (this.wingTimer >= 12) {
        this.wingTimer = 0;
        this.wingIndex = (this.wingIndex + 1) % this.wingFrames.length;
      }
    } else {
      // Dead — fall with rotation
      this.velocity += this.gravity;
      this.y += this.velocity;
      this.rotation = Math.min(this.rotation + 0.1, Math.PI / 2);
    }
  }

  /** Get current wing frame name */
  getWingFrame() {
    return this.wingFrames[this.wingIndex];
  }

  /** Render the bird */
  draw(ctx, sprites) {
    var birdSprite = sprites.drawBird(this.getWingFrame());

    ctx.save();
    ctx.translate(this.x + this.w / 2, this.y + this.h / 2);
    ctx.rotate(this.rotation);
    ctx.drawImage(birdSprite, -this.w / 2, -this.h / 2);
    ctx.restore();
  }

  /** Get hitbox (slightly smaller than sprite for forgiveness) */
  getHitbox() {
    var pad = 3;
    return {
      x: this.x + pad,
      y: this.y + pad,
      w: this.w - pad * 2,
      h: this.h - pad * 2
    };
  }

  /** Reset bird to initial state */
  reset(x, y) {
    this.x = x;
    this.y = y;
    this.velocity = 0;
    this.rotation = 0;
    this.targetRotation = 0;
    this.alive = true;
    this.idleTimer = 0;
    this.wingIndex = 0;
    this.wingTimer = 0;
  }
}
