export function calculateDisplayArea(display) {
  if (!display) return 0;
  return (display.dimension[0] * display.dimension[1] / 1_000_000);
}

export function calculateDisplayPower(display) {
  if (!display) return 0;
  const displayArea = calculateDisplayArea(display);
  return displayArea * display.module.consommation;
}

