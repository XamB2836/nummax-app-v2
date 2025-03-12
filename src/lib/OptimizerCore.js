// src/lib/optimizerCore.js

// ----- Fixed Dimensions (mm) -----
export const STANDARD_CASE_WIDTH = 1120;  // standard case width
export const STANDARD_CASE_HEIGHT = 640;  // standard case height

// ----- LED Module Sizes -----
// For portrait layout, we use rotated LED modules (160×320),
// so that a standard case is 1120×640 (7 modules across, 2 rows).
// For rotated layout, cells are transformed to 640×1120.
export const LED_ROTATED  = { width: 160, height: 320 };
export const LED_STANDARD = { width: 320, height: 160 };

// ----- Pre-made Custom Cases -----
// (Empty in this version)
export const preMadeCustomCases = [];

// ----- LED Panel Options (for consumption calculation) -----
export const ledPanels = [
  { id: 'panel1', name: '2.5 GOB', wattPerM2: 550 },
  { id: 'panel2', name: '1.25 Flex', wattPerM2: 290 },
  { id: 'panel3', name: 'LED Panel C', wattPerM2: 200 },
];

// ----- Utility: Allowed Custom Sizes for a Given Height -----
export function getAllowedWidthsForHeight(desiredHeight, moduleWidth) {
  const widths = new Set();
  preMadeCustomCases.forEach(c => {
    if (c.height === desiredHeight && c.width % moduleWidth === 0) {
      widths.add(c.width);
    }
  });
  return Array.from(widths);
}

// ----- Partitioning Functions -----
export function partitionColumnsExact(target, allowedSet) {
  const sorted = allowedSet.slice().sort((a, b) => b - a);
  function helper(remaining, current) {
    if (remaining === 0) return current;
    for (let w of sorted) {
      if (w <= remaining) {
        const result = helper(remaining - w, current.concat(w));
        if (result !== null) return result;
      }
    }
    return null;
  }
  return helper(target, []);
}

export function partitionColumnsWithMissing(target, allowedSet, moduleWidth) {
  const filteredAllowed = allowedSet.filter(w => w % moduleWidth === 0);
  const exact = partitionColumnsExact(target, filteredAllowed);
  if (exact !== null) return { partition: exact, missing: 0 };
  else {
    const sorted = filteredAllowed.slice().sort((a, b) => b - a);
    let partition = [];
    let remaining = target;
    for (let w of sorted) {
      while (remaining >= w) {
        partition.push(w);
        remaining -= w;
      }
    }
    const tolerance = moduleWidth * 0.1;
    if (remaining > 0 && remaining < tolerance && partition.length > 0) {
      partition[partition.length - 1] += remaining;
      remaining = 0;
    }
    return { partition, missing: remaining };
  }
}

export function splitMissing(missing, moduleWidth) {
  const parts = [];
  while (missing >= moduleWidth) {
    parts.push(moduleWidth);
    missing -= moduleWidth;
  }
  if (missing > 0) parts.push(missing);
  return parts;
}

export function subdivideMissingCells(cells, moduleWidth, moduleHeight) {
  const subdivided = [];
  const toleranceW = moduleWidth * 0.1;
  const toleranceH = moduleHeight * 0.1;
  for (const cell of cells) {
    const remainderW = cell.width % moduleWidth;
    const remainderH = cell.height % moduleHeight;
    let adjustedWidth = cell.width;
    let adjustedHeight = cell.height;
    if (remainderW > 0 && remainderW < toleranceW) {
      adjustedWidth = Math.round(cell.width / moduleWidth) * moduleWidth;
    }
    if (remainderH > 0 && remainderH < toleranceH) {
      adjustedHeight = Math.round(cell.height / moduleHeight) * moduleHeight;
    }
    if (adjustedWidth % moduleWidth !== 0 || adjustedHeight % moduleHeight !== 0) {
      subdivided.push(cell);
    } else {
      const cols = adjustedWidth / moduleWidth;
      const rows = adjustedHeight / moduleHeight;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          subdivided.push({
            x: cell.x + c * moduleWidth,
            y: cell.y + r * moduleHeight,
            width: moduleWidth,
            height: moduleHeight,
            type: cell.type
          });
        }
      }
    }
  }
  return subdivided;
}

export function findMatchingCustomCase(zoneWidth, zoneHeight) {
  return preMadeCustomCases.find(c => c.width === zoneWidth && c.height === zoneHeight);
}

export function generateCaseSummary(cases) {
  const summary = {};
  cases.forEach(c => {
    const key = `${c.width}x${c.height}`;
    summary[key] = (summary[key] || 0) + 1;
  });
  return summary;
}

export function isScreenFillable(screenWidth, screenHeight) {
  if (screenWidth % LED_ROTATED.width === 0 && screenHeight % LED_ROTATED.height === 0) return true;
  if (screenWidth % LED_STANDARD.width === 0 && screenHeight % LED_STANDARD.height === 0) return true;
  return false;
}

