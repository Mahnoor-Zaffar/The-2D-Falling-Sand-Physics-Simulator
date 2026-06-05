/* ========================================================================
   constants.js — Element IDs, Grid Dimensions, Colors, Physics Tunables
   ======================================================================== */

// Grid dimensions
export const GRID_W = 300;
export const GRID_H = 200;
export const CELL_COUNT = GRID_W * GRID_H;

// ── Element IDs (stored in bits 0–7 of each cell) ──────────────────────
export const AIR   = 0;
export const SAND  = 1;
export const WATER = 2;
export const FIRE  = 3;
export const WOOD  = 4;
export const STONE = 5;
export const OIL   = 6;
export const ACID  = 7;
export const STEAM = 8;
export const SMOKE = 9;

// ── Bit-packing layout ─────────────────────────────────────────────────
//   bits  0–7  : element ID
//   bits  8–15 : lifetime / metadata (used by Fire, Steam, Smoke, Acid)
export const ID_MASK        = 0x000000FF;
export const LIFETIME_MASK  = 0x0000FF00;
export const LIFETIME_SHIFT = 8;

// ── Physics tunables ───────────────────────────────────────────────────

// Fire
export const FIRE_LIFETIME_MIN   = 30;
export const FIRE_LIFETIME_MAX   = 90;
export const FIRE_SPREAD_CHANCE  = 0.08;  // per adjacent flammable per frame
export const FIRE_SMOKE_CHANCE   = 0.04;  // chance to emit smoke upward

// Steam
export const STEAM_LIFETIME_MIN  = 80;
export const STEAM_LIFETIME_MAX  = 200;

// Smoke
export const SMOKE_LIFETIME_MIN  = 20;
export const SMOKE_LIFETIME_MAX  = 60;

// Oil
export const OIL_DISPERSION_MAX  = 3;
export const OIL_IGNITE_CHANCE   = 0.50;  // fire → oil per frame

// Acid
export const ACID_DISPERSION_MAX = 3;
export const ACID_DISSOLVE_CHANCE_SAND  = 0.15;
export const ACID_DISSOLVE_CHANCE_WOOD  = 0.12;
export const ACID_DISSOLVE_CHANCE_STONE = 0.03;
export const ACID_DISSOLVE_CHANCE_OIL   = 0.10;

// Water
export const WATER_DISPERSION_MAX = 5;

// ── Color palette — [R, G, B, A] ──────────────────────────────────────
export const COLORS = {
  [AIR]:   [10, 14, 23, 255],
  [SAND]:  [224, 192, 104, 255],
  [WATER]: [64, 128, 255, 255],
  [FIRE]:  [255, 96, 32, 255],
  [WOOD]:  [139, 94, 60, 255],
  [STONE]: [136, 140, 152, 255],
  [OIL]:   [60, 40, 80, 255],
  [ACID]:  [120, 255, 60, 255],
  [STEAM]: [180, 200, 220, 255],
  [SMOKE]: [60, 60, 70, 255],
};

// Per-element color variation ranges for visual richness
export const COLOR_VARIATION = {
  [SAND]:  { r: [-12, 12], g: [-10, 10], b: [-8, 8] },
  [WATER]: { r: [-8, 8],   g: [-6, 12],  b: [-5, 10] },
  [FIRE]:  { r: [-20, 0],  g: [-40, 40], b: [-10, 20] },
  [WOOD]:  { r: [-10, 10], g: [-8, 8],   b: [-5, 5] },
  [STONE]: { r: [-6, 6],   g: [-6, 6],   b: [-4, 4] },
  [OIL]:   { r: [-8, 8],   g: [-5, 5],   b: [-10, 10] },
  [ACID]:  { r: [-10, 10], g: [-8, 8],   b: [-12, 12] },
  [STEAM]: { r: [-8, 8],   g: [-6, 6],   b: [-4, 4] },
  [SMOKE]: { r: [-8, 8],   g: [-8, 8],   b: [-6, 6] },
};

// ── Element registry (for UI generation) ───────────────────────────────
export const ELEMENTS = [
  { id: SAND,  name: "Sand",  key: "1", color: "#E0C068", type: "solid" },
  { id: WATER, name: "Water", key: "2", color: "#4080FF", type: "liquid" },
  { id: FIRE,  name: "Fire",  key: "3", color: "#FF6020", type: "gas" },
  { id: WOOD,  name: "Wood",  key: "4", color: "#8B5E3C", type: "solid" },
  { id: STONE, name: "Stone", key: "5", color: "#888C98", type: "solid" },
  { id: OIL,   name: "Oil",   key: "6", color: "#3C2850", type: "liquid" },
  { id: ACID,  name: "Acid",  key: "7", color: "#78FF3C", type: "liquid" },
  { id: STEAM, name: "Steam", key: "8", color: "#B4C8DC", type: "gas" },
];

// Density ordering (higher = sinks below lower):
// SAND(100) > ACID(70) > WATER(60) > OIL(40) > STEAM(5) > SMOKE(3) > AIR(0)
export const DENSITY = {
  [AIR]:   0,
  [SMOKE]: 3,
  [STEAM]: 5,
  [FIRE]:  2,
  [OIL]:   40,
  [WATER]: 60,
  [ACID]:  70,
  [SAND]:  100,
  [WOOD]:  200,
  [STONE]: 255,
};
