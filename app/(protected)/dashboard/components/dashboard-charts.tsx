"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";

type DashboardChartsProps = {
  kpis: Array<{ label: string; value: number }>;
};

export function DashboardCharts({ kpis }: DashboardChartsProps) {
  const max = Math.max(...kpis.map((item) => item.value), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Métricas principales</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer className="space-y-3">
          {kpis.map((kpi) => (
            <div key={kpi.label} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span>{kpi.label}</span>
                <span className="font-medium">{new Intl.NumberFormat("es-HN").format(kpi.value)}</span>
              </div>
              <div className="h-2 rounded-full bg-muted">
                <div className="h-2 rounded-full bg-primary" style={{ width: `${(kpi.value / max) * 100}%` }} />
              </div>
            </div>
          ))}
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