export function computeStandardLayout(screenWidth, screenHeight) {
  const rowHeight = STANDARD_CASE_HEIGHT;
  const fullRows = Math.floor(screenHeight / rowHeight);
  const bottomHeight = screenHeight % rowHeight;
  const layout = { standardCases: [], customCases: [], missingCases: [], valid: true };
  
  if (bottomHeight > 0 && (bottomHeight % LED_ROTATED.height !== 0)) {
    layout.valid = false;
    layout.warning = "Pour le layout standard, la hauteur de la dernière ligne doit être un multiple de 320 mm.";
    return layout;
  }
  
  // Process full rows
  for (let r = 0; r < fullRows; r++) {
    const y = r * rowHeight;
    let xOffset = 0;
    const allowed = (screenWidth % STANDARD_CASE_WIDTH === 0)
      ? [STANDARD_CASE_WIDTH]
      : [STANDARD_CASE_WIDTH, ...getAllowedWidthsForHeight(rowHeight, LED_ROTATED.width)
          .filter(w => w < STANDARD_CASE_WIDTH)].sort((a, b) => b - a);
    const { partition, missing } = partitionColumnsWithMissing(screenWidth, allowed, LED_ROTATED.width);
    partition.forEach(seg => {
      if (seg === STANDARD_CASE_WIDTH) {
        layout.standardCases.push({ x: xOffset, y, width: seg, height: rowHeight, type: 'standard' });
      } else {
        const match = findMatchingCustomCase(seg, rowHeight);
        if (match) layout.customCases.push({ x: xOffset, y, width: seg, height: rowHeight, type: 'custom (pre-made)' });
        else layout.missingCases.push({ x: xOffset, y, width: seg, height: rowHeight, type: 'missing' });
      }
      xOffset += seg;
    });
    if (missing > 0) {
      const parts = splitMissing(missing, LED_ROTATED.width);
      parts.forEach(part => {
        layout.missingCases.push({ x: xOffset, y, width: part, height: rowHeight, type: 'missing' });
        xOffset += part;
      });
    }
    if (xOffset !== screenWidth) layout.valid = false;
  }

  // Process bottom row if exists
  if (bottomHeight > 0) {
    const y = fullRows * rowHeight;
    let xOffset = 0;
    // For bottom row, try to get allowed widths from the remaining height if available.
    const allowed = getAllowedWidthsForHeight(bottomHeight, LED_ROTATED.width).length > 0
      ? getAllowedWidthsForHeight(bottomHeight, LED_ROTATED.width)
      : [LED_ROTATED.width];
    allowed.sort((a, b) => b - a);
    const { partition, missing } = partitionColumnsWithMissing(screenWidth, allowed, LED_ROTATED.width);
    partition.forEach(seg => {
      const match = findMatchingCustomCase(seg, bottomHeight);
      if (match) layout.customCases.push({ x: xOffset, y, width: seg, height: bottomHeight, type: 'custom (pre-made)' });
      else layout.missingCases.push({ x: xOffset, y, width: seg, height: bottomHeight, type: 'missing' });
      xOffset += seg;
    });
    if (missing > 0) {
      const parts = splitMissing(missing, LED_ROTATED.width);
      parts.forEach(part => {
        layout.missingCases.push({ x: xOffset, y, width: part, height: bottomHeight, type: 'missing' });
        xOffset += part;
      });
    }
    if (xOffset !== screenWidth) layout.valid = false;
  }

  return layout;
}

export function transformLayout(layout, containerWidth) {
  const transformed = { standardCases: [], customCases: [], missingCases: [], valid: layout.valid, warning: layout.warning };
  function transformCell(cell) {
    return {
      x: cell.y,
      y: containerWidth - cell.x - cell.width,
      width: cell.height,
      height: cell.width,
      type: cell.type
    };
  }
  transformed.standardCases = layout.standardCases.map(transformCell);
  transformed.customCases = layout.customCases.map(transformCell);
  transformed.missingCases = layout.missingCases.map(transformCell);
  return transformed;
}

export function chooseLayout(w, h) {
  const numericWidth = Number(w);
  const numericHeight = Number(h);
  const portrait = computeStandardLayout(numericWidth, numericHeight);
  const rotated = transformLayout(computeStandardLayout(numericHeight, numericWidth), numericHeight);
  const missingArea = (layout) =>
    layout.missingCases.reduce((sum, cell) => sum + cell.width * cell.height, 0);
  if (portrait.valid && rotated.valid) {
    return missingArea(portrait) <= missingArea(rotated)
      ? { layout: portrait, mode: 'standard' }
      : { layout: rotated, mode: 'rotated' };
  }
  if (portrait.valid) return { layout: portrait, mode: 'standard' };
  if (rotated.valid) return { layout: rotated, mode: 'rotated' };
  return missingArea(portrait) <= missingArea(rotated)
    ? { layout: portrait, mode: 'standard' }
    : { layout: rotated, mode: 'rotated' };
}

export function computeModuleCount(cell, moduleWidth, moduleHeight) {
  return (cell.width / moduleWidth) * (cell.height / moduleHeight);
}
