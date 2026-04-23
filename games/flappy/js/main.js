/* ============================================
   Main — Entry point, input binding, canvas
   scaling, and sound toggle wiring.
   ============================================ */

(function () {
  'use strict';

  // Canvas and game instance
  var canvas = document.getElementById('game-canvas');
  var game = new Game(canvas);

  /* ---- RESPONSIVE CANVAS SCALING ---- */

  function resizeCanvas() {
    var maxW = window.innerWidth;
    var maxH = window.innerHeight;
    var gameRatio = game.width / game.height;
    var screenRatio = maxW / maxH;

    var scale;
    if (screenRatio > gameRatio) {
      // Height-limited
      scale = maxH / game.height;
    } else {
      // Width-limited
      scale = maxW / game.width;
    }

    // Cap scale at 1.5x for crispness, min 0.5x for readability
    scale = Math.min(scale, 1.5);
    scale = Math.max(scale, 0.5);

    var displayW = Math.floor(game.width * scale);
    var displayH = Math.floor(game.height * scale);

    canvas.style.width = displayW + 'px';
    canvas.style.height = displayH + 'px';
  }

  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  /* ---- INPUT HANDLING ---- */

  // Keyboard
  document.addEventListener('keydown', function (e) {
    if (e.code === 'Space' || e.key === ' ' || e.key === 'ArrowUp') {
      e.preventDefault();
      game.handleInput();
    }
  });

  // Mouse click on canvas
  canvas.addEventListener('click', function (e) {
    e.preventDefault();
    game.handleInput();
  });

  // Touch support
  canvas.addEventListener('touchstart', function (e) {
    e.preventDefault();
    game.handleInput();
  }, { passive: false });

  // Prevent context menu on long press
  canvas.addEventListener('contextmenu', function (e) {
    e.preventDefault();
  });

  /* ---- SOUND TOGGLE ---- */

  var soundBtn = document.getElementById('sound-toggle');
  var soundOnIcon = document.getElementById('sound-on-icon');
  var soundOffIcon = document.getElementById('sound-off-icon');

  soundBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    game.audio.init();
    var enabled = game.audio.toggle();
    soundOnIcon.style.display = enabled ? 'block' : 'none';
    soundOffIcon.style.display = enabled ? 'none' : 'block';
  });

  // Prevent sound button from triggering game input
  soundBtn.addEventListener('touchstart', function (e) {
    e.stopPropagation();
  }, { passive: true });

  /* ---- START GAME LOOP ---- */

  game.start();

})();
