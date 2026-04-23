/**
 * Asteroid Shooter — Ship logic
 */

class Ship {
  constructor(canvasW, canvasH, size, invincibilityDur, blinkDur) {
    this.canvasW = canvasW;
    this.canvasH = canvasH;
    this.size = size;
    this.r = size / 2;
    this.invincibilityDur = invincibilityDur;
    this.blinkDur = blinkDur;
    this.reset();
  }

  reset() {
    this.x = this.canvasW / 2;
    this.y = this.canvasH / 2;
    this.a = 90 / 180 * Math.PI;
    this.rot = 0;
    this.thrusting = false;
    this.thrust = { x: 0, y: 0 };
    this.upInput = false;
    this.downInput = false;
    this.canShoot = true;
    this.dead = false;
    this.explodeTime = 0;
    this.blinkNum = Math.ceil(this.invincibilityDur / this.blinkDur);
    this.blinkTime = Math.ceil(this.blinkDur * 60);
  }

  update(friction) {
    const exploding = this.explodeTime > 0;

    // Handle thrust
    if (this.thrusting && !exploding) {
      this.thrust.x += 5 * Math.cos(this.a) / 60;
      this.thrust.y -= 5 * Math.sin(this.a) / 60;
    } else {
      this.thrust.x -= friction * this.thrust.x / 60;
      this.thrust.y -= friction * this.thrust.y / 60;
    }

    if (!exploding) {
      // Blink for invincibility
      if (this.blinkNum > 0) {
        this.blinkTime--;
        if (this.blinkTime == 0) {
          this.blinkTime = Math.ceil(this.blinkDur * 60);
          this.blinkNum--;
        }
      }

      // Move ship
      this.a += this.rot;
      this.x += this.thrust.x;
      this.y += this.thrust.y;

      // Screen wrap
      if (this.x < 0 - this.r) this.x = this.canvasW + this.r;
      else if (this.x > this.canvasW + this.r) this.x = 0 - this.r;
      if (this.y < 0 - this.r) this.y = this.canvasH + this.r;
      else if (this.y > this.canvasH + this.r) this.y = 0 - this.r;
    } else {
      this.explodeTime--;
    }
  }

  explode() {
    this.explodeTime = Math.ceil(0.3 * 60);
  }

  draw(ctx) {
    const exploding = this.explodeTime > 0;
    const blinkOn = this.blinkNum % 2 == 0;

    if (!exploding) {
      if (blinkOn) {
        this.drawShip(ctx, this.x, this.y, this.a);
        
        // Thrust flame
        if (this.thrusting) {
          ctx.save();
          ctx.fillStyle = 'red';
          ctx.strokeStyle = 'yellow';
          ctx.lineWidth = this.size / 10;
          ctx.beginPath();
          ctx.moveTo(
            this.x - this.r * (2 / 3 * Math.cos(this.a) + 0.5 * Math.sin(this.a)),
            this.y + this.r * (2 / 3 * Math.sin(this.a) - 0.5 * Math.cos(this.a))
          );
          ctx.lineTo(
            this.x - this.r * 6 / 3 * Math.cos(this.a),
            this.y + this.r * 6 / 3 * Math.sin(this.a)
          );
          ctx.lineTo(
            this.x - this.r * (2 / 3 * Math.cos(this.a) - 0.5 * Math.sin(this.a)),
            this.y + this.r * (2 / 3 * Math.sin(this.a) + 0.5 * Math.cos(this.a))
          );
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          ctx.restore();
        }
      }
    } else {
      // Explosion effect
      const colors = ['darkred', 'red', 'orange', 'yellow', 'white'];
      colors.forEach((color, i) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r * (1.7 - i * 0.3), 0, Math.PI * 2);
        ctx.fill();
      });
    }
  }

  drawShip(ctx, x, y, a) {
    ctx.save();
    ctx.strokeStyle = 'white';
    ctx.lineWidth = this.size / 20;
    ctx.beginPath();
    ctx.moveTo(x + 4 / 3 * this.r * Math.cos(a), y - 4 / 3 * this.r * Math.sin(a));
    ctx.lineTo(x - this.r * (2 / 3 * Math.cos(a) + Math.sin(a)), y + this.r * (2 / 3 * this.sin(a) - Math.cos(a)));
    ctx.lineTo(x - this.r * (2 / 3 * Math.cos(a) - Math.sin(a)), y + this.r * (2 / 3 * this.sin(a) + Math.cos(a)));
    ctx.closePath();
    ctx.stroke();

    // Nose dot
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.arc(x + 4 / 3 * this.r * Math.cos(a), y - 4 / 3 * this.r * Math.sin(a), this.size / 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Helper because Math.sin was used slightly differently in the original logic for Y coords
  sin(a) { return Math.sin(a); }
}
