"use client";

import { useState, useEffect, useCallback } from "react";

import { Modules, ModulesLabels } from "@/modules/moduleList";

//import WattageCalculator from "@/components/wattageCalculator";
import GridOptimiser from "@/components/gridOptimiser";

import GridMaker from "@/components/gridMaker";
import { Dashboard } from "@/components/Dashboard/dashboard";

export default function Home() {


  return (
    <div className="page">
      <Dashboard/>

      {/*<GridOptimise]/>*/}
     <GridMaker/>

    </div>
  );
}
