/**
 * Snake — Entry point & Input handling
 */

(function() {
  const canvas = document.getElementById('game-canvas');
  const game = new Game(canvas);

  /* ---- INPUT HANDLING ---- */

  const handleInput = (key) => {
    switch(key) {
      case 'ArrowUp':
      case 'KeyW':
        game.snake.setDirection(0, -1);
        break;
      case 'ArrowDown':
      case 'KeyS':
        game.snake.setDirection(0, 1);
        break;
      case 'ArrowLeft':
      case 'KeyA':
        game.snake.setDirection(-1, 0);
        break;
      case 'ArrowRight':
      case 'KeyD':
        game.snake.setDirection(1, 0);
        break;
      case 'Space':
        if (game.state === STATE.MENU || game.state === STATE.GAMEOVER) {
          game.start();
        } else {
          game.pause();
        }
        break;
      case 'KeyP':
        game.pause();
        break;
    }
  };

  // Keyboard
  window.addEventListener('keydown', (e) => {
    handleInput(e.code);
    // Prevent scrolling
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
      e.preventDefault();
    }
  });

  // Mobile Buttons
  document.getElementById('btn-up').addEventListener('click', () => game.snake.setDirection(0, -1));
  document.getElementById('btn-down').addEventListener('click', () => game.snake.setDirection(0, 1));
  document.getElementById('btn-left').addEventListener('click', () => game.snake.setDirection(-1, 0));
  document.getElementById('btn-right').addEventListener('click', () => game.snake.setDirection(1, 0));

  // UI Buttons
  document.getElementById('start-btn').addEventListener('click', () => game.start());
  document.getElementById('restart-btn').addEventListener('click', () => game.start());
  document.getElementById('resume-btn').addEventListener('click', () => game.resume());
  document.getElementById('pause-btn').addEventListener('click', () => game.pause());

  // Sound Toggle
  const soundBtn = document.getElementById('sound-btn');
  const soundOn = document.getElementById('sound-on');
  const soundOff = document.getElementById('sound-off');
  
  soundBtn.addEventListener('click', () => {
    const enabled = game.audio.toggle();
    soundOn.style.display = enabled ? 'block' : 'none';
    soundOff.style.display = enabled ? 'none' : 'block';
  });

  /* ---- MAIN LOOP ---- */

  function loop(timestamp) {
    game.update(timestamp);
    game.draw();
    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
})();
