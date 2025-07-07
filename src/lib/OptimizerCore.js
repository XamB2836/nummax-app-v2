// /lib/OptimizerCore.js

import indoorModules from '../data/led-modules/indoor.json';
import indoorCases from '../data/cases/indoor.json';
import indoorPanels from '../data/panels/indoor.json';

// === LED MODULE CONFIG ===
export const LED_STANDARD = indoorModules.find(m => m.label === 'standard');
export const LED_ROTATED = indoorModules.find(m => m.label === 'rotated');

// === CASE SIZES ===
// indoor case dimensions are defined in src/data/cases/indoor.json

// === PANEL CONFIG ===
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

  const CASE_A = indoorCases.standard.find(c => c.label === 'A');
  const SLICED_A_HALF = indoorCases.cut.find(c => c.label === 'A-1/2');
  const SLICED_A_THIRD = indoorCases.cut.find(c => c.label === 'A-1/4');
  const CASE_B_H = indoorCases.standard.find(c => c.label === 'B-H');
  const CASE_B_V = indoorCases.standard.find(c => c.label === 'B-V');

  const bigCutSizes = indoorCases.cut.filter(c =>
    [
      '1280x160',
      '160x1280',
      '1120x320',
      '1120x160',
      '960x160',
      '640x160'
    ].includes(`${c.width}x${c.height}`)
  );

  const smallTileSizes = indoorCases.cut.filter(c => c.width === 320 && c.height === 160);

  const offsetSizes = indoorCases.cut.filter(c =>
    [
      '160x960',
      '160x640',
      '160x320',
      '320x160'
    ].includes(`${c.width}x${c.height}`)
  );

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
