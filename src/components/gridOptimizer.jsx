
"use client"; 

const React = require("react");
const { useState } = require("react");

const {
  LED_STANDARD,
  LED_ROTATED,
  ledPanels
} = require('@/lib/OptimizerCore');

const { chooseBestLayout } = require('@/lib/LayoutEngine');
const { calculateConsumption } = require('@/lib/consumptionCalculator');
const { validateScreenDimensions } = require('@/lib/InputHandler');
const { generateCaseSummary } = require('@/lib/caseSummary');
const { RenderCell } = require('@/lib/CaseRenderer');
const { countModules } = require('@/lib/layoutStats');


const GridOptimizer = () => {
  const [screenWidth, setScreenWidth] = useState(1120);
  const [screenHeight, setScreenHeight] = useState(640);
  const [selectedPanel, setSelectedPanel] = useState(ledPanels[0].id);
  const [modeOverride, setModeOverride] = useState('auto');

  const { valid: dimsValid, warning: dimsWarning } = validateScreenDimensions(screenWidth, screenHeight);

  const { layout, mode } = chooseBestLayout(screenWidth, screenHeight, modeOverride === 'auto' ? null : modeOverride);

  const ledModule = mode === 'standard' ? LED_ROTATED : LED_STANDARD;

  const selectedPanelObj = ledPanels.find(p => p.id === selectedPanel);
  const consumption = selectedPanelObj
    ? calculateConsumption(screenWidth, screenHeight, selectedPanelObj.wattPerM2)
    : 0;

  const totalModules = countModules(layout, ledModule.width, ledModule.height);

  const scale = 0.2;
  const colorMap = {
    standard: 'green',
    cut: 'orange'
  };

  const stdSum = generateCaseSummary(layout.standardCases);
  const cutSum = generateCaseSummary(layout.cutCases || []);

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>LED Screen Grid Optimizer ⚙</h2>

      <div style={styles.controls}>
        <label style={styles.label}>
          Width (mm):
          <input type="number" value={screenWidth} onChange={(e) => setScreenWidth(+e.target.value)} style={styles.input} />
        </label>
        <label style={styles.label}>
          Height (mm):
          <input type="number" value={screenHeight} onChange={(e) => setScreenHeight(+e.target.value)} style={styles.input} />
        </label>
        <label style={styles.label}>
          LED Panel:
          <select value={selectedPanel} onChange={(e) => setSelectedPanel(e.target.value)} style={styles.input}>
            {ledPanels.map(panel => (
              <option key={panel.id} value={panel.id}>
                {panel.name} ({panel.wattPerM2} W/m²)
              </option>
            ))}
          </select>
        </label>
        <label style={styles.label}>
          Layout Mode:
          <select value={modeOverride} onChange={(e) => setModeOverride(e.target.value)} style={styles.input}>
            <option value="auto">Auto</option>
            <option value="standard">Force Standard</option>
            <option value="rotated">Force Rotated</option>
          </select>
        </label>
      </div>

      {(layout.warning || dimsWarning) && (
        <p style={styles.warning}>
          {layout.warning || dimsWarning}
        </p>
      )}

      <p style={styles.info}>Layout Mode: {mode}</p>
      <p style={styles.info}>LED Module: {ledModule.width} x {ledModule.height}</p>
      <p style={styles.info}>Total Modules: {totalModules.toFixed(1)}</p>

      <svg
        width={(screenWidth * scale) + 1}
        height={(screenHeight * scale) + 1}
        style={styles.svg}
      >
        {layout.standardCases.map((cell, i) => (
          <RenderCell
            key={`std-${i}`}
            cell={cell}
            scale={scale}
            moduleWidth={ledModule.width}
            moduleHeight={ledModule.height}
            fillColor={colorMap[cell.type]}
          />
        ))}
        {(layout.cutCases || []).map((cell, i) => (
          <RenderCell
            key={`cut-${i}`}
            cell={cell}
            scale={scale}
            moduleWidth={ledModule.width}
            moduleHeight={ledModule.height}
            fillColor={colorMap[cell.type]}
          />
        ))}
      </svg>

      <div style={styles.block}>
        <h3>Estimated Consumption</h3>
        <p style={styles.info}>Area: {((screenWidth / 1000) * (screenHeight / 1000)).toFixed(2)} m²</p>
        <p style={styles.info}>{selectedPanelObj?.name} ({selectedPanelObj?.wattPerM2} W/m²)</p>
        <p style={{ ...styles.info, fontWeight: 'bold' }}>Total: {consumption.toFixed(2)} W</p>
      </div>

      <div style={styles.block}>
        <h3>Case Summary</h3>
        <SummaryList title="Standard" summary={stdSum} />
        <SummaryList title="Cut" summary={cutSum} />
      </div>
    </div>
  );
};

const SummaryList = ({ title, summary }) => {
  return (
    <div style={styles.info}>
      <strong>{title}:</strong>
      <ul style={styles.list}>
        {Object.entries(summary).map(([size, count]) => (
          <li key={size}>{size}: {count}</li>
        ))}
      </ul>
    </div>
  );
};

const styles = {
  container: {
    fontFamily: 'Arial, sans-serif',
    color: '#fff',
    backgroundColor: '#222',
    padding: '20px',
    borderRadius: '8px',
    maxWidth: '960px',
    margin: '20px auto'
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
  warning: { color: '#ff4d4d', fontWeight: 'bold', fontSize: '16px' },
  info: { margin: '5px 0', fontSize: '16px' },
  list: { paddingLeft: '18px' },
  block: { backgroundColor: '#333', padding: '12px', borderRadius: '6px', marginTop: '15px' }
};

export default GridOptimizer;
