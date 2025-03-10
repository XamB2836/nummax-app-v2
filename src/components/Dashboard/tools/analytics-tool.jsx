import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/dashboard/ui/card"
import { BarChart3, LineChart, PieChart, TrendingUp } from "lucide-react"

export function AnalyticsTool() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">View performance metrics and insights.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover-effect tool-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Productivity</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87%</div>
            <p className="text-xs text-muted-foreground">+5% from last month</p>
          </CardContent>
        </Card>

        <Card className="hover-effect tool-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Project Completion</CardTitle>
            <PieChart className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92%</div>
            <p className="text-xs text-muted-foreground">+3% from last quarter</p>
          </CardContent>
        </Card>

        <Card className="hover-effect tool-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Resource Utilization</CardTitle>
            <BarChart3 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78%</div>
            <p className="text-xs text-muted-foreground">-2% from last month</p>
          </CardContent>
        </Card>

        <Card className="hover-effect tool-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Cost Efficiency</CardTitle>
            <LineChart className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94%</div>
            <p className="text-xs text-muted-foreground">+7% from last quarter</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="col-span-2 tool-card">
          <CardHeader>
            <CardTitle>Performance Trends</CardTitle>
            <CardDescription>Monthly performance metrics for the past year</CardDescription>
          </CardHeader>
          <CardContent className="h-80 w-full">
            <div className="h-full w-full rounded-md bg-secondary flex items-center justify-center">
              <p className="text-muted-foreground">Chart visualization would appear here</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="tool-card">
          <CardHeader>
            <CardTitle>Department Performance</CardTitle>
            <CardDescription>Comparison across departments</CardDescription>
          </CardHeader>
          <CardContent className="h-60 w-full">
            <div className="h-full w-full rounded-md bg-secondary flex items-center justify-center">
              <p className="text-muted-foreground">Bar chart would appear here</p>
            </div>
          </CardContent>
        </Card>

        <Card className="tool-card">
          <CardHeader>
            <CardTitle>Resource Allocation</CardTitle>
            <CardDescription>Current distribution of resources</CardDescription>
          </CardHeader>
          <CardContent className="h-60 w-full">
            <div className="h-full w-full rounded-md bg-secondary flex items-center justify-center">
              <p className="text-muted-foreground">Pie chart would appear here</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

