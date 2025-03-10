"use client";

import { useState, useEffect, useCallback } from "react";
import { MetricInput, SelectorInput } from "@/components/input";
import { Modules, ModulesLabels } from "@/modules/moduleList";

const moduleData = (id) => Modules.find(id) || null;

const DEFAULT_MODULE = ModulesLabels.Outdoor[0];

export default function DisplaySelector({error = {}, onChange}) {
  const [display, setDisplay] = useState({
    dimension: [1600, 960],
    module: DEFAULT_MODULE,
    moduleId: DEFAULT_MODULE.id,
    orientation: "H",
  });

  const increments = useCallback(() => {
    const newIncrements = [...display.module.dimension].sort();
    return (display.orientation === "H") ? newIncrements.reverse() : newIncrements;
  }, [display.module, display.orientation]);

  const updateChanges = (updatedValues) => {
    const newDisplay = {...display, ...updatedValues};
    setDisplay(newDisplay);
    onChange(newDisplay);
    console.debug('Changing Display', newDisplay, increments());
  };

  const errorHighlight = {
    longueur: (display.dimension[0] % increments()[0] !== 0),
    hauteur: (display.dimension[1] % increments()[1] !== 0),
    orientation: false,
    module: false,
    ...error,
  };

  return (
    <div className="display-selector">
      <MetricInput
        label={"Longueur"}
        value={display.dimension[0]}
        increments={increments()[0]}
        error={errorHighlight.longueur}
        onChange={(v) =>
          updateChanges({ dimension: [parseFloat(v) || 0, display.dimension[1]] })
        }
      />
      <MetricInput
        label={"Hauteur"}
        value={display.dimension[1]}
        increments={increments()[1]}
        error={errorHighlight.hauteur}
        onChange={(v) =>
          updateChanges({ dimension: [display.dimension[0], parseFloat(v) || 0] })
        }
      />
      <SelectorInput
        label={"Module Orientation"}
        value={display.orientation}
        options={[
          { id: "H", label: "Horizontal" },
          { id: "V", label: "Vertical" },
        ]}
        error={errorHighlight.orientation}
        onChange={(v) => updateChanges({ orientation: v })}
      />
      <SelectorInput
        label={"Module Type"}
        value={display.moduleId}
        options={ModulesLabels}
        error={errorHighlight.module}
        onChange={(id) => updateChanges({ moduleId: id, module: moduleData(id) })}
      />
    </div>
  );
}
