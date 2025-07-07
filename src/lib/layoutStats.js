// /lib/layoutStats.js
import { computeModuleCount } from './OptimizerCore'

export function countModules(layout, moduleWidth, moduleHeight) {
  return [...layout.standardCases, ...(layout.cutCases || [])]
    .reduce((sum, cell) => sum + computeModuleCount(cell, moduleWidth, moduleHeight), 0)
}

export function computeAreaM2(widthMM, heightMM) {
  return (widthMM / 1000) * (heightMM / 1000)
}
