/* ========================================================================
   simulation.js — Orchestrates the per-frame cellular automata sweep
   ======================================================================== */

import { GRID_W, GRID_H, AIR, SAND, WATER, FIRE, WOOD, STONE, OIL, ACID, STEAM, SMOKE } from "./constants.js";
import { currentGrid, nextGrid, copyCurrentToNext, swapBuffers, cellId } from "./grid.js";

import { simulateSand } from "./elements/sand.js";
import { simulateWater } from "./elements/water.js";
import { simulateFire } from "./elements/fire.js";
import { simulateWood } from "./elements/wood.js";
import { simulateStone } from "./elements/stone.js";
import { simulateOil } from "./elements/oil.js";
import { simulateAcid } from "./elements/acid.js";
import { simulateSteam } from "./elements/steam.js";

let frameParity = 0;

/**
 * Perform one full grid update step
 */
export function simulateStep() {
  const read  = currentGrid();
  const write = nextGrid();

  // Copy read → write as baseline
  copyCurrentToNext();

  // Alternate scan direction to prevent bias
  const scanLTR = (frameParity & 1) === 0;

  // Process bottom-up
  for (let y = GRID_H - 1; y >= 0; y--) {
    const xStart = scanLTR ? 0 : GRID_W - 1;
    const xEnd   = scanLTR ? GRID_W : -1;
    const xStep  = scanLTR ? 1 : -1;

    for (let x = xStart; x !== xEnd; x += xStep) {
      const i = y * GRID_W + x;
      const cell = read[i];
      const id = cellId(cell);

      if (id === AIR || id === WOOD || id === STONE) {
        continue;
      }

      switch (id) {
        case SAND:  simulateSand(read, write, x, y, i, cell); break;
        case WATER: simulateWater(read, write, x, y, i, cell); break;
        case FIRE:  simulateFire(read, write, x, y, i, cell); break;
        case OIL:   simulateOil(read, write, x, y, i, cell); break;
        case ACID:  simulateAcid(read, write, x, y, i, cell); break;
        case STEAM:
        case SMOKE: simulateSteam(read, write, x, y, i, cell); break;
      }
    }
  }

  swapBuffers();
  frameParity++;
}
