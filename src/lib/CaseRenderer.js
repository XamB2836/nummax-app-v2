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

export function ModuleGridLines({ width, height, moduleWidth, moduleHeight, scale }) {
  const lines = [];

  for (let x = moduleWidth; x < width; x += moduleWidth) {
    lines.push(
      <line
        key={`gv-${x}`}
        x1={x * scale}
        y1={0}
        x2={x * scale}
        y2={height * scale}
        stroke="white"
        strokeWidth="1"
      />
    );
  }

  for (let y = moduleHeight; y < height; y += moduleHeight) {
    lines.push(
      <line
        key={`gh-${y}`}
        x1={0}
        y1={y * scale}
        x2={width * scale}
        y2={y * scale}
        stroke="white"
        strokeWidth="1"
      />
    );
  }

  return <g>{lines}</g>;
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

export function RenderCell({ cell, scale, fillColor }) {
  return (
    <g>
      <CaseRectangle cell={cell} scale={scale} fillColor={fillColor} />
      <CaseLabel cell={cell} scale={scale} />
    </g>
  );
}
