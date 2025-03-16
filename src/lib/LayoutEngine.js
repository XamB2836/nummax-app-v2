// /lib/LayoutEngine.js

import {
    LED_STANDARD,
    LED_ROTATED,
    computeAdvancedLayout,
    transformLayout,
    computeModuleCount
  } from './OptimizerCore';
  
  /**
   * Score layout based on full vs cut cases
   */
  export function scoreLayout(layout, moduleW, moduleH) {
    const fullArea = layout.standardCases.reduce((sum, c) => sum + c.width * c.height, 0);
    const cutArea = layout.cutCases.reduce((sum, c) => sum + c.width * c.height, 0);
    const totalCuts = layout.cutCases.length;
  
    // Weighted score
    const score = (fullArea * 2) + (cutArea * 1) - (totalCuts * 3000); // Adjust weights if needed
    return score;
  }
  
  /**
   * Generate both layout variants
   */
  export function computeLayoutVariants(screenWidth, screenHeight) {
    const standardLayout = computeAdvancedLayout(screenWidth, screenHeight);
    const rotatedLayout = transformLayout(computeAdvancedLayout(screenHeight, screenWidth), screenHeight);
  
    return {
      standard: { layout: standardLayout },
      rotated: { layout: rotatedLayout }
    };
  }
  
  /**
   * Choose best layout by score
   */
  export function chooseBestLayout(screenWidth, screenHeight, modeOverride = null) {
    const layouts = computeLayoutVariants(screenWidth, screenHeight);
  
    if (modeOverride && layouts[modeOverride]) {
      return {
        layout: layouts[modeOverride].layout,
        mode: modeOverride
      };
    }
  
    const scoreStandard = scoreLayout(layouts.standard.layout, LED_ROTATED.width, LED_ROTATED.height);
    const scoreRotated  = scoreLayout(layouts.rotated.layout, LED_STANDARD.width, LED_STANDARD.height);
  
    const bestMode = scoreStandard >= scoreRotated ? 'standard' : 'rotated';
  
    return {
      layout: layouts[bestMode].layout,
      mode: bestMode
    };
  }
  