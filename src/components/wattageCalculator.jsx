"use client";

import { useState, useEffect, useCallback } from "react";

import { calculateDisplayPower } from "@/modules/displayCalculator";

import DisplaySelector from "@/components/displaySelector";

export default function WattageCalculator({}) {
  const [display, setDisplay] = useState(null);
  const [consumption, setConsumption] = useState(0);

  const updatePower = (newDisplay = display) => {
    const newConsumption = calculateDisplayPower(newDisplay);
    if (newConsumption) setConsumption(newConsumption);
  }

  const handleDisplayChange = (newDisplay) => {
    setDisplay(newDisplay);
    updatePower(newDisplay);
  };

  return <div className="calculator-wrapper">
    <h2>Calculateur de Wattage</h2>

    <DisplaySelector onChange={handleDisplayChange}/>

    <h3>Wattage Total: {consumption.toFixed(2)} W</h3>

  </div>;
}