// /lib/caseSummary.js

export function generateCaseSummary(cases = []) {
    const summary = {};
    cases.forEach((c) => {
      const key = `${c.width}x${c.height}`;
      summary[key] = (summary[key] || 0) + 1;
    });
    return summary;
  }
  