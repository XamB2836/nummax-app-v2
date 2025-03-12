// src/lib/SVGRenderer.js
import React from 'react';

// =========== RENDUS DU CONTENEUR SVG =========== //
export function renderSVGContainer(originalWidth, originalHeight, scale, additionalProps = {}, children) {
  const adjustedWidth = originalWidth * scale;
  const adjustedHeight = originalHeight * scale;
  return (
    <svg
      width={adjustedWidth}
      height={adjustedHeight}
      {...additionalProps}
    >
      {children}
    </svg>
  );
}

// =========== RENDUS DES LIGNES DE SUBDIVISIONS =========== //
export function renderGlobalSubdivisions(cell, scale, moduleWidth, moduleHeight) {
  const lines = [];
  // LIGNE VERTICALE
  for (let x = cell.x + moduleWidth; x < cell.x + cell.width; x += moduleWidth) {
    lines.push(
      <line
        key={`v-${x}`}
        x1={x * scale}
        y1={cell.y * scale}
        x2={x * scale}
        y2={(cell.y + cell.height) * scale}
        stroke="white"
        strokeWidth="1"
        shapeRendering="crispEdges"
      />
    );
  }
  // LIGNE HORIZONTALE
  for (let y = cell.y + moduleHeight; y < cell.y + cell.height; y += moduleHeight) {
    lines.push(
      <line
        key={`h-${y}`}
        x1={cell.x * scale}
        y1={y * scale}
        x2={(cell.x + cell.width) * scale}
        y2={y * scale}
        stroke="white"
        strokeWidth="1"
        shapeRendering="crispEdges"
      />
    );
  }
  return lines;
}

// =========== RENDUS DES CASES =========== //
export function renderCaseRectangle(cell, scale, fillColor, strokeColor) {
  const strokeWidth = 1.5;
  const halfStroke = strokeWidth / 3;
  return (
    <rect
      x={(cell.x * scale) + halfStroke}
      y={(cell.y * scale) + halfStroke}
      width={(cell.width * scale) - strokeWidth}
      height={(cell.height * scale) - strokeWidth}
      fill={fillColor}
      stroke={strokeColor}
      strokeWidth={strokeWidth}
      shapeRendering="crispEdges"
      style={{ strokeAlignment: 'inside' }}
    />
  );
}

// =========== RENDUS DU TEXTE SUR LES CASES =========== //
export function renderCaseText(cell, scale) {
  return (
    <text
      x={(cell.x + cell.width / 2) * scale}
      y={(cell.y + cell.height / 2) * scale}
      fill="white"
      fontSize="16"
      textAnchor="middle"
      style={{ fontFamily: 'Arial, sans-serif', fontWeight: 'bold' }}
      shapeRendering="crispEdges"
    >
      {`${cell.width}x${cell.height}`}
    </text>
  );
}
