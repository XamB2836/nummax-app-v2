// lib/caseSummary.js

/**
 * Génère un résumé des cases à partir d'un tableau de cases.
 * Chaque case doit contenir des propriétés width et height.
 * @param {Array} cases - Tableau d'objets case.
 * @returns {Object} Un objet dont les clés sont "width x height" et les valeurs le nombre de cases.
 */
export function generateCaseSummary(cases) {
    const summary = {};
    cases.forEach(c => {
      const key = `${c.width}x${c.height}`;
      summary[key] = (summary[key] || 0) + 1;
    });
    return summary;
  }