/* ========================================================================
   elements/steam.js — Steam (Gas) Simulation Rules
   ========================================================================
   Rises and drifts slowly. Condenses back to water when lifetime ends.
   Also used for Smoke (similar physics, different rendering/death).
   ======================================================================== */

import {
  GRID_W, AIR, WATER, STEAM, SMOKE,
} from "../constants.js";
import { cellId, cellLifetime, packCell, inBounds, randInt } from "../grid.js";

export function simulateSteam(read, write, x, y, i, cell) {
  let lifetime = cellLifetime(cell);
  const id = cellId(cell);
  
  lifetime--;

  if (lifetime <= 0) {
    if (id === STEAM) {
      write[i] = packCell(WATER, 0); // condenses to water
    } else {
      write[i] = AIR; // smoke dissipates
    }
    return;
  }

  // ── Movement: rise and drift ─────────────────────────────────────
  // Gases rise, but slowly and randomly
  
  const above = y - 1;
  const canRise = above >= 0;
  
  // Random drift even if not rising
  const driftLeft = Math.random() < 0.5;
  
  if (canRise) {
    const moves = [];
    const iUp = above * GRID_W + x;

    if (cellId(write[iUp]) === AIR) {
      moves.push(iUp);
    }
    if (inBounds(x - 1, above) && cellId(write[above * GRID_W + (x - 1)]) === AIR) {
      moves.push(above * GRID_W + (x - 1));
    }
    if (inBounds(x + 1, above) && cellId(write[above * GRID_W + (x + 1)]) === AIR) {
      moves.push(above * GRID_W + (x + 1));
    }

    if (moves.length > 0) {
      // Small chance to not rise this frame, makes it feel more gaseous
      if (Math.random() < 0.8) {
        const target = moves[randInt(0, moves.length - 1)];
        write[target] = packCell(id, lifetime);
        write[i] = AIR;
        return;
      }
    }
  }

  // Drift sideways
  const sideDir = driftLeft ? -1 : 1;
  const sx = x + sideDir;
  if (inBounds(sx, y) && cellId(write[y * GRID_W + sx]) === AIR) {
    write[y * GRID_W + sx] = packCell(id, lifetime);
    write[i] = AIR;
    return;
  }
  
  // Try other side
  const sx2 = x - sideDir;
  if (inBounds(sx2, y) && cellId(write[y * GRID_W + sx2]) === AIR) {
    write[y * GRID_W + sx2] = packCell(id, lifetime);
    write[i] = AIR;
    return;
  }

  // Stayed in place
  write[i] = packCell(id, lifetime);
}
