// src/components/GridOptimizer.js
import React, { useState } from 'react';
import {
  LED_ROTATED,
  LED_STANDARD,
  ledPanels,
  chooseLayout,
  subdivideMissingCells,
  computeModuleCount
} from '@/lib/OptimizerCore';
import {
  renderGlobalSubdivisions,
  renderCaseRectangle,
  renderCaseText
} from '@/lib/SVGRenderer';
import { validateScreenDimensions } from '@/lib/InputHandler';
import { generateCaseSummary } from '@/lib/caseSummary';
import { calculateConsumption } from '@/lib/consumptionCalculator';

function GridOptimizer() {
  // State management for screen dimensions and selected LED panel.
  const [screenWidth, setScreenWidth] = useState(1120);
  const [screenHeight, setScreenHeight] = useState(640);
  const [selectedPanel, setSelectedPanel] = useState(ledPanels[0].id);

  // Style definitions.
  const containerStyle = {
    fontFamily: 'Arial, sans-serif',
    color: '#fff',
    backgroundColor: '#222',
    padding: '20px',
    borderRadius: '8px',
    maxWidth: '900px',
    margin: '20px auto'
  };
  const headingStyle = {
    marginBottom: '15px',
    borderBottom: '2px solid #555',
    paddingBottom: '5px'
  };
  const infoStyle = { margin: '8px 0', fontSize: '16px' };
  const inputStyle = {
    padding: '6px 10px',
    borderRadius: '4px',
    border: '1px solid #555',
    backgroundColor: '#333',
    color: '#fff'
  };
  const listStyle = { listStyleType: 'none', padding: '0' };
  const subHeadingStyle = { marginTop: '15px', textDecoration: 'underline' };

  // Validate screen dimensions.
  const { valid: dimsValid, warning: dimsWarning } = validateScreenDimensions(screenWidth, screenHeight);

  // Get the optimal layout using core math.
  const candidate = chooseLayout(screenWidth, screenHeight);
  const finalLayout = candidate.layout;
  const mode = candidate.mode;
  const ledModule = mode === 'standard' ? LED_ROTATED : LED_STANDARD;

  // Process missing cells using a core function.
  if (finalLayout.missingCases.length > 0) {
    const subdivided = subdivideMissingCells(finalLayout.missingCases, ledModule.width, ledModule.height);
    const invalidCells = subdivided.some(cell => cell.width !== ledModule.width || cell.height !== ledModule.height);
    if (invalidCells) {
      finalLayout.valid = false;
      finalLayout.warning = "WARNING: Screen size must be a multiple of 320x160!";
    }
    finalLayout.missingCases = subdivided;
  }
  
  // Calculate total module count.
  const totalModules =
    finalLayout.standardCases.reduce((sum, c) => sum + computeModuleCount(c, ledModule.width, ledModule.height), 0) +
    finalLayout.customCases.reduce((sum, c) => sum + computeModuleCount(c, ledModule.width, ledModule.height), 0);

  // Consumption calculation.
  const selectedPanelObj = ledPanels.find(panel => panel.id === selectedPanel);
  const consumption = selectedPanelObj ? calculateConsumption(screenWidth, screenHeight, selectedPanelObj.wattPerM2) : 0;
  const scale = 0.2;

  // Generate summaries for different cell types.
  const standardSummary = generateCaseSummary(finalLayout.standardCases);
  const customSummary = generateCaseSummary(finalLayout.customCases);
  const missingSummary = generateCaseSummary(finalLayout.missingCases);

  return (
    <div style={containerStyle}>
      <h2 style={headingStyle}>Grid Optimizer & Consumption Calculator</h2>
      <div style={{ marginBottom: '15px' }}>
        <label style={infoStyle}>
          Width (mm):&nbsp;
          <input
            type="number"
            style={inputStyle}
            value={screenWidth}
            onChange={(e) => setScreenWidth(Number(e.target.value))}
          />
        </label>
        <label style={{ ...infoStyle, marginLeft: '15px' }}>
          Height (mm):&nbsp;
          <input
            type="number"
            style={inputStyle}
            value={screenHeight}
            onChange={(e) => setScreenHeight(Number(e.target.value))}
          />
        </label>
        <label style={{ ...infoStyle, marginLeft: '15px' }}>
          LED Panel:&nbsp;
          <select value={selectedPanel} onChange={(e) => setSelectedPanel(e.target.value)} style={inputStyle}>
            {ledPanels.map(panel => (
              <option key={panel.id} value={panel.id}>
                {panel.name} ({panel.wattPerM2} W/m²)
              </option>
            ))}
          </select>
        </label>
      </div>
      <p style={infoStyle}>Screen: {screenWidth} x {screenHeight} mm</p>
      <p style={infoStyle}>Layout mode: {mode} ({finalLayout.valid ? "Valid" : "Invalid tiling!"})</p>
      {(finalLayout.warning || dimsWarning) && (
        <p style={{ ...infoStyle, color: '#ff4d4d', fontWeight: 'bold' }}>
          {finalLayout.warning || dimsWarning}
        </p>
      )}
      <p style={infoStyle}>Total LED Modules Used: {totalModules.toFixed(1)}</p>
      
      <svg
        width={(screenWidth * scale) + 1 }
        height={(screenHeight * scale) + 1}
        style={{ border: '1px solid #555', background: '#333', display: 'block', margin: '20px auto' }}
      >
        {finalLayout.standardCases.map((c, i) => (
          <g key={`std-${i}`}>
            {renderCaseRectangle(c, scale, 'green', 'white')}
            {renderGlobalSubdivisions(c, scale, ledModule.width, ledModule.height, screenWidth, screenHeight)}
            {renderCaseText(c, scale)}
          </g>
        ))}
        {finalLayout.customCases.map((c, i) => (
          <g key={`cust-${i}`}>
            {renderCaseRectangle(c, scale, 'orange', 'white')}
            {renderGlobalSubdivisions(c, scale, ledModule.width, ledModule.height, screenWidth, screenHeight)}
            {renderCaseText(c, scale)}
          </g>
        ))}
        {finalLayout.missingCases.map((c, i) => (
          <g key={`miss-${i}`}>
            {renderCaseRectangle(c, scale, 'red', 'white')}
            {renderCaseText(c, scale)}
          </g>
        ))}
      </svg>
      
      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#333', borderRadius: '6px' }}>
        <h3 style={{ color: '#fff' }}>Estimated Consumption</h3>
        <p style={infoStyle}>Screen Area: {((screenWidth * 0.001) * (screenHeight * 0.001)).toFixed(2)} m²</p>
        <p style={infoStyle}>
          {selectedPanelObj ? `${selectedPanelObj.name} (${selectedPanelObj.wattPerM2} W/m²)` : ''}
        </p>
        <p style={{ ...infoStyle, fontWeight: 'bold' }}>
          Total Consumption: {consumption.toFixed(2)} W
        </p>
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <h3 style={subHeadingStyle}>Cell Summary</h3>
        <div style={infoStyle}>
          <strong>Standard:</strong>
          <ul style={listStyle}>
            {Object.entries(standardSummary).map(([size, count]) => (
              <li key={size}>{size}: {count}</li>
            ))}
          </ul>
        </div>
        <div style={infoStyle}>
          <strong>Custom:</strong>
          <ul style={listStyle}>
            {Object.entries(customSummary).map(([size, count]) => (
              <li key={size}>{size}: {count}</li>
            ))}
          </ul>
        </div>
        {Object.keys(missingSummary).length > 0 && (
          <div style={infoStyle}>
            <strong>Missing:</strong>
            <ul style={listStyle}>
              {Object.entries(missingSummary).map(([size, count]) => (
                <li key={size}>{size}: {count}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default GridOptimizer;
