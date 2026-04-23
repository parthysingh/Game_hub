/**
 * Snake — Snake logic
 */

class Snake {
  constructor(startX, startY) {
    this.reset(startX, startY);
  }

  reset(x, y) {
    this.segments = [
      { x: x, y: y },
      { x: x - 1, y: y },
      { x: x - 2, y: y }
    ];
    this.direction = { x: 1, y: 0 };
    this.nextDirection = { x: 1, y: 0 };
    this.growing = false;
  }

  setDirection(dx, dy) {
    // Prevent 180-degree turns
    if (dx !== 0 && this.direction.x !== 0) return;
    if (dy !== 0 && this.direction.y !== 0) return;
    
    this.nextDirection = { x: dx, y: dy };
  }

  update(cols, rows) {
    this.direction = this.nextDirection;
    
    const head = { 
      x: this.segments[0].x + this.direction.x, 
      y: this.segments[0].y + this.direction.y 
    };

    // Check wall collision
    if (head.x < 0 || head.x >= cols || head.y < 0 || head.y >= rows) {
      return false; // dead
    }

    // Check self collision
    if (this.segments.some(seg => seg.x === head.x && seg.y === head.y)) {
      return false; // dead
    }

    this.segments.unshift(head);

    if (this.growing) {
      this.growing = false;
    } else {
      this.segments.pop();
    }

    return true; // alive
  }

  grow() {
    this.growing = true;
  }

  draw(ctx, cellSize) {
    this.segments.forEach((seg, i) => {
      const isHead = i === 0;
      const margin = cellSize * 0.05;
      const size = cellSize - margin * 2;
      const px = seg.x * cellSize + margin;
      const py = seg.y * cellSize + margin;

      ctx.save();
      
      if (isHead) {
        ctx.fillStyle = '#00ff88';
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#00ff88';
      } else {
        ctx.fillStyle = '#00b894';
        // Fade tail
        ctx.globalAlpha = Math.max(0.3, 1 - (i / this.segments.length));
      }

      // Draw rounded rect
      const r = isHead ? 6 : 4;
      this.roundRect(ctx, px, py, size, size, r);
      ctx.fill();

      // Draw eyes on head
      if (isHead) {
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#000';
        const eyeSize = size * 0.15;
        
        // Position eyes based on direction
        let e1, e2;
        if (this.direction.x === 1) { // Right
          e1 = { x: px + size * 0.7, y: py + size * 0.25 };
          e2 = { x: px + size * 0.7, y: py + size * 0.65 };
        } else if (this.direction.x === -1) { // Left
          e1 = { x: px + size * 0.15, y: py + size * 0.25 };
          e2 = { x: px + size * 0.15, y: py + size * 0.65 };
        } else if (this.direction.y === 1) { // Down
          e1 = { x: px + size * 0.25, y: py + size * 0.7 };
          e2 = { x: px + size * 0.65, y: py + size * 0.7 };
        } else { // Up
          e1 = { x: px + size * 0.25, y: py + size * 0.15 };
          e2 = { x: px + size * 0.65, y: py + size * 0.15 };
        }
        
        ctx.beginPath();
        ctx.arc(e1.x + eyeSize/2, e1.y + eyeSize/2, eyeSize, 0, Math.PI * 2);
        ctx.arc(e2.x + eyeSize/2, e2.y + eyeSize/2, eyeSize, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    });
  }

  roundRect(ctx, x, y, w, h, r) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
}
