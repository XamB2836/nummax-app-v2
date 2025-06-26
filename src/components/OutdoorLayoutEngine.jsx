// src/lib/LayoutEngine.js

// ─── OUTDOOR ALGORITHM ───────────────────────────────────────────────────────
export function chooseOutdoorLayout(screenWidth, screenHeight) {
  const OUTDOOR_CASES = [
    { width: 960,  height: 320  },
    { width: 960,  height: 640  },
    { width: 960,  height: 960  },
    { width: 960,  height: 1280 },
    { width: 1280, height: 320  },
    { width: 1280, height: 640  },
    { width: 1280, height: 960  },
    { width: 1280, height: 1280 },
    { width: 1600, height: 640  },
    { width: 1600, height: 960  },
  ];

  const placed = [];
  let y = 0;
  let remainingHeight = screenHeight;

  while (remainingHeight > 0) {
    let x = 0;
    let remainingWidth = screenWidth;
    const rowItems = [];

    // Fill one row greedily
    while (remainingWidth > 0) {
      const fit = OUTDOOR_CASES.find(
        (c) => c.width <= remainingWidth && c.height <= remainingHeight
      );
      if (!fit) break;
      rowItems.push({ ...fit, x, y, type: "standard" });
      x += fit.width;
      remainingWidth -= fit.width;
    }

    if (!rowItems.length) break;
    placed.push(...rowItems);

    // Advance to next row
    const rowHeight = Math.max(...rowItems.map((i) => i.height));
    y += rowHeight;
    remainingHeight -= rowHeight;
  }

  return placed;
}

// ─── INDOOR ALGORITHM (for reference) ────────────────────────────────────────
// export function chooseBestLayout(...) { /* existing indoor logic */ }
