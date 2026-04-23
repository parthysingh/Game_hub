/**
 * Asteroid Shooter — Asteroid logic
 */

class Asteroid {
  constructor(x, y, r, level, speed, vertices, jag) {
    const lvlMult = 1 + 0.3 * level; // Even more aggressive speed scaling (was 0.2)
    this.x = x;
    this.y = y;
    this.r = r;
    this.xv = Math.random() * speed * lvlMult / 60 * (Math.random() < 0.5 ? 1 : -1);
    this.yv = Math.random() * speed * lvlMult / 60 * (Math.random() < 0.5 ? 1 : -1);
    this.a = Math.random() * Math.PI * 2;
    this.vert = Math.floor(Math.random() * (vertices + 1) + vertices / 2);
    this.offs = [];

    for (let i = 0; i < this.vert; i++) {
      this.offs.push(Math.random() * jag * 2 + 1 - jag);
    }
  }

  update(width, height) {
    this.x += this.xv;
    this.y += this.yv;

    // Handle screen wrap
    if (this.x < 0 - this.r) this.x = width + this.r;
    else if (this.x > width + this.r) this.x = 0 - this.r;
    if (this.y < 0 - this.r) this.y = height + this.r;
    else if (this.y > height + this.r) this.y = 0 - this.r;
  }

  draw(ctx) {
    ctx.save();
    ctx.strokeStyle = '#39FF14';
    ctx.lineWidth = 1.5;
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#39FF14';
    
    ctx.beginPath();
    ctx.moveTo(
      this.x + this.r * this.offs[0] * Math.cos(this.a),
      this.y + this.r * this.offs[0] * Math.sin(this.a)
    );
    for (let j = 1; j < this.vert; j++) {
      ctx.lineTo(
        this.x + this.r * this.offs[j] * Math.cos(this.a + j * Math.PI * 2 / this.vert),
        this.y + this.r * this.offs[j] * Math.sin(this.a + j * Math.PI * 2 / this.vert)
      );
    }
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }
}
