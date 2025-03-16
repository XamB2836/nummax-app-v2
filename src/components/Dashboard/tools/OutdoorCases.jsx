import { Card, CardHeader, CardContent, CardTitle } from "@/ui/card";

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