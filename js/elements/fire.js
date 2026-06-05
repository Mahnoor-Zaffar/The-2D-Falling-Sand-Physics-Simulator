/* ========================================================================
   elements/fire.js — Fire (Gas / Reactive) Simulation Rules
   ========================================================================
   Rises upward randomly. Ticks down a lifetime counter; at 0 → Air.
   Ignites adjacent Wood and Oil. Emits Smoke particles upward.
   ======================================================================== */

import {
  GRID_W, GRID_H, AIR, WOOD, OIL, FIRE, SMOKE,
  FIRE_LIFETIME_MIN, FIRE_LIFETIME_MAX,
  FIRE_SPREAD_CHANCE, FIRE_SMOKE_CHANCE, OIL_IGNITE_CHANCE,
  SMOKE_LIFETIME_MIN, SMOKE_LIFETIME_MAX,
} from "../constants.js";
import { cellId, cellLifetime, packCell, inBounds, randInt } from "../grid.js";

export function simulateFire(read, write, x, y, i, cell) {
  // Decrement lifetime
  let lifetime = cellLifetime(cell);
  lifetime--;

  if (lifetime <= 0) {
    // Small chance to leave smoke on death
    if (Math.random() < 0.3) {
      write[i] = packCell(SMOKE, randInt(SMOKE_LIFETIME_MIN, SMOKE_LIFETIME_MAX));
    } else {
      write[i] = AIR;
    }
    return;
  }

  // ── Spread to adjacent flammables ────────────────────────────────
  const nx8 = [x - 1, x + 1, x, x, x - 1, x + 1, x - 1, x + 1];
  const ny8 = [y, y, y - 1, y + 1, y - 1, y - 1, y + 1, y + 1];

  for (let n = 0; n < 8; n++) {
    const nx = nx8[n];
    const ny = ny8[n];

    if (!inBounds(nx, ny)) {
      continue;
    }

    const ni  = ny * GRID_W + nx;
    const nId = cellId(write[ni]);

    if (nId === WOOD && Math.random() < FIRE_SPREAD_CHANCE) {
      write[ni] = packCell(FIRE, randInt(FIRE_LIFETIME_MIN, FIRE_LIFETIME_MAX));
    }

    if (nId === OIL && Math.random() < OIL_IGNITE_CHANCE) {
      write[ni] = packCell(FIRE, randInt(FIRE_LIFETIME_MIN, FIRE_LIFETIME_MAX));
    }
  }

  // ── Emit smoke upward ────────────────────────────────────────────
  if (y >= 2 && Math.random() < FIRE_SMOKE_CHANCE) {
    const smokeY = y - 2;
    const smokeI = smokeY * GRID_W + x;
    if (cellId(write[smokeI]) === AIR) {
      write[smokeI] = packCell(SMOKE, randInt(SMOKE_LIFETIME_MIN, SMOKE_LIFETIME_MAX));
    }
  }

  // ── Movement: rise upward (up, up-left, up-right) ───────────────
  const above = y - 1;
  if (above >= 0) {
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
      const target = moves[randInt(0, moves.length - 1)];
      write[target] = packCell(FIRE, lifetime);
      write[i] = AIR;
      return;
    }

    // Can't go up → try sideways
    const sideDir = Math.random() < 0.5 ? -1 : 1;
    const sx = x + sideDir;
    if (inBounds(sx, y) && cellId(write[y * GRID_W + sx]) === AIR) {
      write[y * GRID_W + sx] = packCell(FIRE, lifetime);
      write[i] = AIR;
      return;
    }
  }

  // Stayed in place — update lifetime
  write[i] = packCell(FIRE, lifetime);
}
