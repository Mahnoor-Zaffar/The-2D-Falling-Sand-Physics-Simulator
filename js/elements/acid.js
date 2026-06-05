/* ========================================================================
   elements/acid.js — Acid (Reactive Liquid) Simulation Rules
   ========================================================================
   Flows like water. Dissolves Sand, Wood, Stone, Oil over time.
   Destroying something consumes the Acid.
   ======================================================================== */

import {
  GRID_W, GRID_H, AIR, SAND, WOOD, STONE, OIL, WATER,
  ACID_DISPERSION_MAX,
  ACID_DISSOLVE_CHANCE_SAND, ACID_DISSOLVE_CHANCE_WOOD,
  ACID_DISSOLVE_CHANCE_STONE, ACID_DISSOLVE_CHANCE_OIL,
} from "../constants.js";
import { cellId, inBounds, randInt } from "../grid.js";

export function simulateAcid(read, write, x, y, i, cell) {
  
  // ── Dissolve nearby solids/liquids ──────────────────────────────
  const nx4 = [x, x, x - 1, x + 1];
  const ny4 = [y - 1, y + 1, y, y];
  
  // Randomize check order
  const startIdx = randInt(0, 3);
  
  for (let n = 0; n < 4; n++) {
    const idx = (startIdx + n) % 4;
    const nx = nx4[idx];
    const ny = ny4[idx];

    if (!inBounds(nx, ny)) {
      continue;
    }

    const ni  = ny * GRID_W + nx;
    const nId = cellId(write[ni]);

    let chance = 0;
    if (nId === SAND) chance = ACID_DISSOLVE_CHANCE_SAND;
    else if (nId === WOOD) chance = ACID_DISSOLVE_CHANCE_WOOD;
    else if (nId === STONE) chance = ACID_DISSOLVE_CHANCE_STONE;
    else if (nId === OIL) chance = ACID_DISSOLVE_CHANCE_OIL;

    if (chance > 0 && Math.random() < chance) {
      // Dissolve the neighbor and consume the acid
      write[ni] = AIR;
      write[i] = AIR;
      return;
    }
  }

  // ── Vertical fall ────────────────────────────────────────────────
  const below = y + 1;
  if (below < GRID_H) {
    const iBelow  = below * GRID_W + x;
    const belowId = cellId(write[iBelow]);

    // Fall into air
    if (belowId === AIR) {
      write[iBelow] = cell;
      write[i] = AIR;
      return;
    }

    // Sinks below Water and Oil
    if (belowId === WATER || belowId === OIL) {
      const displaced = write[iBelow];
      write[iBelow] = cell;
      write[i] = displaced;
      return;
    }

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

      if (nId === WATER || nId === OIL) {
        const displaced = write[ni];
        write[ni] = cell;
        write[i] = displaced;
        return;
      }
    }
  }

  // ── Horizontal flow ──────────────────────────────────────────────
  const dispersion = randInt(1, ACID_DISPERSION_MAX);
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
