export const OUTDOOR_CASE_SIZES = [
  { width: 1600, height: 960 },
  { width: 1600, height: 640 },
  { width: 1600, height: 320 },
  { width: 1280, height: 960 },
  { width: 1280, height: 640 },
  { width: 1280, height: 320 },
  { width: 960, height: 960 },
  { width: 960, height: 640 },
  { width: 960, height: 320 },
  { width: 640, height: 320 }
];

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
