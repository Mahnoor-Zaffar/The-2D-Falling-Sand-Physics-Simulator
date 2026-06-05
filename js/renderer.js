/* ========================================================================
   renderer.js — Direct ImageData Pixel Blitting
   ======================================================================== */

import {
  GRID_W, GRID_H, CELL_COUNT,
  AIR, FIRE, STEAM, SMOKE,
  ID_MASK, LIFETIME_MASK, LIFETIME_SHIFT,
  FIRE_LIFETIME_MAX, STEAM_LIFETIME_MAX, SMOKE_LIFETIME_MAX,
  COLORS, COLOR_VARIATION,
} from "./constants.js";
import { currentGrid, clamp, randInt } from "./grid.js";

// ── Canvas setup ───────────────────────────────────────────────────────

const canvas = document.getElementById("sim-canvas");
const ctx    = canvas.getContext("2d", { willReadFrequently: false });

canvas.width  = GRID_W;
canvas.height = GRID_H;

const imageData = ctx.createImageData(GRID_W, GRID_H);
const pixels    = imageData.data;

/** Resize the canvas CSS dimensions to fill its wrapper while staying pixel-perfect */
export function resizeCanvas() {
  const wrapper = document.getElementById("canvas-wrapper");
  const maxW = wrapper.clientWidth - 40;
  const maxH = wrapper.clientHeight - 40;
  const scaleX = maxW / GRID_W;
  const scaleY = maxH / GRID_H;
  const scale = Math.max(1, Math.floor(Math.min(scaleX, scaleY)));
  canvas.style.width  = (GRID_W * scale) + "px";
  canvas.style.height = (GRID_H * scale) + "px";
}

// ── Render one frame ───────────────────────────────────────────────────

let lastParticleCount = 0;

/**
 * Write the current grid state into the ImageData buffer and blit it
 * to the canvas in a single putImageData call.
 *
 * Returns the active particle count for the UI.
 */
export function renderFrame() {
  const grid = currentGrid();
  let pixIdx = 0;
  let pCount = 0;

  for (let i = 0; i < CELL_COUNT; i++) {
    const cell = grid[i];
    const id = cell & ID_MASK;

    if (id !== AIR) {
      pCount++;
    }

    const baseColor = COLORS[id];
    let r = baseColor[0];
    let g = baseColor[1];
    let b = baseColor[2];
    let a = 255;

    // Per-pixel color variation for non-air elements
    if (id !== AIR) {
      const variation = COLOR_VARIATION[id];
      if (variation) {
        // Position-based pseudo-random for spatially consistent noise
        const hash = (i * 2654435761) >>> 0;
        const hr = (hash & 0xFF) / 255;
        const hg = ((hash >>> 8) & 0xFF) / 255;
        const hb = ((hash >>> 16) & 0xFF) / 255;

        r = clamp(r + (variation.r[0] + hr * (variation.r[1] - variation.r[0])) | 0, 0, 255);
        g = clamp(g + (variation.g[0] + hg * (variation.g[1] - variation.g[0])) | 0, 0, 255);
        b = clamp(b + (variation.b[0] + hb * (variation.b[1] - variation.b[0])) | 0, 0, 255);
      }

      // Fire: dynamic flicker based on lifetime
      if (id === FIRE) {
        const lifetime = (cell & LIFETIME_MASK) >>> LIFETIME_SHIFT;
        const lifeRatio = lifetime / FIRE_LIFETIME_MAX;
        r = clamp(r + randInt(-10, 10), 180, 255);
        g = clamp((40 + lifeRatio * 180 + randInt(-20, 20)) | 0, 0, 255);
        b = clamp((lifeRatio * 60 + randInt(-5, 15)) | 0, 0, 120);
      }

      // Steam: fade out as lifetime decreases
      if (id === STEAM) {
        const lifetime = (cell & LIFETIME_MASK) >>> LIFETIME_SHIFT;
        const lifeRatio = lifetime / STEAM_LIFETIME_MAX;
        const fade = 0.3 + lifeRatio * 0.7;
        // Blend toward background
        r = clamp((10 + (r - 10) * fade) | 0, 0, 255);
        g = clamp((14 + (g - 14) * fade) | 0, 0, 255);
        b = clamp((23 + (b - 23) * fade) | 0, 0, 255);
      }

      // Smoke: fade out as lifetime decreases
      if (id === SMOKE) {
        const lifetime = (cell & LIFETIME_MASK) >>> LIFETIME_SHIFT;
        const lifeRatio = lifetime / SMOKE_LIFETIME_MAX;
        const fade = 0.2 + lifeRatio * 0.8;
        r = clamp((10 + (r - 10) * fade) | 0, 0, 255);
        g = clamp((14 + (g - 14) * fade) | 0, 0, 255);
        b = clamp((23 + (b - 23) * fade) | 0, 0, 255);
      }
    }

    pixels[pixIdx]     = r;
    pixels[pixIdx + 1] = g;
    pixels[pixIdx + 2] = b;
    pixels[pixIdx + 3] = a;
    pixIdx += 4;
  }

  // Single blit
  ctx.putImageData(imageData, 0, 0);

  lastParticleCount = pCount;
  return pCount;
}

/** Get the canvas element (for input event binding) */
export function getCanvas() {
  return canvas;
}
