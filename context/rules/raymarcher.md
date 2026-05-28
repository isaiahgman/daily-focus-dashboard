# Raymarcher: Mathematical Constraints & Architecture

This document provides agents with the domain-specific constraints for the 3D Ray Marcher module (`src/modules/raymarcher/`). **Agents MUST read this before modifying any raymarcher logic.**

## Rendering Pipeline
The ray marcher uses Signed Distance Functions (SDFs) to render 3D objects as ASCII art in the terminal. The pipeline is:

1. **Camera Setup:** A fixed camera at `[0, 0, -3.5]` casts rays through a virtual viewport mapped to terminal character coordinates.
2. **Ray Marching Loop:** Each ray steps through the scene up to 40 iterations, sampling the SDF at each point. A hit is registered when the distance is below `0.005`. The maximum ray distance is `8.0`.
3. **Shading:** Lambertian diffuse shading is calculated using surface normals and a fixed light direction.
4. **ASCII Mapping:** The shading intensity is mapped to the character ramp: `' .:-=+*#%@'` (10 characters, dark to bright).

## Signed Distance Functions (SDFs)
- **`torusSDF(x, y, z, r1, r2)`**: Standard torus SDF with major radius `r1` and minor radius `r2`.
- **`sphereSDF(x, y, z, r)`**: Standard sphere SDF with radius `r`.
- **`sceneSDF(x, y, z, time, shape)`**: Applies rotation transforms (`rotateY` then `rotateX`) to the coordinate space before evaluating the chosen SDF. For spheres, a sine-based displacement is added for organic distortion.

## Surface Normals
- Normals are computed via **finite differences** with `eps = 0.001`. The gradient of the SDF is sampled along each axis and normalized.
- The fallback normal is `[0, 1, 0]` if the gradient length is zero.

## Rotation Functions
- `rotateX`, `rotateY`, `rotateZ` are standard 3D rotation matrices applied component-wise. These are pure math and should not be modified without understanding the full rotation order in `sceneSDF`.

## Critical Constraints
- **Aspect Ratio Correction:** Terminal characters are approximately twice as tall as wide. The `aspect = 2.0` factor corrects for this. Do not remove or change this without understanding the distortion it prevents.
- **Light Direction:** The normalized light vector is `[0.577, 0.577, -0.577]` (top-right-front). Changing this will fundamentally alter the visual appearance.
- **Character Ramp Order:** The shade characters go from empty space (darkest) to `@` (brightest). Reversing this inverts the shading model.
