/* ========================================================================
   elements/water.js — Water (Liquid) Simulation Rules
   ========================================================================
   Falls down, slides diagonally, then flows sideways up to a
   random dispersion distance. Converts to Steam on contact with Fire.
   Sinks below Oil (oil floats on water).
   ======================================================================== */

import {
  GRID_W, GRID_H, AIR, OIL, FIRE, STEAM,
  WATER_DISPERSION_MAX, STEAM_LIFETIME_MIN, STEAM_LIFETIME_MAX,
} from "../constants.js";
import { cellId, packCell, inBounds, randInt } from "../grid.js";

export function simulateWater(read, write, x, y, i, cell) {
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

    // Sink below oil (water is denser)
    if (belowId === OIL) {
      const oilCell = write[iBelow];
      write[iBelow] = cell;
      write[i] = oilCell;
      return;
    }

    // Contact with fire → both become steam
    if (belowId === FIRE) {
      write[iBelow] = packCell(STEAM, randInt(STEAM_LIFETIME_MIN, STEAM_LIFETIME_MAX));
      write[i] = packCell(STEAM, randInt(STEAM_LIFETIME_MIN, STEAM_LIFETIME_MAX));
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

      if (nId === OIL) {
        const oilCell = write[ni];
        write[ni] = cell;
        write[i] = oilCell;
        return;
      }

      if (nId === FIRE) {
        write[ni] = packCell(STEAM, randInt(STEAM_LIFETIME_MIN, STEAM_LIFETIME_MAX));
        write[i]  = packCell(STEAM, randInt(STEAM_LIFETIME_MIN, STEAM_LIFETIME_MAX));
        return;
      }
    }
  }

  // ── Check adjacent fire (same row) for steam conversion ──────────
  for (let dx = -1; dx <= 1; dx += 2) {
    const nx = x + dx;
    if (inBounds(nx, y) && cellId(write[y * GRID_W + nx]) === FIRE) {
      write[y * GRID_W + nx] = packCell(STEAM, randInt(STEAM_LIFETIME_MIN, STEAM_LIFETIME_MAX));
      write[i] = packCell(STEAM, randInt(STEAM_LIFETIME_MIN, STEAM_LIFETIME_MAX));
      return;
    }
  }
  // Check above for fire
  if (y > 0 && cellId(write[(y - 1) * GRID_W + x]) === FIRE) {
    write[(y - 1) * GRID_W + x] = packCell(STEAM, randInt(STEAM_LIFETIME_MIN, STEAM_LIFETIME_MAX));
    write[i] = packCell(STEAM, randInt(STEAM_LIFETIME_MIN, STEAM_LIFETIME_MAX));
    return;
  }

  // ── Horizontal flow ──────────────────────────────────────────────
  const dispersion = randInt(1, WATER_DISPERSION_MAX);
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
