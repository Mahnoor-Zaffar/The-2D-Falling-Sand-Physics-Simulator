/* ========================================================================
   elements/gunpowder.js — Gunpowder (Granular / Explosive) Simulation Rules
   ========================================================================
   Falls like sand (granular solid). Explodes on contact with Fire or Lava.
   Explosion clears a radial area, converts nearby Gunpowder to Fire for
   chain reactions, and spawns Smoke.
   ======================================================================== */

import {
  GRID_W, GRID_H,
  AIR, WATER, OIL, FIRE, LAVA, GUNPOWDER, SMOKE,
  GUNPOWDER_EXPLODE_RADIUS,
  FIRE_LIFETIME_MIN, FIRE_LIFETIME_MAX,
  SMOKE_LIFETIME_MIN, SMOKE_LIFETIME_MAX,
} from "../constants.js";
import { cellId, packCell, inBounds, randInt } from "../grid.js";

/**
 * Perform a radial explosion centered at (cx, cy).
 * Clears cells to Air, converts Gunpowder to Fire (chain reaction),
 * and spawns Smoke at the edges.
 */
function explode(write, cx, cy) {
  const r = GUNPOWDER_EXPLODE_RADIUS;

  for (let dy = -r; dy <= r; dy++) {
    for (let dx = -r; dx <= r; dx++) {
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > r) continue;

      const nx = cx + dx;
      const ny = cy + dy;
      if (!inBounds(nx, ny)) continue;

      const ni  = ny * GRID_W + nx;
      const nId = cellId(write[ni]);

      // Skip air — nothing to destroy
      if (nId === AIR) continue;

      // Chain reaction: gunpowder → fire
      if (nId === GUNPOWDER) {
        write[ni] = packCell(FIRE, randInt(FIRE_LIFETIME_MIN, FIRE_LIFETIME_MAX));
        continue;
      }

      // Edge of blast → spawn smoke
      if (dist > r * 0.7) {
        write[ni] = packCell(SMOKE, randInt(SMOKE_LIFETIME_MIN, SMOKE_LIFETIME_MAX));
        continue;
      }

      // Core of blast → destroy (unless it's indestructible)
      // Stone, Metal, Glass survive explosions
      if (nId !== 5 && nId !== 14 && nId !== 15) {
        write[ni] = AIR;
      }
    }
  }
}

export function simulateGunpowder(read, write, x, y, i, cell) {
  // ── Check for ignition by adjacent Fire/Lava ─────────────────────
  const nx4 = [x, x, x - 1, x + 1];
  const ny4 = [y - 1, y + 1, y, y];

  for (let n = 0; n < 4; n++) {
    const nx = nx4[n];
    const ny = ny4[n];

    if (!inBounds(nx, ny)) continue;

    const ni  = ny * GRID_W + nx;
    const nId = cellId(write[ni]);

    if (nId === FIRE || nId === LAVA) {
      // EXPLODE!
      explode(write, x, y);
      return;
    }
  }

  // ── Fall like sand (granular solid) ──────────────────────────────
  const below = y + 1;
  if (below >= GRID_H) return;

  const iBelow  = below * GRID_W + x;
  const belowId = cellId(write[iBelow]);

  // Fall into air
  if (belowId === AIR) {
    write[iBelow] = cell;
    write[i] = AIR;
    return;
  }

  // Sink through lighter liquids
  if (belowId === WATER || belowId === OIL) {
    const displaced = write[iBelow];
    write[iBelow] = cell;
    write[i] = displaced;
    return;
  }

  // Diagonal slide
  const leftFirst = Math.random() < 0.5;
  const dx1 = leftFirst ? -1 : 1;
  const dx2 = leftFirst ? 1 : -1;

  for (let pass = 0; pass < 2; pass++) {
    const dx = pass === 0 ? dx1 : dx2;
    const nx = x + dx;

    if (!inBounds(nx, below)) continue;

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
