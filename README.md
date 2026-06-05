# Falling Sand — Physics Simulator

![HTML5](https://img.shields.io/badge/HTML5-Canvas-E34F26?style=flat-square&logo=html5)
![Vanilla JS](https://img.shields.io/badge/Vanilla_JS-ES6+-F7DF1E?style=flat-square&logo=javascript)
![Zero Dependencies](https://img.shields.io/badge/Dependencies-0-success?style=flat-square)

A highly optimized, double-buffered 2D Cellular Automata engine built entirely in Vanilla JavaScript and HTML5 Canvas. It simulates particle physics running directly on an array buffer for maximum performance, hitting a solid 60fps even with thousands of active particles.

## Features

- **8 Distinct Elements**: Explore complex interactions between solids, liquids, and gases.
- **Double-Buffered State**: Alternating scan directions eliminate directional simulation bias.
- **Direct Pixel Blitting**: Renders instantly using a single `ImageData` buffer write per frame.
- **Time Controls**: Pause, play, or speed up the simulation up to 4×.
- **Save & Load**: Serialize the exact grid state to `localStorage` and resume later.
- **Polished UI**: Dark mode glassmorphism interface with smooth brush strokes via Bresenham line algorithms.

## Elements & Interactions

| Element | Type | Properties & Interactions |
|---------|------|---------------------------|
| 🟡 **Sand** | Solid | Falls, piles up. Sinks through liquids (Water, Oil). |
| 🔵 **Water** | Liquid | Flows horizontally. Extinguishes fire to create Steam. Sinks below Oil. |
| 🟠 **Fire** | Gas | Rises randomly. Ignites Wood and Oil. Emits Smoke. |
| 🟤 **Wood** | Solid | Static structure. Highly flammable. |
| 🔘 **Stone** | Solid | Static, immovable, indestructible wall. Resists acid. |
| 🟣 **Oil** | Liquid | Flows like water but floats *above* water. Highly flammable. |
| 🟢 **Acid** | Liquid | Slowly dissolves Sand, Wood, Stone, and Oil on contact, destroying itself. |
| 💨 **Steam** | Gas | Rises slowly, drifts sideways. Condenses back to water when cooled. |
| 🌫️ **Smoke** | Gas | Emitted by Fire. Drifts upward and safely dissipates into the air. |

## Controls & Shortcuts

| Key | Action |
|-----|--------|
| `1` – `8` | Select elements (Sand, Water, Fire, Wood, Stone, Oil, Acid, Steam) |
| `E` | Select Eraser |
| `Space` | Play / Pause simulation |
| `C` | Clear entire canvas |
| `?` | Toggle keyboard shortcuts overlay |

## Architecture Overview

The codebase is split into modular ES6 files, completely free of bundlers or build steps.

```
js/
├── main.js        # Bootstrapper and requestAnimationFrame loop
├── constants.js   # Element IDs, colors, physics tunables, layout
├── grid.js        # Double-buffer management, serialization
├── simulation.js  # Orchestrates the bottom-up sweep
├── renderer.js    # Handles direct `ctx.putImageData` blitting
├── input.js       # Pointer event handling & Bresenham brushing
├── ui.js          # DOM manipulation & keyboard listeners
└── elements/      # Individual physics logic for each particle type
```

## How to Run

Because this project uses standard ES Modules (`<script type="module">`), you just need to serve it over a local development server to bypass CORS file restrictions.

If you have Python installed:
```bash
python3 -m http.server 8080
```
Then navigate to `http://localhost:8080` in your browser.

## License

MIT
