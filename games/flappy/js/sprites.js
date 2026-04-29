/* ============================================
   SpriteRenderer — Draws all game graphics
   programmatically on offscreen canvases.
   ============================================ */

class SpriteRenderer {
  constructor() {
    this.cache = {};
  }

  createCanvas(w, h) {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    return c;
  }

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
  }

  drawBird(wingPos) {
    wingPos = wingPos || 'mid';
    const key = 'bird_' + wingPos;
    if (this.cache[key]) return this.cache[key];

    const w = 34, h = 24;
    const c = this.createCanvas(w, h);
    const ctx = c.getContext('2d');

    // Body
    ctx.fillStyle = '#F7DC6F';
    ctx.beginPath();
    ctx.ellipse(15, 13, 13, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#D4A017';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Belly
    ctx.fillStyle = '#FCF3CF';
    ctx.beginPath();
    ctx.ellipse(14, 16, 8, 5, -0.1, 0, Math.PI * 2);
    ctx.fill();

    // Wing
    var wingY = wingPos === 'up' ? 8 : wingPos === 'down' ? 16 : 12;
    var wingH = wingPos === 'up' ? 5 : wingPos === 'down' ? 5 : 6;
    ctx.fillStyle = '#F0B830';
    ctx.strokeStyle = '#C4960A';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(10, wingY, 8, wingH, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Eye
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.arc(23, 9, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Pupil
    ctx.fillStyle = '#222';
    ctx.beginPath();
    ctx.arc(25, 9, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Pupil highlight
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.arc(26, 8, 1, 0, Math.PI * 2);
    ctx.fill();

    // Beak
    ctx.fillStyle = '#E74C3C';
    ctx.beginPath();
    ctx.moveTo(27, 13);
    ctx.lineTo(34, 14);
    ctx.lineTo(27, 17);
    ctx.closePath();
    ctx.fill();

    this.cache[key] = c;
    return c;
  }

  drawPipe(height, flipped) {
    if (height <= 0) return this.createCanvas(52, 1);
    var w = 52, capH = 26;
    var c = this.createCanvas(w, height);
    var ctx = c.getContext('2d');

    var bodyGrad = ctx.createLinearGradient(0, 0, w, 0);
    bodyGrad.addColorStop(0, '#5EBD3E');
    bodyGrad.addColorStop(0.3, '#78D94C');
    bodyGrad.addColorStop(0.5, '#5EBD3E');
    bodyGrad.addColorStop(0.8, '#4A9E2F');
    bodyGrad.addColorStop(1, '#3D8526');

    var capGrad = ctx.createLinearGradient(0, 0, w, 0);
    capGrad.addColorStop(0, '#4A9E2F');
    capGrad.addColorStop(0.2, '#6BD648');
    capGrad.addColorStop(0.5, '#5EBD3E');
    capGrad.addColorStop(0.8, '#3D8526');
    capGrad.addColorStop(1, '#2E6B1C');

    if (flipped) {
      ctx.fillStyle = bodyGrad;
      ctx.fillRect(4, 0, w - 8, height - capH);
      ctx.fillStyle = capGrad;
      this.roundRect(ctx, 0, height - capH, w, capH, 4);
      ctx.fill();
      ctx.strokeStyle = '#2E6B1C';
      ctx.lineWidth = 2;
      this.roundRect(ctx, 0, height - capH, w, capH, 4);
      ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.fillRect(10, 0, 6, height - capH);
    } else {
      ctx.fillStyle = capGrad;
      this.roundRect(ctx, 0, 0, w, capH, 4);
      ctx.fill();
      ctx.strokeStyle = '#2E6B1C';
      ctx.lineWidth = 2;
      this.roundRect(ctx, 0, 0, w, capH, 4);
      ctx.stroke();
      ctx.fillStyle = bodyGrad;
      ctx.fillRect(4, capH, w - 8, height - capH);
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.fillRect(10, capH, 6, height - capH);
    }
    return c;
  }

  drawBackground(cw, ch) {
    var key = 'bg_' + cw + '_' + ch;
    if (this.cache[key]) return this.cache[key];

    var c = this.createCanvas(cw * 2, ch);
    var ctx = c.getContext('2d');
    var groundTop = ch - 112;

    var skyGrad = ctx.createLinearGradient(0, 0, 0, groundTop);
    skyGrad.addColorStop(0, '#4EC0CA');
    skyGrad.addColorStop(0.4, '#74D4DC');
    skyGrad.addColorStop(0.7, '#A8E6CF');
    skyGrad.addColorStop(1, '#DCEDC1');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, cw * 2, groundTop);

    // Clouds
    var drawCloud = function(cx, cy, scale) {
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.beginPath();
      ctx.arc(cx, cy, 20 * scale, 0, Math.PI * 2);
      ctx.arc(cx + 15 * scale, cy - 8 * scale, 15 * scale, 0, Math.PI * 2);
      ctx.arc(cx + 30 * scale, cy, 18 * scale, 0, Math.PI * 2);
      ctx.arc(cx + 15 * scale, cy + 5 * scale, 14 * scale, 0, Math.PI * 2);
      ctx.fill();
    };

    var clouds = [
      [60, 80, 1.2], [200, 50, 0.8], [350, 100, 1.0],
      [180, 140, 0.6], [420, 60, 0.9]
    ];
    clouds.forEach(function(p) {
      drawCloud(p[0], p[1], p[2]);
      drawCloud(p[0] + cw, p[1], p[2]);
    });

    // City silhouette
    ctx.fillStyle = '#A3BE8C';
    for (var x = 0; x < cw * 2; x += 30 + Math.random() * 20) {
      var bh = 20 + Math.random() * 50;
      var bw = 15 + Math.random() * 20;
      ctx.fillRect(x, groundTop - bh, bw, bh);
    }

    // Bushes
    ctx.fillStyle = '#6DAA5A';
    for (var x2 = 0; x2 < cw * 2; x2 += 15) {
      ctx.beginPath();
      ctx.arc(x2, groundTop, 10 + Math.random() * 8, 0, Math.PI * 2);
      ctx.fill();
    }

    this.cache[key] = c;
    return c;
  }

  drawGround(cw) {
    var key = 'ground_' + cw;
    if (this.cache[key]) return this.cache[key];

    var h = 112;
    var c = this.createCanvas(cw * 2, h);
    var ctx = c.getContext('2d');

    var dirtGrad = ctx.createLinearGradient(0, 0, 0, h);
    dirtGrad.addColorStop(0, '#DEB887');
    dirtGrad.addColorStop(0.15, '#D2A76F');
    dirtGrad.addColorStop(0.4, '#C49A5E');
    dirtGrad.addColorStop(1, '#8B6914');
    ctx.fillStyle = dirtGrad;
    ctx.fillRect(0, 0, cw * 2, h);

    var grassGrad = ctx.createLinearGradient(0, 0, 0, 16);
    grassGrad.addColorStop(0, '#7BC652');
    grassGrad.addColorStop(0.5, '#5EA83A');
    grassGrad.addColorStop(1, '#4A8F2C');
    ctx.fillStyle = grassGrad;
    ctx.fillRect(0, 0, cw * 2, 16);

    ctx.fillStyle = 'rgba(139,105,20,0.3)';
    for (var i = 0; i < 150; i++) {
      ctx.fillRect(Math.random() * cw * 2, 20 + Math.random() * (h - 24), 1 + Math.random() * 3, 1 + Math.random() * 3);
    }

    this.cache[key] = c;
    return c;
  }

  drawMedal(type) {
    var key = 'medal_' + type;
    if (this.cache[key]) return this.cache[key];

    var size = 44;
    var c = this.createCanvas(size, size);
    var ctx = c.getContext('2d');
    var cx = size / 2, cy = size / 2, r = 18;

    var colors = {
      platinum: ['#E5E8F0', '#C0C8D8', '#8090B0'],
      gold: ['#FFD700', '#FFA500', '#B8860B'],
      silver: ['#C0C0C0', '#A9A9A9', '#696969'],
      bronze: ['#CD7F32', '#A0522D', '#8B4513']
    };
    var col = colors[type] || colors.bronze;

    // Ribbon
    ctx.fillStyle = '#E74C3C';
    ctx.beginPath();
    ctx.moveTo(cx - 8, 2);
    ctx.lineTo(cx - 14, cy);
    ctx.lineTo(cx, cy - 6);
    ctx.lineTo(cx + 14, cy);
    ctx.lineTo(cx + 8, 2);
    ctx.closePath();
    ctx.fill();

    // Medal
    var grad = ctx.createRadialGradient(cx - 4, cy - 4, 2, cx, cy, r);
    grad.addColorStop(0, col[0]);
    grad.addColorStop(1, col[1]);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = col[2];
    ctx.lineWidth = 2;
    ctx.stroke();

    // Star
    ctx.fillStyle = col[2];
    ctx.beginPath();
    for (var i = 0; i < 5; i++) {
      var a = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
      ctx.lineTo(cx + Math.cos(a) * 10, cy + Math.sin(a) * 10);
      var ia = a + Math.PI / 5;
      ctx.lineTo(cx + Math.cos(ia) * 4, cy + Math.sin(ia) * 4);
    }
    ctx.closePath();
    ctx.fill();

    this.cache[key] = c;
    return c;
  }

  clearCache() {
    this.cache = {};
  }
}
