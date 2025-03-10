"use client";

import { useState, useEffect, useCallback } from "react";
import { Modules, ModulesLabels } from "@/modules/moduleList";

import { calculateDisplayPower, calculateDisplayArea } from "@/modules/displayCalculator";

import DisplaySelector from "@/components/displaySelector";

const SHOW_DEBUG = false;
const DEFAULT_MODULE = ModulesLabels.Outdoor[0];


export default function GridOptimiser({}) {
  const [display, setDisplay] = useState({
    dimension: [1600, 960],
    module: DEFAULT_MODULE,
  });

  const DisplayArea = calculateDisplayArea(display);
  const DisplayConsumption = calculateDisplayPower(display);



  return <div className="calculator-wrapper">
    <h2>Grid Optimizer & Consumption Calculator</h2>

    <DisplaySelector onChange={setDisplay}/>

    <div className="flex-row">
      <div className="info-box">
        <h3>Screen Information</h3>
        <div>Screen: <label>{display.dimension.join(' x ')} mm</label></div>
      </div>

      <div className="info-box">
        <h3>Estimated Consumption</h3>
        <div>Screen Area: <label>{DisplayArea.toFixed(4)} m²</label></div>
        <div>Module: <label>{display.module.pitch}mm {(display.module.product) ? display.module.product.join(" ") : null} ({display.module.consommation} W/m²)</label></div>
        <div>Total Consumption: {DisplayConsumption.toFixed(2)} W</div>
      </div>
    </div>

    <div className="info-box">
      <h3>Simulation</h3>

    </div>

    <pre>{SHOW_DEBUG ? JSON.stringify(display, null, 2) : null}</pre>

  </div>;
}

