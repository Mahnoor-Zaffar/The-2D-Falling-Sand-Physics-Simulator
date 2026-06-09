/* ========================================================================
   elements/ice.js — Ice (Static Solid) Simulation Rules
   ========================================================================
   Static solid block. Melts into Water near Fire or Lava.
   Freezes adjacent Water cells back into Ice (low chance).
   Creates freeze/thaw cycles near heat sources.
   ======================================================================== */

import {
  GRID_W, AIR, WATER, FIRE, LAVA, ICE,
  ICE_MELT_CHANCE, ICE_FREEZE_CHANCE,
} from "../constants.js";
import { cellId, packCell, inBounds } from "../grid.js";

export function simulateIce(read, write, x, y, i, cell) {
  const nx4 = [x, x, x - 1, x + 1];
  const ny4 = [y - 1, y + 1, y, y];

  let nearHeat = false;

  for (let n = 0; n < 4; n++) {
    const nx = nx4[n];
    const ny = ny4[n];

    if (!inBounds(nx, ny)) continue;

    const ni  = ny * GRID_W + nx;
    const nId = cellId(write[ni]);

    // Check for heat sources
    if (nId === FIRE || nId === LAVA) {
      nearHeat = true;
    }

    // Freeze adjacent Water → Ice (low chance)
    if (nId === WATER && Math.random() < ICE_FREEZE_CHANCE) {
      write[ni] = packCell(ICE, 0);
    }
  }

  // Melt if near heat
  if (nearHeat && Math.random() < ICE_MELT_CHANCE) {
    write[i] = packCell(WATER, 0);
    return;
  }

  // Also melt slowly even without heat (very low chance, ambient temp)
  if (Math.random() < ICE_MELT_CHANCE * 0.05) {
    write[i] = packCell(WATER, 0);
  }
}
