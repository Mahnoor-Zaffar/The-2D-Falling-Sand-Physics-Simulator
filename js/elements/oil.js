/* ========================================================================
   elements/oil.js — Oil (Liquid / Flammable) Simulation Rules
   ========================================================================
   Flows like water but floats *above* water (water is denser).
   Highly flammable.
   ======================================================================== */

import {
  GRID_W, GRID_H, AIR, WATER,
  OIL_DISPERSION_MAX,
} from "../constants.js";
import { cellId, inBounds, randInt } from "../grid.js";

export function simulateOil(read, write, x, y, i, cell) {
  const below = y + 1;

  // ── Vertical fall ────────────────────────────────────────────────
  if (below < GRID_H) {
    const iBelow  = below * GRID_W + x;
    const belowId = cellId(write[iBelow]);

    // Fall into air
    if (belowId === AIR) {
      write[iBelow] = cell;
      write[i] = AIR;
      return;
    }

    // Float above water (if below is water, swap them so oil goes up, water goes down)
    // Actually, water sinks through oil, so oil rises through water.
    // If oil is above water, they should swap. Wait, water sinks through oil in sand.js/water.js?
    // Water currently only sinks through oil if oil is BELOW water. Wait, if water falls on oil, they swap.
    // If oil is above water, it shouldn't swap. Oil stays on top.
    // So if below is WATER, oil does nothing (it floats).

    // Diagonal down (random order)
    const leftFirst = Math.random() < 0.5;
    const dx1 = leftFirst ? -1 : 1;
    const dx2 = leftFirst ? 1 : -1;

    for (let pass = 0; pass < 2; pass++) {
      const dx = pass === 0 ? dx1 : dx2;
      const nx = x + dx;

      if (!inBounds(nx, below)) {
        continue;
      }

      const ni  = below * GRID_W + nx;
      const nId = cellId(write[ni]);

      if (nId === AIR) {
        write[ni] = cell;
        write[i] = AIR;
        return;
      }
    }
  }

  // ── Horizontal flow ──────────────────────────────────────────────
  const dispersion = randInt(1, OIL_DISPERSION_MAX);
  const leftFirst = Math.random() < 0.5;
  const dir1 = leftFirst ? -1 : 1;
  const dir2 = leftFirst ? 1 : -1;

  for (let pass = 0; pass < 2; pass++) {
    const dir = pass === 0 ? dir1 : dir2;
    let bestIdx = -1;

    for (let d = 1; d <= dispersion; d++) {
      const nx = x + dir * d;
      if (!inBounds(nx, y)) {
        break;
      }
      const ni = y * GRID_W + nx;
      
      // Oil can flow into AIR. Can it flow through WATER horizontally? No, it floats.
      if (cellId(write[ni]) !== AIR) {
        break;
      }
      bestIdx = ni;
    }

    if (bestIdx !== -1) {
      write[bestIdx] = cell;
      write[i] = AIR;
      return;
    }
  }
}
