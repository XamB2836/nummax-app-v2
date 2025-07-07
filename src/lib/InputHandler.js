// /lib/InputHandler.js

export function validateScreenDimensions(width, height, moduleW, moduleH) {
  const perfectFit = width % moduleW === 0 && height % moduleH === 0;
  const warning = perfectFit
    ? null
    : `⚠ Screen dimensions are not divisible by LED module size (${moduleW}x${moduleH}).`;
  return { valid: perfectFit, warning };
}
