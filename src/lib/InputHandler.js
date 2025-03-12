// lib/inputHandler.js
export function validateScreenDimensions(screenWidth, screenHeight, moduleWidth = 320, moduleHeight = 160) {
    if (screenWidth % moduleWidth !== 0 || screenHeight % moduleHeight !== 0) {
      return {
        valid: false,
        warning: `Screen dimensions should be a multiple of ${moduleWidth}x${moduleHeight}.`
      };
    }
    return { valid: true, warning: '' };
  }
