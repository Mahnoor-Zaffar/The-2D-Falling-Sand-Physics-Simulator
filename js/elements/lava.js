/* ========================================================================
   elements/lava.js — Lava (Dense Liquid / Reactive) Simulation Rules
   ========================================================================
   Flows slowly like a dense liquid. Ignites Wood, Oil, Gunpowder, Plant.
   Turns Water into Steam. Slowly cools into Stone.
   Sand + Lava contact → Glass.
   ======================================================================== */

import {
  GRID_W, GRID_H,
  AIR, SAND, WATER, WOOD, OIL, FIRE, STEAM, SMOKE, STONE, GLASS,
  GUNPOWDER, PLANT, LAVA,
  LAVA_COOL_CHANCE, LAVA_DISPERSION_MAX, LAVA_IGNITE_CHANCE,
  FIRE_LIFETIME_MIN, FIRE_LIFETIME_MAX,
  STEAM_LIFETIME_MIN, STEAM_LIFETIME_MAX,
  SMOKE_LIFETIME_MIN, SMOKE_LIFETIME_MAX,
  ID_MASK, LIFETIME_MASK, LIFETIME_SHIFT,
} from "../constants.js";
import { cellId, cellLifetime, packCell, inBounds, randInt } from "../grid.js";

export function simulateLava(read, write, x, y, i, cell) {
  let lifetime = cellLifetime(cell);

  // ── Cool into Stone over time ────────────────────────────────────
  if (Math.random() < LAVA_COOL_CHANCE) {
    lifetime -= 1;
  }
  if (lifetime <= 0) {
    write[i] = packCell(STONE, 0);
    return;
  }

  // ── React with neighbors ─────────────────────────────────────────
  const nx4 = [x, x, x - 1, x + 1];
  const ny4 = [y - 1, y + 1, y, y];

  for (let n = 0; n < 4; n++) {
    const nx = nx4[n];
    const ny = ny4[n];

    if (!inBounds(nx, ny)) continue;

    const ni  = ny * GRID_W + nx;
    const nId = cellId(write[ni]);

    // Water → Steam (both cells)
    if (nId === WATER) {
      write[ni] = packCell(STEAM, randInt(STEAM_LIFETIME_MIN, STEAM_LIFETIME_MAX));
      // Lava cools slightly
      lifetime = Math.max(1, lifetime - 10);
      write[i] = packCell(LAVA, lifetime);
      return;
    }

    // Sand → Glass
    if (nId === SAND) {
      write[ni] = packCell(GLASS, 0);
      continue;
    }

    // Ignite flammables
    if ((nId === WOOD || nId === OIL || nId === PLANT) && Math.random() < LAVA_IGNITE_CHANCE) {
      write[ni] = packCell(FIRE, randInt(FIRE_LIFETIME_MIN, FIRE_LIFETIME_MAX));
    }

    // Gunpowder → explodes (handled by gunpowder.js, but we can also ignite it)
    if (nId === GUNPOWDER && Math.random() < LAVA_IGNITE_CHANCE) {
      write[ni] = packCell(FIRE, randInt(FIRE_LIFETIME_MIN, FIRE_LIFETIME_MAX));
    }
  }

  // ── Emit smoke occasionally ──────────────────────────────────────
  if (y >= 2 && Math.random() < 0.02) {
    const smokeI = (y - 2) * GRID_W + x;
    if (cellId(write[smokeI]) === AIR) {
      write[smokeI] = packCell(SMOKE, randInt(SMOKE_LIFETIME_MIN, SMOKE_LIFETIME_MAX));
    }
  }

  // ── Vertical fall (dense liquid) ─────────────────────────────────
  const below = y + 1;
  if (below < GRID_H) {
    const iBelow  = below * GRID_W + x;
    const belowId = cellId(write[iBelow]);

    if (belowId === AIR) {
      write[iBelow] = packCell(LAVA, lifetime);
      write[i] = AIR;
      return;
    }

    // Sink through lighter liquids (water, oil)
    if (belowId === WATER || belowId === OIL) {
      const displaced = write[iBelow];
      write[iBelow] = packCell(LAVA, lifetime);
      write[i] = displaced;
      return;
    }

    // Diagonal down
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
        write[ni] = packCell(LAVA, lifetime);
        write[i] = AIR;
        return;
      }

      if (nId === WATER || nId === OIL) {
        const displaced = write[ni];
        write[ni] = packCell(LAVA, lifetime);
        write[i] = displaced;
        return;
      }
    }
  }

  // ── Slow horizontal flow ─────────────────────────────────────────
  const dispersion = randInt(1, LAVA_DISPERSION_MAX);
  const leftFirst = Math.random() < 0.5;
  const dir1 = leftFirst ? -1 : 1;
  const dir2 = leftFirst ? 1 : -1;

  for (let pass = 0; pass < 2; pass++) {
    const dir = pass === 0 ? dir1 : dir2;
    let bestIdx = -1;

    for (let d = 1; d <= dispersion; d++) {
      const nx = x + dir * d;
      if (!inBounds(nx, y)) break;
      const ni = y * GRID_W + nx;
      if (cellId(write[ni]) !== AIR) break;
      bestIdx = ni;
    }

    if (bestIdx !== -1) {
      write[bestIdx] = packCell(LAVA, lifetime);
      write[i] = AIR;
      return;
    }
  }

  // Stayed in place — update lifetime
  write[i] = packCell(LAVA, lifetime);
}
