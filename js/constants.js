/* ========================================================================
   constants.js — Element IDs, Grid Dimensions, Colors, Physics Tunables
   ======================================================================== */

// Grid dimensions
export const GRID_W = 300;
export const GRID_H = 200;
export const CELL_COUNT = GRID_W * GRID_H;

// ── Element IDs (stored in bits 0–7 of each cell) ──────────────────────
export const AIR       = 0;
export const SAND      = 1;
export const WATER     = 2;
export const FIRE      = 3;
export const WOOD      = 4;
export const STONE     = 5;
export const OIL       = 6;
export const ACID      = 7;
export const STEAM     = 8;
export const SMOKE     = 9;
export const LAVA      = 10;
export const ICE       = 11;
export const GUNPOWDER = 12;
export const PLANT     = 13;
export const GLASS     = 14;
export const METAL     = 15;
export const SPAWNER   = 16;

// ── Bit-packing layout ─────────────────────────────────────────────────
//   bits  0–7  : element ID
//   bits  8–15 : lifetime / metadata (used by Fire, Lava, Steam, Smoke, Spawner)
export const ID_MASK        = 0x000000FF;
export const LIFETIME_MASK  = 0x0000FF00;
export const LIFETIME_SHIFT = 8;

// ── Gravity directions ─────────────────────────────────────────────────
export const GRAVITY_DOWN  = 0;
export const GRAVITY_UP    = 1;
export const GRAVITY_LEFT  = 2;
export const GRAVITY_RIGHT = 3;

// ── Physics tunables ───────────────────────────────────────────────────

// Fire
export const FIRE_LIFETIME_MIN   = 30;
export const FIRE_LIFETIME_MAX   = 90;
export const FIRE_SPREAD_CHANCE  = 0.08;
export const FIRE_SMOKE_CHANCE   = 0.04;

// Steam
export const STEAM_LIFETIME_MIN  = 80;
export const STEAM_LIFETIME_MAX  = 200;

// Smoke
export const SMOKE_LIFETIME_MIN  = 20;
export const SMOKE_LIFETIME_MAX  = 60;

// Oil
export const OIL_DISPERSION_MAX  = 3;
export const OIL_IGNITE_CHANCE   = 0.50;

// Acid
export const ACID_DISPERSION_MAX       = 3;
export const ACID_DISSOLVE_CHANCE_SAND  = 0.15;
export const ACID_DISSOLVE_CHANCE_WOOD  = 0.12;
export const ACID_DISSOLVE_CHANCE_STONE = 0.03;
export const ACID_DISSOLVE_CHANCE_OIL   = 0.10;
export const ACID_DISSOLVE_CHANCE_METAL = 0.06;
// Glass is immune to acid (chance = 0)

// Water
export const WATER_DISPERSION_MAX = 5;

// Lava
export const LAVA_LIFETIME_MIN   = 120;
export const LAVA_LIFETIME_MAX   = 255;
export const LAVA_COOL_CHANCE    = 0.004;
export const LAVA_DISPERSION_MAX = 2;
export const LAVA_IGNITE_CHANCE  = 0.60;

// Ice
export const ICE_MELT_CHANCE     = 0.02;
export const ICE_FREEZE_CHANCE   = 0.008;

// Gunpowder
export const GUNPOWDER_EXPLODE_RADIUS = 8;

// Plant
export const PLANT_GROW_CHANCE       = 0.01;
export const PLANT_GROW_WATER_RANGE  = 3;

// ── Color palette — [R, G, B] ─────────────────────────────────────────
export const COLORS = {
  [AIR]:       [10, 14, 23],
  [SAND]:      [224, 192, 104],
  [WATER]:     [64, 128, 255],
  [FIRE]:      [255, 96, 32],
  [WOOD]:      [139, 94, 60],
  [STONE]:     [136, 140, 152],
  [OIL]:       [60, 40, 80],
  [ACID]:      [120, 255, 60],
  [STEAM]:     [180, 200, 220],
  [SMOKE]:     [60, 60, 70],
  [LAVA]:      [255, 80, 20],
  [ICE]:       [160, 210, 240],
  [GUNPOWDER]: [90, 80, 75],
  [PLANT]:     [50, 160, 60],
  [GLASS]:     [180, 210, 230],
  [METAL]:     [170, 175, 185],
  [SPAWNER]:   [255, 255, 100],
};

