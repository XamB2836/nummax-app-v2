"use client"

import { useState } from "react";
import "@/styles/gridMaker.css";

import { Modules, ModulesLabels } from "@/modules/moduleList";

import Cabinets from "@/data/cabinets";
console.log(Cabinets.Standard[0]);
//console.log(Modules);


const CABINET_STANDARD = Cabinets.Standard[0];


// ----- Fixed Dimensions (mm) -----
const STANDARD_CASE_WIDTH = CABINET_STANDARD.width; //1120; // standard case width
const STANDARD_CASE_HEIGHT = CABINET_STANDARD.height; // standard case height


// ----- LED Module Sizes -----
// Dans le layout de base (portrait), on utilise des modules LED en orientation pivotée (160×320)
// de sorte qu’un boîtier standard est de 1120×640 (7 modules sur la largeur, 2 modules sur la hauteur).
// Dans le layout pivoté, on transforme les cellules calculées pour obtenir des cellules en 640×1120.
const LED_ROTATED = { width: 160, height: 320 }; // pour le layout portrait
const LED_STANDARD = { width: 320, height: 160 }; // pour le layout pivoté



// ----- Pre-made Custom Cases -----
const preMadeCustomCases = [];

// ----- LED Panel Options (pour le calcul de consommation) -----
/*
const ledPanels = [
  { id: "panel1", name: "2.5 GOB", consommation: 550, dimension: [160, 320] },
  { id: "panel2", name: "1.25 Flex", consommation: 290, dimension: [160, 320] },
  { id: "panel3", name: "LED Panel C", consommation: 200, dimension: [160, 320] },
];
*/

// Ici filtre pour les 160x320
const LED_MODULES = Modules.modules.filter(module => (module.dimension[0] === 160) && (module.dimension[1] === 320));

//! ----- Utility: Allowed Custom Sizes for a Given Height -----
/*
function getAllowedWidthsForHeight(desiredHeight, moduleWidth) {
  const widths = new Set();
  preMadeCustomCases.forEach((c) => {
    if (c.height === desiredHeight && c.width % moduleWidth === 0) widths.add(c.width);
  });
  return Array.from(widths);
}
*/
const getAllowedWidthsForHeight = (desiredHeight, moduleWidth) => {
  const allowedWidths = preMadeCustomCases.filter(c => (c.width % moduleWidth === 0) && (c.height === desiredHeight)).map(c => c.width);
  return Array.from(new Set(allowedWidths));
};

//! ----- Partitioning Functions -----
/*function partitionColumnsExact(target, allowedSet) {
  const sorted = allowedSet.slice().sort((a, b) => b - a);
  function helper(remaining, current) {
    if (remaining === 0) return current;
    for (let w of sorted) {
      if (w <= remaining) {
        const result = helper(remaining - w, current.concat(w));
        if (result !== null) return result;
      }
    }
    return null;
  }
  return helper(target, []);
}*/
const partitionColumnsExact = (target, allowedSet) => {
  const sorted = [...allowedSet].sort((a, b) => b - a);

  function helper(remaining, current) {
    if (remaining === 0) return current;
    for (let w of sorted) {
      if (remaining >= w) {
        const result = helper(remaining - w, current.concat(w));
        if (result !== null) return result;
      }
    };
    return null;
  }

  return helper(target, []);
}


function partitionColumnsWithMissing(target, allowedSet, moduleWidth) {
  const filteredAllowed = allowedSet.filter((w) => w % moduleWidth === 0);
  const exact = partitionColumnsExact(target, filteredAllowed);
  if (exact !== null) return { partition: exact, missing: 0 };
  else {
    const sorted = filteredAllowed.slice().sort((a, b) => b - a);
    let partition = [];
    let remaining = target;
    for (let w of sorted) {
      while (remaining >= w) {
        partition.push(w);
        remaining -= w;
      }
    }
    // --- Modification : Tolérance pour réduire la zone manquante ---
    const tolerance = moduleWidth * 0.1; // 10% de la largeur du module
    if (remaining > 0 && remaining < tolerance && partition.length > 0) {
      // On ajoute le reste à la dernière partition afin d'éviter une zone trop fine.
      partition[partition.length - 1] += remaining;
      remaining = 0;
    }
    return { partition, missing: remaining };
  }
}

