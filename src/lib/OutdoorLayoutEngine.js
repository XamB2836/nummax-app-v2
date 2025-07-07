import outdoorCases from '../data/cases/outdoor.json';
import outdoorModules from '../data/led-modules/outdoor.json';

export const OUTDOOR_CASE_SIZES = outdoorCases;
export const OUTDOOR_LED_MODULE = outdoorModules[0];

export function computeOutdoorLayout(screenWidth, screenHeight) {
  const layout = {
    standardCases: [],
    cutCases: [],
    valid: true,
    warning: null
  };

  let y = 0;
  while (y < screenHeight) {
    let rowHeight = 0;
    let x = 0;

    while (x < screenWidth) {
      const block = OUTDOOR_CASE_SIZES.find(
        (b) => b.width <= screenWidth - x && b.height <= screenHeight - y
      );
      if (!block) break;

      layout.standardCases.push({
        x,
        y,
        width: block.width,
        height: block.height,
        type: 'standard',
        label: `${block.width}x${block.height}`
      });

      x += block.width;
      rowHeight = Math.max(rowHeight, block.height);
    }

    if (rowHeight === 0) break;
    y += rowHeight;
  }

  return layout;
}

// Backwards compatibility alias
export const chooseOutdoorLayout = computeOutdoorLayout;
