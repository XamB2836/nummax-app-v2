// /lib/LayoutEngine.js

import { computeAdvancedLayout } from './OptimizerCore';
import indoorCases from '../data/cases/indoor.json';

export function scoreLayout(layout) {
  const fullArea = layout.standardCases.reduce((sum, c) => sum + c.width * c.height, 0);
  const cutArea = layout.cutCases.reduce((sum, c) => sum + c.width * c.height, 0);
  const totalCuts = layout.cutCases.length;
  return (fullArea * 2) + cutArea - (totalCuts * 3000);
}

function getLayoutArea(layout) {
  const sumArea = (cells) => cells.reduce((sum, c) => sum + c.width * c.height, 0);
  return sumArea(layout.standardCases) + sumArea(layout.cutCases);
}

function moduleFitLoss(width, height, modW, modH) {
  const usedW = Math.floor(width / modW) * modW;
  const usedH = Math.floor(height / modH) * modH;
  return width * height - usedW * usedH;
}

function caseOrientationLoss(modW, modH) {
  const cases = indoorCases.standard;
  return cases.reduce((sum, c) => sum + moduleFitLoss(c.width, c.height, modW, modH), 0);
}

export function computeLayoutVariants(screenWidth, screenHeight, module) {
  const standardLayout = computeAdvancedLayout(
    screenWidth,
    screenHeight,
    module.width,
    module.height
  );

  const rotatedLayout = computeAdvancedLayout(
    screenWidth,
    screenHeight,
    module.height,
    module.width
  );

  return {
    standard: { layout: standardLayout },
    rotated: { layout: rotatedLayout },
  };
}

export function chooseBestLayout(screenWidth, screenHeight, module, modeOverride = null) {
  const layouts = computeLayoutVariants(screenWidth, screenHeight, module);

  if (modeOverride && layouts[modeOverride]) {
    return { layout: layouts[modeOverride].layout, mode: modeOverride };
  }

  const lossStandard = moduleFitLoss(
    screenWidth,
    screenHeight,
    module.width,
    module.height,
  );
  const lossRotated = moduleFitLoss(
    screenWidth,
    screenHeight,
    module.height,
    module.width,
  );

  const caseLossStandard = caseOrientationLoss(module.width, module.height);
  const caseLossRotated = caseOrientationLoss(module.height, module.width);

  const screenArea = screenWidth * screenHeight;
  const unusedStandard = screenArea - getLayoutArea(layouts.standard.layout);
  const unusedRotated = screenArea - getLayoutArea(layouts.rotated.layout);

  let bestMode;
  if (caseLossStandard !== caseLossRotated) {
    bestMode = caseLossStandard < caseLossRotated ? 'standard' : 'rotated';
  } else if (lossStandard !== lossRotated) {
    bestMode = lossStandard < lossRotated ? 'standard' : 'rotated';
  } else if (unusedStandard !== unusedRotated) {
    bestMode = unusedStandard < unusedRotated ? 'standard' : 'rotated';
  } else {
    const scoreStandard = scoreLayout(layouts.standard.layout);
    const scoreRotated = scoreLayout(layouts.rotated.layout);
    bestMode = scoreStandard >= scoreRotated ? 'standard' : 'rotated';
  }

  return { layout: layouts[bestMode].layout, mode: bestMode };
}
