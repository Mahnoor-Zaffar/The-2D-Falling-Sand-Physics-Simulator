/* ========================================================================
   main.js — Game Loop & Bootstrap
   ======================================================================== */

import { resizeCanvas, renderFrame, getCanvas } from "./renderer.js";
import { simulateStep } from "./simulation.js";
import { initInput } from "./input.js";
import { initUI, isPaused, getSimSpeed } from "./ui.js";

const fpsValueEl = document.getElementById("fps-value");

let fpsFrameCount = 0;
let fpsLastTime = performance.now();

function mainLoop(timestamp) {
  // FPS calculation (updates every 500ms)
  fpsFrameCount++;
  const elapsed = timestamp - fpsLastTime;
  if (elapsed >= 500) {
    const fpsCurrent = Math.round((fpsFrameCount * 1000) / elapsed);
    fpsValueEl.textContent = fpsCurrent;
    fpsFrameCount = 0;
    fpsLastTime = timestamp;
  }

  // Simulation steps (can run multiple per frame if speed slider > 1)
  if (!isPaused()) {
    const speed = getSimSpeed();
    for (let i = 0; i < speed; i++) {
      simulateStep();
    }
  }

  // Always render exactly once per frame
  renderFrame();

  requestAnimationFrame(mainLoop);
}

function bootstrap() {
  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();

  initUI();
  initInput(getCanvas());

  // Kick off loop
  requestAnimationFrame(mainLoop);
}

// Start
bootstrap();
