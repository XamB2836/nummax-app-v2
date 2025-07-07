// /lib/CaseRenderer.js

import React from 'react';

export function CaseRectangle({ cell, scale, fillColor, strokeColor = 'white' }) {
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

export function SubdivisionLines({ cell, scale, moduleWidth, moduleHeight }) {
  const lines = [];

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
      />
    );
  }

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
      />
    );
  }

  return lines;
}

export function CaseLabel({ cell, scale }) {
  return (
    <text
      x={(cell.x + cell.width / 2) * scale}
      y={(cell.y + cell.height / 2) * scale}
      fill="white"
      fontSize="16"
      textAnchor="middle"
      style={{ fontFamily: 'Arial, sans-serif', fontWeight: 'bold' }}
    >
      {`${cell.width}x${cell.height}`}
    </text>
  );
}

export function RenderCell({ cell, scale, moduleWidth, moduleHeight, fillColor }) {
  return (
    <g>
      <CaseRectangle cell={cell} scale={scale} fillColor={fillColor} />
      {cell.type !== 'missing' && (
        <SubdivisionLines
          cell={cell}
          scale={scale}
          moduleWidth={moduleWidth}
          moduleHeight={moduleHeight}
        />
      )}
      <CaseLabel cell={cell} scale={scale} />
    </g>
  );
}
