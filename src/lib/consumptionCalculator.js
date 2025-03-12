// lib/consumptionCalculator.js

/**
 * Calcule la consommation totale en Watts en fonction de la surface de l'écran en m² et
 * d'un wattage par m² fourni.
 * @param {number} screenWidth - Largeur de l'écran en mm.
 * @param {number} screenHeight - Hauteur de l'écran en mm.
 * @param {number} wattPerM2 - Consommation en Watt/m² du panneau LED.
 * @returns {number} Consommation totale en Watts.
 */
export function calculateConsumption(screenWidth, screenHeight, wattPerM2) {
    // Conversion mm -> m pour obtenir l'aire en m²
    const areaInM2 = (screenWidth * 0.001) * (screenHeight * 0.001);
    return areaInM2 * wattPerM2;
  }
  