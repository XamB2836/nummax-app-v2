// /lib/OptimizerCore.js

import ledModules from '../data/led-modules/indoor.json';
import indoorCases from '../data/cases/indoor.json';

export const indoorLedModules = ledModules;
export function getModuleById(id) {
  return indoorLedModules.find((m) => m.id === id);
}

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

  const caseFits = (c) =>
    (c.width % moduleW === 0 && c.height % moduleH === 0) ||
    (c.width % moduleH === 0 && c.height % moduleW === 0);

  const stdCases = [CASE_A, CASE_B_H, CASE_B_V].filter((c) => c && caseFits(c));
  const cutCases = [SLICED_A_HALF, SLICED_A_THIRD].filter((c) => c && caseFits(c));

  const bigCutSizes = indoorCases.cut
    .filter((c) => caseFits(c))
    .sort((a, b) => b.width * b.height - a.width * a.height);

  const smallTileSizes = indoorCases.cut.filter(
    (c) => c.width === moduleW && c.height === moduleH
  );

  const offsetSizes = indoorCases.cut.filter(
    (c) =>
      caseFits(c) &&
      ['160x960', '160x640', '160x320', '320x160'].includes(`${c.width}x${c.height}`)
  );

  // === PHASE 1: Standard placements
  const occupied = [];
  stdCases.forEach((def) => {
    const placed = placeRectBlocks(def, screenWidth, screenHeight, occupied, 'standard');
    layout.standardCases.push(...placed.placed);
    occupied.push(...placed.placed);
  });

  cutCases.forEach((def) => {
    const placed = placeRectBlocks(def, screenWidth, screenHeight, occupied, 'cut');
    layout.cutCases.push(...placed.placed);
    occupied.push(...placed.placed);
  });

  // === PHASE 2: Grid Sweep – Priority Big Blocks
  gridSweepFiller(layout.cutCases, occupied, screenWidth, screenHeight, bigCutSizes, moduleW, moduleH);

  // === PHASE 3: Grid Sweep – Small Filler Tiles
  gridSweepFiller(layout.cutCases, occupied, screenWidth, screenHeight, smallTileSizes, moduleW, moduleH);

  // === PHASE 4: Offset Sweep – Misaligned Cuts (catch final edge zones)
  gridOffsetSweepFiller(layout.cutCases, occupied, screenWidth, screenHeight, offsetSizes, moduleW, moduleH);

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
  const minW = moduleW;
  const minH = moduleH;

  const isOccupied = (x, y, w, h) =>
    occupied.some((cell) => x < cell.x + cell.width && x + w > cell.x && y < cell.y + cell.height && y + h > cell.y);

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

// === OFFSET SWEEP FILLER ===
function gridOffsetSweepFiller(cutCases, occupied, maxW, maxH, offsetSizes, moduleW, moduleH) {
  const stepX = moduleW;
  const stepY = moduleH;
  const isOccupied = (x, y, w, h) =>
    occupied.some((cell) => x < cell.x + cell.width && x + w > cell.x && y < cell.y + cell.height && y + h > cell.y);

  for (let y = 0; y <= maxH - stepY; y += stepY) {
    for (let x = 0; x <= maxW - stepX; x += stepX) {
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