function splitMissing(missing, moduleWidth) {
  const parts = [];
  while (missing >= moduleWidth) {
    parts.push(moduleWidth);
    missing -= moduleWidth;
  }
  if (missing > 0) parts.push(missing);
  return parts;
}

// ----- Subdivide Missing Cells -----
// Modification : ajout d'une tolérance pour "rounder" les dimensions proches d'un multiple exact
function subdivideMissingCells(cells, moduleWidth, moduleHeight) {
  const subdivided = [];
  const toleranceW = moduleWidth * 0.1; // 10% de la largeur du module
  const toleranceH = moduleHeight * 0.1; // 10% de la hauteur du module
  for (const cell of cells) {
    // Calcul des restes par rapport aux dimensions d'un module
    const remainderW = cell.width % moduleWidth;
    const remainderH = cell.height % moduleHeight;
    let adjustedWidth = cell.width;
    let adjustedHeight = cell.height;
    // Si le reste est faible (inférieur à la tolérance), on arrondit à un multiple de moduleWidth/height.
    if (remainderW > 0 && remainderW < toleranceW) {
      adjustedWidth = Math.round(cell.width / moduleWidth) * moduleWidth;
    }
    if (remainderH > 0 && remainderH < toleranceH) {
      adjustedHeight = Math.round(cell.height / moduleHeight) * moduleHeight;
    }
    // Si après ajustement, les dimensions ne sont pas un multiple exact, on laisse la cellule telle quelle.
    if (
      adjustedWidth % moduleWidth !== 0 ||
      adjustedHeight % moduleHeight !== 0
    ) {
      subdivided.push(cell);
    } else {
      const cols = adjustedWidth / moduleWidth;
      const rows = adjustedHeight / moduleHeight;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          subdivided.push({
            x: cell.x + c * moduleWidth,
            y: cell.y + r * moduleHeight,
            width: moduleWidth,
            height: moduleHeight,
            type: cell.type,
          });
        }
      }
    }
  }
  return subdivided;
}

// ----- Custom Case Finder & Summary -----
function findMatchingCustomCase(zoneWidth, zoneHeight) {
  return preMadeCustomCases.find(
    (c) => c.width === zoneWidth && c.height === zoneHeight
  );
}


// ----- Screen Fillability Check -----
function isScreenFillable(screenWidth, screenHeight) {
  if (
    screenWidth % LED_ROTATED.width === 0 &&
    screenHeight % LED_ROTATED.height === 0
  )
    return true;
  if (
    screenWidth % LED_STANDARD.width === 0 &&
    screenHeight % LED_STANDARD.height === 0
  )
    return true;
  return false;
}


