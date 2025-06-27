// /lib/InputHandler.js

import { LED_STANDARD } from './OptimizerCore';

export function validateScreenDimensions(width, height) {
  const perfectFit =
    width % LED_STANDARD.width === 0 && height % LED_STANDARD.height === 0;

  const warning = perfectFit
    ? null
    : "⚠ Screen dimensions are not divisible by LED module size (320x160).";

  return { valid: perfectFit, warning };
}
