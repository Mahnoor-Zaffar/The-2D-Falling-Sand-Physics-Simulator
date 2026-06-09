/* ========================================================================
   elements/plant.js — Plant (Growing Solid) Simulation Rules
   ========================================================================
   Static solid that grows upward when Water is nearby. Burns like Wood.
   Creates organic branching structures via random growth offsets.
   ======================================================================== */

import {
  GRID_W, AIR, WATER, PLANT,
  PLANT_GROW_CHANCE, PLANT_GROW_WATER_RANGE,
} from "../constants.js";
import { cellId, packCell, inBounds, randInt } from "../grid.js";

export function simulatePlant(read, write, x, y, i, cell) {
  // ── Search nearby for water ──────────────────────────────────────
  let hasWater = false;
  const range = PLANT_GROW_WATER_RANGE;

  for (let dy = -range; dy <= range && !hasWater; dy++) {
    for (let dx = -range; dx <= range && !hasWater; dx++) {
      const nx = x + dx;
      const ny = y + dy;
      if (inBounds(nx, ny) && cellId(write[ny * GRID_W + nx]) === WATER) {
        hasWater = true;
      }
    }
  }

  if (!hasWater) return;

  // ── Grow upward with random branching ────────────────────────────
  if (Math.random() < PLANT_GROW_CHANCE) {
    // Primary direction: upward
    const growDir = Math.random();
    let gx, gy;

    if (growDir < 0.6) {
      // Straight up
      gx = x;
      gy = y - 1;
    } else if (growDir < 0.8) {
      // Up-left
      gx = x - 1;
      gy = y - 1;
    } else {
      // Up-right
      gx = x + 1;
      gy = y - 1;
    }

    if (inBounds(gx, gy)) {
      const gi  = gy * GRID_W + gx;
      const gId = cellId(write[gi]);

      // Can only grow into air or consume water
      if (gId === AIR) {
        write[gi] = packCell(PLANT, 0);
      } else if (gId === WATER) {
        // Consumes water to grow
        write[gi] = packCell(PLANT, 0);
      }
    }
  }

  // ── Occasional sideways growth for a bush look ───────────────────
  if (Math.random() < PLANT_GROW_CHANCE * 0.3) {
    const sx = x + (Math.random() < 0.5 ? -1 : 1);
    if (inBounds(sx, y)) {
      const si  = y * GRID_W + sx;
      const sId = cellId(write[si]);
      if (sId === AIR || sId === WATER) {
        write[si] = packCell(PLANT, 0);
      }
    }
  }
}
