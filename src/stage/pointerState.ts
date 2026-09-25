/**
 * Where the visitor's pointer is on the laptop screen, in screen px
 * (SCREEN.w × SCREEN.h). Written by the laptop's frame loop, read by the mug.
 * `on` eases 0 → 1 while the opening laptop is hovered.
 */
export const screenPointer = { x: 0, y: 0, on: 0 };
