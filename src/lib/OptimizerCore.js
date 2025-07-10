// /lib/OptimizerCore.js

import ledModules from '../data/led-modules/indoor.json' assert { type: 'json' };
import indoorCases from '../data/cases/indoor.json' assert { type: 'json' };

export const indoorLedModules = ledModules;
export function getModuleById(id) {
  return indoorLedModules.find((m) => m.id === id);
}

export function computeModuleCount(cell, moduleW, moduleH) {
  return (cell.width / moduleW) * (cell.height / moduleH);
}

export function transformLayout(layout, containerWidth) {
  const transformCell = (cell) => ({
    x: cell.y,
    y: containerWidth - cell.x - cell.width,
    width: cell.height,
    height: cell.width,
    type: cell.type,
    label: cell.label || `${cell.width}x${cell.height}`,
  });

  return {
    standardCases: layout.standardCases.map(transformCell),
    cutCases: layout.cutCases.map(transformCell),
    valid: layout.valid,
    warning: layout.warning,
  };
}


// === MAIN LAYOUT ENGINE (TRIPLE SWEEP MODE) ===
export function computeAdvancedLayout(screenWidth, screenHeight, moduleW, moduleH) {
  const layout = {
    standardCases: [],
    cutCases: [],
    valid: true,
    warning: null,
  };

  const CASE_A = indoorCases.standard.find((c) => c.label === 'A');
  const SLICED_A_HALF = indoorCases.cut.find((c) => c.label === 'A-1/2');
  const SLICED_A_THIRD = indoorCases.cut.find((c) => c.label === 'A-1/4');
  const CASE_B_H = indoorCases.standard.find((c) => c.label === 'B-H');
  const CASE_B_V = indoorCases.standard.find((c) => c.label === 'B-V');

  const bigCutSizes = indoorCases.cut
    .filter(
      (c) =>
        (c.width > moduleW || c.height > moduleH) &&
        !(c.width === 1280 && c.height === 160)
    )
    .sort((a, b) => b.width * b.height - a.width * a.height);

  const smallTileSizes = indoorCases.cut.filter(
    (c) => c.width === moduleW && c.height === moduleH
  );

  const offsetSizes = indoorCases.cut
    .filter(
      (c) =>
        (c.width < moduleW && c.height > moduleH) ||
        (c.height < moduleH && c.width > moduleW)
    )
    .sort((a, b) => b.width * b.height - a.width * a.height);

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

  const bh = placeRectBlocks(
    CASE_B_H,
    screenWidth,
    screenHeight,
    occupied,
    'standard',
    2
  );
  layout.standardCases.push(...bh.placed);
  occupied.push(...bh.placed);

  const bv = placeRectBlocks(CASE_B_V, screenWidth, screenHeight, occupied, 'standard');
  layout.standardCases.push(...bv.placed);
  occupied.push(...bv.placed);

  // === PHASE 2: Grid Sweep – Priority Big Blocks
  gridSweepFiller(layout.cutCases, occupied, screenWidth, screenHeight, bigCutSizes, moduleW, moduleH);

  // === PHASE 3: Grid Sweep – Small Filler Tiles
  gridSweepFiller(layout.cutCases, occupied, screenWidth, screenHeight, smallTileSizes, moduleW, moduleH);

  // === PHASE 4: Offset Sweep – Misaligned Cuts (catch final edge zones)
  gridOffsetSweepFiller(layout.cutCases, occupied, screenWidth, screenHeight, offsetSizes, moduleW, moduleH);

  // === Final pass to fill remaining gaps with module-sized tiles
  gridSweepFiller(layout.cutCases, occupied, screenWidth, screenHeight, smallTileSizes, moduleW, moduleH);

  return layout;
}

// === BLOCK PLACER ===
function placeRectBlocks(
  caseDef,
  maxW,
  maxH,
  existing = [],
  type = 'standard',
  maxStack = Infinity
) {
  const placed = [];
  const cols = Math.floor(maxW / caseDef.width);
  const rows = Math.min(Math.floor(maxH / caseDef.height), maxStack);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = c * caseDef.width;
      const y = r * caseDef.height;

      const overlaps = existing.some(
        (cell) =>
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
          label: caseDef.label,
        };
        placed.push(block);
        existing.push(block);
      }
    }
  }

  return { placed };
}

// === GRID SWEEP FILLER ===
function gridSweepFiller(cutCases, occupied, maxW, maxH, cutSizes, moduleW, moduleH) {
  const minW = Math.min(moduleW, ...cutSizes.map((c) => c.width));
  const minH = Math.min(moduleH, ...cutSizes.map((c) => c.height));

  const isOccupied = (x, y, w, h) =>
    occupied.some((cell) => x < cell.x + cell.width && x + w > cell.x && y < cell.y + cell.height && y + h > cell.y);

  for (let y = 0; y < maxH; y += minH) {
    for (let x = 0; x < maxW;) {
      let placed = false;
      for (let block of cutSizes) {
        const { width, height } = block;
        if (x + width <= maxW && y + height <= maxH && !isOccupied(x, y, width, height)) {
          const cut = {
            x,
            y,
            width,
            height,
            type: 'cut',
            label: `${width}x${height}`,
          };
          cutCases.push(cut);
          occupied.push(cut);
          x += width;
          placed = true;
          break;
        }
      }
      if (!placed) {
        x += minW;
      }
    }
  }
}

// === OFFSET SWEEP FILLER ===
function gridOffsetSweepFiller(cutCases, occupied, maxW, maxH, offsetSizes, moduleW, moduleH) {
  const stepX = Math.min(moduleW, ...offsetSizes.map((c) => c.width));
  const stepY = Math.min(moduleH, ...offsetSizes.map((c) => c.height));
  const isOccupied = (x, y, w, h) =>
    occupied.some((cell) => x < cell.x + cell.width && x + w > cell.x && y < cell.y + cell.height && y + h > cell.y);

  for (let y = 0; y < maxH; y += stepY) {
    for (let x = 0; x < maxW; x += stepX) {
      for (let block of offsetSizes) {
        const { width, height } = block;
        if (x + width <= maxW && y + height <= maxH && !isOccupied(x, y, width, height)) {
          const cut = {
            x,
            y,
            width,
            height,
            type: 'cut',
            label: `${width}x${height}`,
          };
          cutCases.push(cut);
          occupied.push(cut);
          break;
        }
      }
    }
  }
}
