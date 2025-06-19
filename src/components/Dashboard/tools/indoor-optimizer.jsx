"use client";

//import { Card, CardHeader, CardContent, CardTitle } from "@/components/Dashboard/ui/card";
import { Card, CardHeader, CardContent, CardTitle } from "@/ui/card";
import GridOptimizer from "@/components/gridOptimizer";

export function IndoorOptimizerTool() {
  return (
    <Card className="hover-effect tool-card">
      <CardHeader>
        <CardTitle>Grid Optimizer & Consumption Calculator</CardTitle>
      </CardHeader>
      <CardContent>
        <GridOptimizer />
      </CardContent>
    </Card>
  );
}
