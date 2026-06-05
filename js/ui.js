/* ========================================================================
   ui.js — Toolbar, Keyboard Shortcuts, Save/Load, Settings
   ======================================================================== */

import { ELEMENTS, AIR } from "./constants.js";
import { getActiveElement, setActiveElement, setBrushSize } from "./input.js";
import { clearAll, serialize, deserialize } from "./grid.js";

let paused = false;
let simSpeed = 1;

export function isPaused() { return paused; }
export function getSimSpeed() { return simSpeed; }

export function initUI() {
  const btnContainer = document.getElementById("element-buttons");

  // Dynamically generate element buttons
  ELEMENTS.forEach(el => {
    const btn = document.createElement("button");
    btn.className = `element-btn ${el.id === getActiveElement() ? "active" : ""}`;
    btn.dataset.element = el.id;
    btn.innerHTML = `
      <span class="swatch" style="--swatch-color: ${el.color};"></span>
      <span class="btn-label">${el.name}</span>
      <span class="btn-key">${el.key}</span>
    `;
    btn.addEventListener("click", () => selectElement(el.id));
    btnContainer.appendChild(btn);
  });

  // Add Eraser
  const eraserBtn = document.createElement("button");
  eraserBtn.className = "element-btn";
  eraserBtn.dataset.element = AIR;
  eraserBtn.innerHTML = `
    <span class="swatch eraser-swatch"></span>
    <span class="btn-label">Eraser</span>
    <span class="btn-key">E</span>
  `;
  eraserBtn.addEventListener("click", () => selectElement(AIR));
  btnContainer.appendChild(eraserBtn);

  // Brush Size
  const brushSlider = document.getElementById("brush-size");
  const brushValue  = document.getElementById("brush-size-value");
  brushSlider.addEventListener("input", () => {
    const val = parseInt(brushSlider.value, 10);
    setBrushSize(val);
    brushValue.textContent = val;
  });

  // Speed Slider
  const speedSlider = document.getElementById("sim-speed");
  const speedValue  = document.getElementById("sim-speed-value");
  speedSlider.addEventListener("input", () => {
    simSpeed = parseInt(speedSlider.value, 10);
    speedValue.textContent = simSpeed + "×";
  });

  // Actions
  document.getElementById("btn-clear").addEventListener("click", clearAll);
  
  const pauseBtn = document.getElementById("btn-pause");
  pauseBtn.addEventListener("click", togglePause);

  document.getElementById("btn-save").addEventListener("click", () => {
    const data = serialize();
    localStorage.setItem("sand_save", data);
    
    const btn = document.getElementById("btn-save");
    const orig = btn.innerHTML;
    btn.innerHTML = `<span>✅</span> Saved`;
    setTimeout(() => btn.innerHTML = orig, 1500);
  });

  document.getElementById("btn-load").addEventListener("click", () => {
    const data = localStorage.getItem("sand_save");
    if (data) deserialize(data);
  });

  // Shortcuts overlay
  const overlay = document.getElementById("shortcuts-overlay");
  document.getElementById("btn-help").addEventListener("click", () => {
    overlay.classList.toggle("hidden");
  });
  overlay.addEventListener("click", () => overlay.classList.add("hidden"));

  // Keyboard
  document.addEventListener("keydown", (e) => {
    // Ignore if typing in an input (not that we have any, but good practice)
    if (e.target.tagName === "INPUT") return;

    const key = e.key.toLowerCase();
    
    // Elements (1-8)
    const elMatch = ELEMENTS.find(el => el.key.toLowerCase() === key);
    if (elMatch) selectElement(elMatch.id);
    else if (key === "e") selectElement(AIR);
    
    // Actions
    else if (key === " ") {
      e.preventDefault();
      togglePause();
    }
    else if (key === "c") clearAll();
    else if (key === "?") overlay.classList.toggle("hidden");
  });
}

function selectElement(id) {
  setActiveElement(id);
  document.querySelectorAll(".element-btn").forEach(btn => {
    btn.classList.toggle("active", parseInt(btn.dataset.element, 10) === id);
  });
}

function togglePause() {
  paused = !paused;
  document.getElementById("pause-icon").textContent  = paused ? "▶️" : "⏸️";
  document.getElementById("pause-label").textContent = paused ? "Play" : "Pause";
}
