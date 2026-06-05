/* ========================================================================
   elements/sand.js — Sand (Granular Solid) Simulation Rules
   ========================================================================
   Falls straight down. If blocked, slides diagonally.
   Sinks through Water and Oil (density swap).
   ======================================================================== */

import { GRID_W, GRID_H, AIR, WATER, OIL } from "../constants.js";
import { cellId, inBounds } from "../grid.js";

/**
 * Simulate a single Sand cell.
 * @param {Uint32Array} read  - source grid (read-only this step)
 * @param {Uint32Array} write - destination grid (mutated)
 * @param {number} x - column
 * @param {number} y - row
 * @param {number} i - flat index
 * @param {number} cell - packed cell value
 */
export function simulateSand(read, write, x, y, i, cell) {
  const below = y + 1;

  if (below >= GRID_H) {
    return;
  }

  const iBelow  = below * GRID_W + x;
  const belowId = cellId(write[iBelow]);

  // Fall straight down into air
  if (belowId === AIR) {
    write[iBelow] = cell;
    write[i] = AIR;
    return;
  }

  // Sink through lighter liquids (water, oil) — swap
  if (belowId === WATER || belowId === OIL) {
    const displaced = write[iBelow];
    write[iBelow] = cell;
    write[i] = displaced;
    return;
  }

  // Blocked below — try diagonals (random order to avoid bias)
  const leftFirst = Math.random() < 0.5;
  const dx1 = leftFirst ? -1 : 1;
  const dx2 = leftFirst ? 1 : -1;

  for (let pass = 0; pass < 2; pass++) {
    const dx = pass === 0 ? dx1 : dx2;
    const nx = x + dx;

    if (!inBounds(nx, below)) {
      continue;
    }

    const ni   = below * GRID_W + nx;
    const nId  = cellId(write[ni]);

    if (nId === AIR) {
      write[ni] = cell;
      write[i] = AIR;
      return;
    }

    if (nId === WATER || nId === OIL) {
      const displaced = write[ni];
      write[ni] = cell;
      write[i] = displaced;
      return;
    }
  }
}