function computeStandardLayout(screenWidth, screenHeight) {
  const rowHeight = STANDARD_CASE_HEIGHT; // 640 mm
  const fullRows = Math.floor(screenHeight / rowHeight);
  const bottomHeight = screenHeight % rowHeight;
  const layout = {
    standardCases: [],
    customCases: [],
    missingCases: [],
    valid: true,
  };
  if (bottomHeight > 0 && bottomHeight % LED_ROTATED.height !== 0) {
    layout.valid = false;
    layout.warning =
      "Pour le layout standard, la hauteur de la dernière ligne doit être un multiple de 320 mm.";
    return layout;
  }
  for (let r = 0; r < fullRows; r++) {
    const y = r * rowHeight;
    let xOffset = 0;
    const allowed =
      screenWidth % STANDARD_CASE_WIDTH === 0
        ? [STANDARD_CASE_WIDTH]
        : [
            STANDARD_CASE_WIDTH,
            ...getAllowedWidthsForHeight(rowHeight, LED_ROTATED.width).filter(
              (w) => w < STANDARD_CASE_WIDTH
            ),
          ].sort((a, b) => b - a);
    const { partition, missing } = partitionColumnsWithMissing(
      screenWidth,
      allowed,
      LED_ROTATED.width
    );
    partition.forEach((seg) => {
      if (seg === STANDARD_CASE_WIDTH) {
        layout.standardCases.push({
          x: xOffset,
          y,
          width: seg,
          height: rowHeight,
          type: "standard",
        });
      } else {
        const match = findMatchingCustomCase(seg, rowHeight);
        if (match)
          layout.customCases.push({
            x: xOffset,
            y,
            width: seg,
            height: rowHeight,
            type: "custom (pre-made)",
          });
        else
          layout.missingCases.push({
            x: xOffset,
            y,
            width: seg,
            height: rowHeight,
            type: "missing",
          });
      }
      xOffset += seg;
    });
    if (missing > 0) {
      const parts = splitMissing(missing, LED_ROTATED.width);
      parts.forEach((part) => {
        layout.missingCases.push({
          x: xOffset,
          y,
          width: part,
          height: rowHeight,
          type: "missing",
        });
        xOffset += part;
      });
    }
    if (xOffset !== screenWidth) layout.valid = false;
  }
  if (bottomHeight > 0) {
    const y = fullRows * rowHeight;
    let xOffset = 0;
    const allowed =
      getAllowedWidthsForHeight(bottomHeight, LED_ROTATED.width).length > 0
        ? getAllowedWidthsForHeight(bottomHeight, LED_ROTATED.width)
        : [LED_ROTATED.width];
    allowed.sort((a, b) => b - a);
    const { partition, missing } = partitionColumnsWithMissing(
      screenWidth,
      allowed,
      LED_ROTATED.width
    );
    partition.forEach((seg) => {
      const match = findMatchingCustomCase(seg, bottomHeight);
      if (match)
        layout.customCases.push({
          x: xOffset,
          y,
          width: seg,
          height: bottomHeight,
          type: "custom (pre-made)",
        });
      else
        layout.missingCases.push({
          x: xOffset,
          y,
          width: seg,
          height: bottomHeight,
          type: "missing",
        });
      xOffset += seg;
    });
    if (missing > 0) {
      const parts = splitMissing(missing, LED_ROTATED.width);
      parts.forEach((part) => {
        layout.missingCases.push({
          x: xOffset,
          y,
          width: part,
          height: bottomHeight,
          type: "missing",
        });
        xOffset += part;
      });
    }
    if (xOffset !== screenWidth) layout.valid = false;
  }
  return layout;
}









// * === MAIN ALGO === * //


// ----- Layout Computation: Portrait Layout -----
// Calcule le layout pour un écran en mode portrait utilisant les modules LED en orientation pivotée (LED_ROTATED).
// Les lignes complètes ont une hauteur de 640 mm ; la ligne du bas (si présente) doit être un multiple de 320.
function GenerateStandardLayout(screenWidth, screenHeight) {
  const rowHeight = CABINET_STANDARD.height; // TODO: Changer pour le cabinet height
  const fullRows = Math.floor(screenHeight / rowHeight);
  const bottomHeight = screenHeight % rowHeight;
  const layout = {standardCases: [], customCases: [], missingCases: [], valid: true};

  if ((bottomHeight > 0) && (bottomHeight % LED_ROTATED.height !== 0)) {
    return { ...layout, valid: false, warning: "Pour le layout standard, la hauteur de la dernière ligne doit être un multiple de 320 mm." };
  };

  function addCase(args, type = "missing") {
    switch(type) {
      case "standard":
        layout.standardCases.push({...args, type: "standard"});
        break;
      case "custom":
        layout.customCases.push({...args, type: "custom"});
        break;
      case "missing":
        layout.missingCases.push({...args, type: "missing"});
        break;
    }
  }

  for (let row = 0; row < fullRows; row++) {
    const yOffset = row * rowHeight;
    let xOffset = 0;
    const allowed = (screenWidth % CABINET_STANDARD.width === 0) ? [CABINET_STANDARD.width] : [CABINET_STANDARD.width, ...getAllowedWidthsForHeight(rowHeight, LED_ROTATED.width).filter( (w) => w < CABINET_STANDARD.width)].sort((a, b) => b - a);
    const {partition, missing} = partitionColumnsWithMissing(screenWidth, allowed, LED_ROTATED.width);

    partition.forEach((seg) => {
      const LOCAL_CABINET_TYPE = (seg === CABINET_STANDARD.width) ? "standard" : findMatchingCustomCase(seg, rowHeight) ? "custom" : "missing";
      addCase({x: xOffset, y: yOffset, width: seg, height: rowHeight}, LOCAL_CABINET_TYPE);
      xOffset += seg;
    });

    if (missing > 0) {
      const parts = splitMissing(missing, LED_ROTATED.width);
      parts.forEach((part) => {
        addCase({x: xOffset, y: yOffset, width: part, height: rowHeight}, "missing");
        xOffset += part;
      });
    }

    if (xOffset !== screenWidth) layout.valid = false;
  }

  if (bottomHeight > 0) {
    const yOffset = fullRows * rowHeight;
    let xOffset = 0;
    const allowed = (getAllowedWidthsForHeight(bottomHeight, LED_ROTATED.width).length > 0) ? getAllowedWidthsForHeight(bottomHeight, LED_ROTATED.width) : [LED_ROTATED.width].sort((a, b) => b - a);

    const { partition, missing } = partitionColumnsWithMissing(screenWidth, allowed, LED_ROTATED.width);

    partition.forEach((seg) => {
      addCase({x: xOffset, y: yOffset, width: seg, height: bottomHeight}, findMatchingCustomCase(seg, bottomHeight) ? "custom" : "missing");
      xOffset += seg;
    });

    if (missing > 0) {
      const parts = splitMissing(missing, LED_ROTATED.width);
      parts.forEach((part) => {
        addCase({x: xOffset, y: yOffset, width: part, height: bottomHeight}, "missing");
        xOffset += part;
      });
    }

    if (xOffset !== screenWidth) layout.valid = false;
  }
  return layout;
}


