// /lib/layoutStats.js
export function countModules(layout, screenW, screenH, moduleW, moduleH) {
  let count = 0
  for (let y = 0; y + moduleH <= screenH; y += moduleH) {
    for (let x = 0; x + moduleW <= screenW; x += moduleW) {
      count++
    }
  }
  return count
}

export function computeAreaM2(widthMM, heightMM) {
  return (widthMM / 1000) * (heightMM / 1000)
}