// Per-element color variation ranges for visual richness
export const COLOR_VARIATION = {
  [SAND]:      { r: [-12, 12], g: [-10, 10], b: [-8, 8] },
  [WATER]:     { r: [-8, 8],   g: [-6, 12],  b: [-5, 10] },
  [FIRE]:      { r: [-20, 0],  g: [-40, 40], b: [-10, 20] },
  [WOOD]:      { r: [-10, 10], g: [-8, 8],   b: [-5, 5] },
  [STONE]:     { r: [-6, 6],   g: [-6, 6],   b: [-4, 4] },
  [OIL]:       { r: [-8, 8],   g: [-5, 5],   b: [-10, 10] },
  [ACID]:      { r: [-10, 10], g: [-8, 8],   b: [-12, 12] },
  [STEAM]:     { r: [-8, 8],   g: [-6, 6],   b: [-4, 4] },
  [SMOKE]:     { r: [-8, 8],   g: [-8, 8],   b: [-6, 6] },
  [LAVA]:      { r: [-15, 0],  g: [-30, 30], b: [-10, 10] },
  [ICE]:       { r: [-6, 6],   g: [-4, 8],   b: [-3, 5] },
  [GUNPOWDER]: { r: [-8, 8],   g: [-6, 6],   b: [-5, 5] },
  [PLANT]:     { r: [-8, 12],  g: [-15, 15], b: [-8, 8] },
  [GLASS]:     { r: [-4, 4],   g: [-3, 3],   b: [-2, 2] },
  [METAL]:     { r: [-5, 5],   g: [-5, 5],   b: [-4, 4] },
  [SPAWNER]:   { r: [-5, 5],   g: [-5, 5],   b: [-5, 5] },
};

// ── Element registry (for UI generation) ───────────────────────────────
export const ELEMENTS = [
  { id: SAND,      name: "Sand",      key: "1", color: "#E0C068", type: "solid" },
  { id: WATER,     name: "Water",     key: "2", color: "#4080FF", type: "liquid" },
  { id: FIRE,      name: "Fire",      key: "3", color: "#FF6020", type: "gas" },
  { id: WOOD,      name: "Wood",      key: "4", color: "#8B5E3C", type: "solid" },
  { id: STONE,     name: "Stone",     key: "5", color: "#888C98", type: "solid" },
  { id: OIL,       name: "Oil",       key: "6", color: "#3C2850", type: "liquid" },
  { id: ACID,      name: "Acid",      key: "7", color: "#78FF3C", type: "liquid" },
  { id: STEAM,     name: "Steam",     key: "8", color: "#B4C8DC", type: "gas" },
  { id: LAVA,      name: "Lava",      key: "9", color: "#FF5014", type: "liquid" },
  { id: ICE,       name: "Ice",       key: "0", color: "#A0D2F0", type: "solid" },
  { id: GUNPOWDER, name: "Powder",    key: "G", color: "#5A504B", type: "solid" },
  { id: PLANT,     name: "Plant",     key: "P", color: "#32A03C", type: "solid" },
  { id: GLASS,     name: "Glass",     key: "L", color: "#B4D2E6", type: "solid" },
  { id: METAL,     name: "Metal",     key: "M", color: "#AAAFB9", type: "solid" },
  { id: SPAWNER,   name: "Spawner",   key: "F", color: "#FFFF64", type: "tool" },
];

// Density ordering (higher = sinks below lower)
export const DENSITY = {
  [AIR]:       0,
  [SMOKE]:     3,
  [STEAM]:     5,
  [FIRE]:      2,
  [OIL]:       40,
  [WATER]:     60,
  [ACID]:      70,
  [SAND]:      100,
  [GUNPOWDER]: 105,
  [WOOD]:      200,
  [PLANT]:     200,
  [ICE]:       90,
  [GLASS]:     210,
  [METAL]:     230,
  [STONE]:     255,
  [LAVA]:      150,
  [SPAWNER]:   255,
};

// Elements that emit glow for bloom post-processing
export const GLOW_ELEMENTS = new Set([FIRE, LAVA, ACID]);