// ----- Transform Layout for 90° Clockwise Rotation -----
// Transforme un layout portrait (calculé pour [w, h]) en layout paysage.
// Pour chaque cellule : newX = cell.y, newY = containerWidth - cell.x - cell.width,
// newWidth = cell.height, newHeight = cell.width.
function RotatedLayout(layout, containerWidth) {
  const transformCell = (cell) => ({x: cell.y, y: containerWidth - cell.x - cell.width, width: cell.height, height: cell.width, type: cell.type});
  return Object.fromEntries(Object.entries(layout).map(([key, value]) => (key === "valid" || key === "warning") ? [key, value] : [key, value.map(transformCell)]));
}


// ----- Candidate Selection -----
// Calcule à la fois un layout portrait et un layout pivoté, et choisit le meilleur
// en comparant la validité et la surface totale manquante.

function LayoutSelector(width, height, moduleId) {
  const portrait = GenerateStandardLayout(width, height);
  const rotated = RotatedLayout(GenerateStandardLayout(height, width), height);
  // Helper : calcul de la surface manquante
  const missingArea = (layout) => layout.missingCases.reduce((sum, cell) => sum + cell.width * cell.height, 0);

  if (portrait.valid && rotated.valid) return missingArea(portrait) <= missingArea(rotated) ? { layout: portrait, mode: "standard" } : { layout: rotated, mode: "rotated" };
  if (portrait.valid) return { layout: portrait, mode: "standard" };
  if (rotated.valid) return { layout: rotated, mode: "rotated" };

  // Fallback : choisir celui avec le moins de surface manquante.
  return missingArea(portrait) <= missingArea(rotated) ? { layout: portrait, mode: "standard" } : { layout: rotated, mode: "rotated" };
}


// * === CUSTOM COMPONENTS === * //
const CustomGridInput = ({label, value, onChange}) => {
  return <label>
    <span>{label}</span>
    <input type="number" className="input" value={value} onChange={(e) => onChange(Number(e.target.value))}/>
  </label>;
}

const CustomGridSelect = ({label, value, onChange, options}) => {
  return <label>
    <span>{label}</span>
    <select value={value} onChange={(e) => onChange(e.target.value)} className="input">{options}</select>
  </label>
}


/**
 * Calcule les spécifications de l'écran en fonction des dimensions et du mode d'affichage.
 * @param {Object} params - Objet contenant les dimensions et les caractéristiques de l'écran.
 * @param {number} params.width - Largeur de l'écran en pixels.
 * @param {number} params.height - Hauteur de l'écran en pixels.
 * @param {Object} [params.module] - Informations sur le module LED (facultatif).
 * @param {number[]} [params.module.dimension] - Dimensions du module LED.
 * @param {number} [params.module.consommation] - Consommation énergétique du module (en watts par m²).
 * @param {"standard"|"custom"} mode - Mode d'affichage déterminant l'orientation des modules.
 * @returns {Object} - Un objet contenant les données calculées de l'écran.
 * @returns {number} return.area - Aire de l'écran en pixels carrés.
 * @returns {number} return.consommation - Consommation énergétique totale de l'écran (en watts).
 */
