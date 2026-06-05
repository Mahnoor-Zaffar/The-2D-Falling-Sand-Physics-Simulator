/* ========================================================================
   input.js — Pointer Handling & Bresenham Brush
   ======================================================================== */

import {
  GRID_W, GRID_H, AIR, FIRE, STEAM,
  FIRE_LIFETIME_MIN, FIRE_LIFETIME_MAX,
  STEAM_LIFETIME_MIN, STEAM_LIFETIME_MAX,
} from "./constants.js";
import { currentGrid, inBounds, cellId, packCell, randInt } from "./grid.js";

let activeElement = 1; // Default Sand
let brushSize = 3;

let mouseDown = false;
let mouseX = -1;
let mouseY = -1;

export function getActiveElement() { return activeElement; }
export function setActiveElement(el) { activeElement = el; }

export function getBrushSize() { return brushSize; }
export function setBrushSize(size) { brushSize = size; }

/** Convert mouse/pointer event to grid coordinates */
function eventToGrid(e, canvas) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = GRID_W / rect.width;
  const scaleY = GRID_H / rect.height;
  const gx = Math.floor((e.clientX - rect.left) * scaleX);
  const gy = Math.floor((e.clientY - rect.top) * scaleY);
  return [gx, gy];
}

/** Spawn a brush stamp at (cx, cy) */
function spawnBrush(cx, cy) {
  const grid = currentGrid();
  const halfBrush = Math.floor(brushSize / 2);

  for (let dy = -halfBrush; dy <= halfBrush; dy++) {
    for (let dx = -halfBrush; dx <= halfBrush; dx++) {
      const gx = cx + dx;
      const gy = cy + dy;

      if (!inBounds(gx, gy)) continue;

      // Circular shape
      if (dx * dx + dy * dy > halfBrush * halfBrush + 1) continue;

      const gi = gy * GRID_W + gx;

      if (activeElement === AIR) {
        grid[gi] = AIR; // Eraser always overwrites
      } else {
        // Only place into empty cells
        if (cellId(grid[gi]) === AIR) {
          if (activeElement === FIRE) {
            grid[gi] = packCell(FIRE, randInt(FIRE_LIFETIME_MIN, FIRE_LIFETIME_MAX));
          } else if (activeElement === STEAM) {
            grid[gi] = packCell(STEAM, randInt(STEAM_LIFETIME_MIN, STEAM_LIFETIME_MAX));
          } else {
            grid[gi] = packCell(activeElement, 0);
          }
        }
      }
    }
  }
}

/** Bresenham line for smooth strokes */
function bresenhamLine(x0, y0, x1, y1) {
  let dx = Math.abs(x1 - x0);
  let dy = Math.abs(y1 - y0);
  let sx = x0 < x1 ? 1 : -1;
  let sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;

  while (true) {
    spawnBrush(x0, y0);

    if (x0 === x1 && y0 === y1) break;

    let e2 = 2 * err;
    if (e2 > -dy) { err -= dy; x0 += sx; }
    if (e2 < dx)  { err += dx; y0 += sy; }
  }
}

/** Attach input events to canvas */
export function initInput(canvas) {
  canvas.addEventListener("pointerdown", e => {
    e.preventDefault();
    canvas.setPointerCapture(e.pointerId);
    mouseDown = true;
    const [gx, gy] = eventToGrid(e, canvas);
    mouseX = gx;
    mouseY = gy;
    spawnBrush(gx, gy);
  });

  canvas.addEventListener("pointermove", e => {
    if (!mouseDown) return;
    e.preventDefault();
    const [gx, gy] = eventToGrid(e, canvas);

    if (mouseX >= 0 && mouseY >= 0) {
      bresenhamLine(mouseX, mouseY, gx, gy);
    } else {
      spawnBrush(gx, gy);
    }

    mouseX = gx;
    mouseY = gy;
  });

  canvas.addEventListener("pointerup", e => {
    mouseDown = false;
    mouseX = -1;
    mouseY = -1;
  });

  canvas.addEventListener("pointerleave", e => {
    mouseDown = false;
    mouseX = -1;
    mouseY = -1;
  });

  canvas.addEventListener("contextmenu", e => e.preventDefault());
}
