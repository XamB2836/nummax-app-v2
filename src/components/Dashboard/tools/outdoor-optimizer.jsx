"use client";

import { Card, CardHeader, CardContent, CardTitle } from "@/ui/card";
import OutdoorOptimizer from "@/components/outdoorOptimizer";

export function OutdoorOptimizerTool() {
  return (
    <Card className="hover-effect tool-card">
      <CardHeader>
        <CardTitle>Outdoor Grid Optimizer</CardTitle>
      </CardHeader>
      <CardContent>
        <OutdoorOptimizer />
      </CardContent>
    </Card>
  );
}
