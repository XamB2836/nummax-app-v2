// /lib/LayoutEngine.js

import { computeAdvancedLayout, transformLayout } from './OptimizerCore'

export function scoreLayout(layout, moduleW, moduleH) {
  const fullArea = layout.standardCases.reduce((sum, c) => sum + c.width * c.height, 0)
  const cutArea = layout.cutCases.reduce((sum, c) => sum + c.width * c.height, 0)
  const totalCuts = layout.cutCases.length
  return (fullArea * 2) + (cutArea * 1) - (totalCuts * 3000)
}

export function computeLayoutVariants(screenWidth, screenHeight, module) {
  const standardLayout = computeAdvancedLayout(screenWidth, screenHeight, module.width, module.height)
  const rotatedLayout = transformLayout(
    computeAdvancedLayout(screenHeight, screenWidth, module.width, module.height),
    screenHeight
  )

  return {
    standard: { layout: standardLayout },
    rotated: { layout: rotatedLayout }
  }
}

export function chooseBestLayout(screenWidth, screenHeight, module, modeOverride = null) {
  const layouts = computeLayoutVariants(screenWidth, screenHeight, module)

  if (modeOverride && layouts[modeOverride]) {
    return {
      layout: layouts[modeOverride].layout,
      mode: modeOverride
    }
  }

  const scoreStandard = scoreLayout(layouts.standard.layout, module.height, module.width)
  const scoreRotated  = scoreLayout(layouts.rotated.layout, module.width, module.height)

  const bestMode = scoreStandard >= scoreRotated ? 'standard' : 'rotated'

  return {
    layout: layouts[bestMode].layout,
    mode: bestMode
  }
}
