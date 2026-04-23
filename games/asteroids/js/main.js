/**
 * Asteroid Shooter — Entry Point & Input
 */

(function() {
  const canvas = document.getElementById('gameCanvas');
  const game = new Game(canvas);

  const startScreen = document.getElementById('start-screen');
  const startButton = document.getElementById('start-button');
  const restartButton = document.getElementById('restart-button');
  const survivalTipButton = document.getElementById('survival-tip-button');
  const survivalTipEl = document.getElementById('survival-tip');
  const messageBox = document.getElementById('message-box');

  /* ---- INPUT HANDLING ---- */

  function keyDown(ev) {
    if (game.gameOver) return;
    switch (ev.code) {
      case 'Space': game.shoot(); break;
      case 'ArrowLeft': 
      case 'KeyA': game.ship.rot = 360 / 180 * Math.PI / 60; break;
      case 'ArrowRight':
      case 'KeyD': game.ship.rot = -360 / 180 * Math.PI / 60; break;
      case 'ArrowUp':
      case 'KeyW': game.ship.upInput = true; break;
      case 'ArrowDown':
      case 'KeyS': game.ship.downInput = true; break;
    }
    // Prevent scroll
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(ev.code)) {
      ev.preventDefault();
    }
  }

  function keyUp(ev) {
    switch (ev.code) {
      case 'ArrowLeft':
      case 'KeyA':
      case 'ArrowRight':
      case 'KeyD': game.ship.rot = 0; break;
      case 'ArrowUp':
      case 'KeyW': game.ship.upInput = false; break;
      case 'ArrowDown':
      case 'KeyS': game.ship.downInput = false; break;
    }
  }

  document.addEventListener('keydown', keyDown);
  document.addEventListener('keyup', keyUp);

  /* ---- UI EVENTS ---- */

  startButton.addEventListener('click', () => {
    startScreen.classList.add('hidden');
    game.newGame();
  });

  restartButton.addEventListener('click', () => {
    messageBox.classList.add('hidden');
    survivalTipEl.textContent = '';
    game.newGame();
  });

  survivalTipButton.addEventListener('click', async () => {
    survivalTipButton.disabled = true;
    survivalTipButton.textContent = 'ANALYZING FAILURE...';
    
    // Witty fallback tips if no AI key
    const fallbacks = [
      "Try not to hit the rocks. They are harder than you.",
      "The shoot button is there for a reason. Use it.",
      "Newton's first law is a pain in space, isn't it?",
      "Spinning is a good trick, but shooting is better.",
      "The asteroids aren't aggressive. You just happen to be in their way.",
      "Oxygen is expensive. Survival is free. Figure it out."
    ];
    
    // Simulate delay
    await new Promise(r => setTimeout(r, 800));
    
    const tip = fallbacks[Math.floor(Math.random() * fallbacks.length)];
    survivalTipEl.textContent = `"${tip}"`;
    survivalTipButton.disabled = false;
    survivalTipButton.textContent = '✨ GET ANOTHER TIP';
  });

  /* ---- MAIN LOOP ---- */

  function loop(timestamp) {
    game.update();
    game.draw();
    requestAnimationFrame(loop);
  }

  window.addEventListener('resize', () => game.resize());
  requestAnimationFrame(loop);
})();
