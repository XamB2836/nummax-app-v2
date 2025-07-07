// /lib/OptimizerCore.js

// === LED MODULE CONFIG ===
export const LED_STANDARD = { width: 320, height: 160 };
export const LED_ROTATED = { width: 160, height: 320 };

// === CASE SIZES ===
export const STANDARD_CASE_WIDTH = 1120;
export const STANDARD_CASE_HEIGHT = 640;

// === PANEL CONFIG ===
import indoorPanels from '@/data/indoorPanels.json';
export const ledPanels = indoorPanels;

// === MODULE COUNT CALC ===
export function computeModuleCount(cell, moduleW, moduleH) {
  return (cell.width / moduleW) * (cell.height / moduleH);
}

// === ROTATED LAYOUT TRANSFORM ===
export function transformLayout(layout, containerWidth) {
  const transformCell = (cell) => ({
    x: cell.y,
    y: containerWidth - cell.x - cell.width,
    width: cell.height,
    height: cell.width,
    type: cell.type,
    label: cell.label || `${cell.width}x${cell.height}`
  });

  return {
    standardCases: layout.standardCases.map(transformCell),
    cutCases: layout.cutCases.map(transformCell),
    valid: layout.valid,
    warning: layout.warning
  };
}

// === MAIN LAYOUT ENGINE (TRIPLE SWEEP MODE) ===
export function computeAdvancedLayout(screenWidth, screenHeight) {
  const layout = {
    standardCases: [],
    cutCases: [],
    valid: true,
    warning: null
  };

  const CASE_A = { width: 1120, height: 640, label: 'A' };
  const SLICED_A_HALF = { width: 1120, height: 320, label: 'A-1/2' };
  const SLICED_A_THIRD = { width: 1120, height: 160, label: 'A-1/4' };
  const CASE_B_H = { width: 1280, height: 160, label: 'B-H' };
  const CASE_B_V = { width: 160, height: 1280, label: 'B-V' };

  const bigCutSizes = [
    { width: 1280, height: 160 },
    { width: 160, height: 1280 },
    { width: 1120, height: 320 },
    { width: 1120, height: 160 },
    { width: 960, height: 160 },
    { width: 640, height: 160 }
  ];

  const smallTileSizes = [
    { width: 320, height: 160 }
  ];

  const offsetSizes = [
    { width: 160, height: 960 },
    { width: 160, height: 640 },
    { width: 160, height: 320 },
    { width: 320, height: 160 }
  ];

  // === PHASE 1: Standard placements
  const fullA = placeRectBlocks(CASE_A, screenWidth, screenHeight, [], 'standard');
  layout.standardCases.push(...fullA.placed);
  const occupied = [...layout.standardCases];

  const slicedHalf = placeRectBlocks(SLICED_A_HALF, screenWidth, screenHeight, occupied, 'cut');
  layout.cutCases.push(...slicedHalf.placed);
  occupied.push(...slicedHalf.placed);

  const slicedThird = placeRectBlocks(SLICED_A_THIRD, screenWidth, screenHeight, occupied, 'cut');
  layout.cutCases.push(...slicedThird.placed);
  occupied.push(...slicedThird.placed);

  const bh = placeRectBlocks(CASE_B_H, screenWidth, screenHeight, occupied, 'standard');
  layout.standardCases.push(...bh.placed);
  occupied.push(...bh.placed);

  const bv = placeRectBlocks(CASE_B_V, screenWidth, screenHeight, occupied, 'standard');
  layout.standardCases.push(...bv.placed);
  occupied.push(...bv.placed);

  // === PHASE 2: Grid Sweep – Priority Big Blocks
  gridSweepFiller(layout.cutCases, occupied, screenWidth, screenHeight, bigCutSizes);

  // === PHASE 3: Grid Sweep – Small Filler Tiles
  gridSweepFiller(layout.cutCases, occupied, screenWidth, screenHeight, smallTileSizes);

  // === PHASE 4: Offset Sweep – Misaligned Cuts (catch final edge zones)
  gridOffsetSweepFiller(layout.cutCases, occupied, screenWidth, screenHeight, offsetSizes);

  return layout;
}

// === BLOCK PLACER ===
function placeRectBlocks(caseDef, maxW, maxH, existing = [], type = 'standard') {
  const placed = [];
  const cols = Math.floor(maxW / caseDef.width);
  const rows = Math.floor(maxH / caseDef.height);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = c * caseDef.width;
      const y = r * caseDef.height;

      const overlaps = existing.some(cell =>
        x < cell.x + cell.width &&
        x + caseDef.width > cell.x &&
        y < cell.y + cell.height &&
        y + caseDef.height > cell.y
      );

      if (!overlaps) {
        const block = {
          x,
          y,
          width: caseDef.width,
          height: caseDef.height,
          type,
          label: caseDef.label
        };
        placed.push(block);
        existing.push(block);
      }
    }
  }

  return { placed };
}

// === GRID SWEEP FILLER ===
function gridSweepFiller(cutCases, occupied, maxW, maxH, cutSizes) {
  const minW = LED_STANDARD.width;
  const minH = LED_STANDARD.height;

  const isOccupied = (x, y, w, h) =>
    occupied.some(cell =>
      x < cell.x + cell.width &&
      x + w > cell.x &&
      y < cell.y + cell.height &&
      y + h > cell.y
    );

  for (let y = 0; y + minH <= maxH; y += minH) {
    for (let x = 0; x + minW <= maxW; x += minW) {
      for (let block of cutSizes) {
        const { width, height } = block;
        if (x + width <= maxW && y + height <= maxH && !isOccupied(x, y, width, height)) {
          const cut = {
            x,
            y,
            width,
            height,
            type: 'cut',
            label: `${width}x${height}`
          };
          cutCases.push(cut);
          occupied.push(cut);
          break;
        }
      }
    }
  }
}

// === OFFSET SWEEP FILLER ===
function gridOffsetSweepFiller(cutCases, occupied, maxW, maxH, offsetSizes) {
  const isOccupied = (x, y, w, h) =>
    occupied.some(cell =>
      x < cell.x + cell.width &&
      x + w > cell.x &&
      y < cell.y + cell.height &&
      y + h > cell.y
    );

  for (let y = 0; y <= maxH - 160; y += 160) {
    for (let x = 0; x <= maxW - 160; x += 160) {
      for (let block of offsetSizes) {
        const { width, height } = block;
        if (x + width <= maxW && y + height <= maxH && !isOccupied(x, y, width, height)) {
          const cut = {
            x,
            y,
            width,
            height,
            type: 'cut',
            label: `${width}x${height}`
          };
          cutCases.push(cut);
          occupied.push(cut);
          break;
        }
      }
    }
  }
}