const CalcDisplayData = ({...params}, mode) => {
  const data = {...params};
  data.area = data.dimension.reduce((a, b) => a * b, 1);
  data.consommation = (data.module) ? (data.area / 1_000_000) * data.module.consommation : 0;

  // Flip des modules
  data.module.dimension.sort();
  if (mode !== "standard") data.module.dimension.reverse();

  return data;
}




// ----- Main Component -----
function GridOptimizer() {
  // Entrées par défaut, modifiables selon vos besoins.
  const [screenWidth, setScreenWidth] = useState(2240);
  const [screenHeight, setScreenHeight] = useState(960);
  const [selectedPanel, setSelectedPanel] = useState(LED_MODULES[0].id);

  const candidate = LayoutSelector(screenWidth, screenHeight, selectedPanel); //chooseLayout(screenWidth, screenHeight); // TODO: LayoutSelector(screenWidth, screenHeight)
  const finalLayout = candidate.layout;

  // * === VARIABLES === * //
  const scale = 0.2;

  const DisplayData = CalcDisplayData({
    dimension: [screenWidth, screenHeight],
    module: Modules.find(selectedPanel),
  }, candidate.mode);



  // Post-traitement des cellules manquantes.
  if (finalLayout.missingCases.length > 0) {
    const subdivided = subdivideMissingCells(finalLayout.missingCases, DisplayData.module.dimension[0], DisplayData.module.dimension[1]);
    const invalidRed = subdivided.some((cell) => cell.width !== DisplayData.module.dimension[0] || cell.height !== DisplayData.module.dimension[1]);

    if (invalidRed) {
      finalLayout.valid = false;
      finalLayout.warning = "WARNING: Screen size must be a multiple of 320x160!";
    }

    finalLayout.missingCases = subdivided;
  }

  console.log(finalLayout);


  // * === Calcul de la superficie === * //
  const calculateCasesArea = (...casesArrays) => casesArrays.reduce((acc, cases) => acc + cases.reduce((sum, c) => sum + c.width * c.height, 0), 0);
  const computedArea = calculateCasesArea(
    finalLayout.standardCases,
    finalLayout.customCases,
    finalLayout.missingCases
  );

  const areaWarning = finalLayout.warning || (computedArea !== DisplayData.area ? "WARNING: Screen size must be a multiple of 320x160!" : "");


  // * === Calcul du nombre de modules === * //
  function computeModuleCount(c, moduleWidth, moduleHeight) {
    return (c.width / moduleWidth) * (c.height / moduleHeight);
  }

  const calculateCasesModules = (...casesArrays) => casesArrays.reduce((acc, cases) => acc + cases.reduce((sum, c) => sum + computeModuleCount(c, DisplayData.module.dimension[0], DisplayData.module.dimension[1]), 0), 0);
  const totalModules = calculateCasesModules(
    finalLayout.standardCases,
    finalLayout.customCases
  );



  // * === CUSTOM FUNCTIONS === * //
  const GeneratedCaseSummary = ({label, cases}) => {
    const summary = cases.reduce((acc, c) => {
      const key = `${c.width}x${c.height}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    return <div className="i-row">
      <strong>{label}:</strong>
      <ul>{Object.entries(summary).map(([size, count]) => <li key={size}>{size}: {count}</li>)}</ul>
    </div>;
  }


  // * === FUNCTIONS SVG === * //
  const RenderedGlobalSubdivisions = ({cases, cabinetType}) => {
    const caseFillColor = {
      "std": "green",
      "cust": "orange",
      "miss": "red",
    }[cabinetType];

    return cases.map((cabinet, i) => {
      const RectData = Object.fromEntries(Object.entries(cabinet).map(([key, value]) => [key, value * scale]));
      const TextData = Object.fromEntries(Object.entries({x: (cabinet.x + cabinet.width / 2), y: (cabinet.y + cabinet.height / 2)}).map(([key, value]) => [key, value * scale]));

      const CabinetRect = <rect {...RectData} fill={caseFillColor} stroke="white" strokeWidth="2"/>;
      const CabinetText = <text {...TextData} fill="white" fontSize="16" textAnchor="middle" className="svg-text">{cabinet.width}x{cabinet.height}</text>;

      const xSubdivisions = Array.from({length: Math.floor(DisplayData.dimension[0] / DisplayData.module.dimension[0]) + 1}).map((_, idx) => {
        const xPos = idx * DisplayData.module.dimension[0];
        return ((xPos > cabinet.x) && (xPos < (cabinet.x + cabinet.width)))
          ? <line key={`gv-${xPos}-${cabinet.x}`} x1={xPos * scale} y1={cabinet.y * scale} x2={xPos * scale} y2={(cabinet.y + cabinet.height) * scale} stroke="white" strokeWidth="1"/>
          : null;
      });

      const ySubdivisions = Array.from({length: Math.floor(DisplayData.dimension[1] / DisplayData.module.dimension[1]) + 1}).map((_, idx) => {
        const yPos = idx * DisplayData.module.dimension[1];
        return ((yPos > cabinet.y) && (yPos < (cabinet.y + cabinet.height)))
          ? <line key={`gh-${yPos}-${cabinet.x}`} x1={cabinet.x * scale} y1={yPos * scale} x2={(cabinet.x + cabinet.width) * scale} y2={yPos * scale} stroke="white" strokeWidth="1"/>
          : null;
      });

      return <g key={[cabinetType, i].join('-')}>
        {CabinetRect}
        {xSubdivisions}
        {ySubdivisions}
        {CabinetText}
      </g>;
    });
  }

  //const LED_PANEL_OPTIONS = ledPanels.modules.map((module) => <option key={module.id} value={module.id}>{module.label} ({module.consommation} W/m²)</option>);
  const LED_PANEL_OPTIONS = LED_MODULES.map((module) => <option key={module.id} value={module.id}>{module.label} ({module.consommation} W/m²)</option>);

  return (
    <div className="container">
      <h2 className="heading">Grid Optimizer & Consumption Calculator</h2>

      <div className="i-box">
        <CustomGridInput label="Width (mm)" value={DisplayData.dimension[0]} onChange={setScreenWidth}/>
        <CustomGridInput label="Height (mm)" value={DisplayData.dimension[1]} onChange={setScreenHeight}/>
        <CustomGridSelect label="LED Panel" value={selectedPanel} onChange={setSelectedPanel} options={LED_PANEL_OPTIONS}/>
      </div>

      <div className="i-row">
        <label>Screen: {DisplayData.dimension[0]} x {DisplayData.dimension[1]} mm</label>
        <label>Layout mode: {candidate.mode} ({finalLayout.valid ? "Valid" : "Invalid tiling!"})</label>
        <label className={`warning ${!areaWarning && 'hidden'}`}>{areaWarning}</label>
        <label>Total LED Modules Used: {totalModules.toFixed(1)}</label>
      </div>

      <svg width={DisplayData.dimension[0] * scale} height={DisplayData.dimension[1] * scale} className="svg-container">
        <RenderedGlobalSubdivisions cabinetType="std" cases={finalLayout.standardCases}/>
        <RenderedGlobalSubdivisions cabinetType="cust" cases={finalLayout.customCases}/>
        <RenderedGlobalSubdivisions cabinetType="miss" cases={finalLayout.missingCases}/>
      </svg>

      <div className="i-row bg-highlight">
        <h3>Estimated Consumption</h3>
        <label>Screen Area: {(DisplayData.area / 1_000_000).toFixed(2)} m²</label>
        <label>{DisplayData.module ? `${DisplayData.module.name} (${DisplayData.module.consommation} W/m²)` : ""}</label>
        <b>Total Consumption: {DisplayData.consommation.toFixed(2)} W</b>
      </div>

      <div className="i-row i-gap">
        <h3><u>Cell Summary</u></h3>
        <GeneratedCaseSummary label="Standard" cases={finalLayout.standardCases}/>
        <GeneratedCaseSummary label="Custom" cases={finalLayout.customCases}/>
        <GeneratedCaseSummary label="Missing" cases={finalLayout.missingCases}/>
      </div>
      {/*<pre>DATA: {JSON.stringify(finalLayout, null, 2)}</pre>*/}
    </div>
  );
}

export default GridOptimizer;