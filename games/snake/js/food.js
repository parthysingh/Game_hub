/**
 * Snake — Food logic
 */

class Food {
  constructor(gridSize) {
    this.gridSize = gridSize;
    this.x = 0;
    this.y = 0;
  }

  /** Spawn at random position avoiding snake */
  spawn(snakeSegments, cols, rows) {
    let valid = false;
    while (!valid) {
      this.x = Math.floor(Math.random() * cols);
      this.y = Math.floor(Math.random() * rows);
      
      // Check if overlapping with snake
      valid = !snakeSegments.some(seg => seg.x === this.x && seg.y === this.y);
    }
  }

  draw(ctx, cellSize) {
    const margin = cellSize * 0.15;
    const size = cellSize - margin * 2;
    const px = this.x * cellSize + margin;
    const py = this.y * cellSize + margin;

    ctx.save();
    
    // Draw glow
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ff3e3e';
    
    // Draw food circle
    ctx.fillStyle = '#ff3e3e';
    ctx.beginPath();
    ctx.arc(px + size / 2, py + size / 2, size / 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Shine
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(px + size * 0.35, py + size * 0.35, size * 0.15, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  }
}
