// /lib/consumptionCalculator.js

export function calculateConsumption(screenWidthMM, screenHeightMM, wattPerM2) {
  const screenAreaM2 = (screenWidthMM / 1000) * (screenHeightMM / 1000)
  const consumption = screenAreaM2 * wattPerM2
  return Math.round(consumption)  // arrondi à l’unité la plus proche
}
