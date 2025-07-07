// /lib/consumptionCalculator.js

export function calculateConsumption(screenWidthMM, screenHeightMM, wattPerM2) {
  const screenAreaM2 = (screenWidthMM / 1000) * (screenHeightMM / 1000)
  return screenAreaM2 * wattPerM2
}
