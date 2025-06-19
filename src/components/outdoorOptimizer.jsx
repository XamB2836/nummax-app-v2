"use client";

const React = require("react");
const { useState } = require("react");

const { computeOutdoorLayout } = require('@/lib/OutdoorLayoutEngine');
const { RenderCell } = require('@/lib/CaseRenderer');
const { generateCaseSummary } = require('@/lib/caseSummary');

const OutdoorOptimizer = () => {
  const [screenWidth, setScreenWidth] = useState(1600);
  const [screenHeight, setScreenHeight] = useState(960);

  const layout = computeOutdoorLayout(screenWidth, screenHeight);
  const scale = 0.2;
  const colorMap = {
    standard: 'green'
  };
  const summary = generateCaseSummary(layout.standardCases);

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Outdoor Layout Optimizer</h2>
      <div style={styles.controls}>
        <label style={styles.label}>
          Width (mm):
          <input type="number" value={screenWidth} onChange={(e) => setScreenWidth(+e.target.value)} style={styles.input} />
        </label>
        <label style={styles.label}>
          Height (mm):
          <input type="number" value={screenHeight} onChange={(e) => setScreenHeight(+e.target.value)} style={styles.input} />
        </label>
      </div>

      <svg width={(screenWidth * scale) + 1} height={(screenHeight * scale) + 1} style={styles.svg}>
        {layout.standardCases.map((cell, i) => (
          <RenderCell
            key={`std-${i}`}
            cell={cell}
            scale={scale}
            moduleWidth={320}
            moduleHeight={320}
            fillColor={colorMap[cell.type]}
          />
        ))}
      </svg>

      <div style={styles.block}>
        <h3>Case Summary</h3>
        <SummaryList title="Standard" summary={summary} />
      </div>
    </div>
  );
};

const SummaryList = ({ title, summary }) => (
  <div style={styles.info}>
    <strong>{title}:</strong>
    <ul style={styles.list}>
      {Object.entries(summary).map(([size, count]) => (
        <li key={size}>{size}: {count}</li>
      ))}
    </ul>
  </div>
);

const styles = {
  container: {
    fontFamily: 'Arial, sans-serif',
    color: '#fff',
    padding: '20px'
  },
  heading: { borderBottom: '2px solid #555', paddingBottom: '5px' },
  controls: { display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '10px' },
  label: { fontSize: '14px', display: 'flex', flexDirection: 'column' },
  input: {
    padding: '5px 10px',
    borderRadius: '4px',
    border: '1px solid #555',
    backgroundColor: '#333',
    color: '#fff',
    marginTop: '5px'
  },
  svg: { border: '1px solid #555', background: '#333', margin: '20px auto', display: 'block' },
  info: { margin: '5px 0', fontSize: '16px' },
  list: { paddingLeft: '18px' },
  block: { backgroundColor: '#333', padding: '12px', borderRadius: '6px', marginTop: '15px' }
};

export default OutdoorOptimizer;
