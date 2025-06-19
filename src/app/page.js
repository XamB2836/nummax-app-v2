"use client";

import { useState, useEffect, useCallback } from "react";


//import WattageCalculator from "@/components/wattageCalculator";
import GridOptimiser from "@/components/gridOptimizer";
import { Dashboard } from "@/components/Dashboard/dashboard";

export default function Home() {


  return (
    <div className="page">
      <Dashboard/>

      {/*<GridOptimise]/>*/}
     <GridOptimiser/>

    </div>
  );
}
