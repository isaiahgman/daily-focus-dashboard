# Project Overview: Terminal Multiverse

This document provides agents with a high-level understanding of the repository's purpose, technology stack, and architecture. **Agents must read this to understand the boundaries and capabilities of the application before suggesting complex changes.**

## The Application
Terminal Multiverse is a unified interactive Node.js console application. It acts as a sandbox containing 11 distinct mathematical, visual, and cryptographic simulation modules.

Users launch the application, are presented with an interactive menu, and can dive into one of the simulations. The app heavily leverages terminal output manipulation for visuals (ASCII art, line clearing, colors).

## Technology Stack
- **Runtime:** Node.js (v20+ recommended)
- **Language:** TypeScript
- **Module Resolution:** Strict `NodeNext` ESM (all local imports must end in `.js`).
- **Styling/UI:** 
  - `chalk`: Used for terminal text coloring.
  - `boxen`: Used for drawing borders and frames around text.
- **Testing:** `vitest`
- **Linting & Formatting:** ESLint and Prettier.

## The Modules
The application routes to 11 distinct modules. Each module lives in `src/modules/<feature_name>/`:
1. **L-System Fractal Garden:** Procedural organic structure engine mapping formal grammars.
2. **Conway's Game of Life:** Interactive cellular automata.
3. **3D Ray Marcher:** Real-time 3D camera ray tracer with ASCII rendering.
4. **Chaos Game Fractal Generator:** Emergent geometric Sierpinski fractals.
5. **Markov Chain Text Generator:** Generates procedural nonsense text from corpus presets.
6. **Morse WAV Audio Exporter:** Translates strings to Morse and generates `.wav` audio files.
7. **Maze Generator & Solver:** DFS generation and BFS pathfinding animation.
8. **Fourier Waveform Synthesizer:** Sums sinusoidal harmonics into waveforms.
9. **Enigma Cipher Machine:** Symmetric cryptography emulator.
10. **Collatz Conjecture Plotter:** Computes sequences and plots terminal graphs.
11. **Visual Diff Comparison:** Side-by-side text difference comparisons.

## Architectural Paradigm
Every module strictly adheres to a separation of concerns to maintain testability and purity:
1. **`core.ts`**: Contains pure, side-effect-free logic. It handles all computation, transformations, and algorithms. It must **never** read from `stdin` or write to `stdout`.
2. **`runner.ts`**: The execution loop. It calls functions from `core.ts`, handles interactive CLI inputs via Node's `readline`, and renders frames to the terminal using `chalk` and `boxen`.
3. **`__tests__/core.test.ts`**: Automated unit tests targeting `core.ts`.

Agents must respect this boundary. **Never put `console.log` or styling logic inside a `core.ts` file.**
