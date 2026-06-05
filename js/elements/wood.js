/* ========================================================================
   elements/wood.js — Wood (Solid / Flammable) Simulation Rules
   ========================================================================
   Wood is completely static and does not move.
   Its only behavior is reacting to Fire (handled by fire.js) and Acid.
   We still need an empty module for structural consistency.
   ======================================================================== */

export function simulateWood(read, write, x, y, i, cell) {
  // Wood does nothing on its own tick.
}
