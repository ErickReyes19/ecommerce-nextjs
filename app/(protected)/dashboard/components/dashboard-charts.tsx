"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";

type DashboardChartsProps = {
  orderStatusDistribution: Array<{ status: string; total: number }>;
  salesByCategory: Array<{ category: string; revenue: number; units: number }>;
};

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(var(--primary))",
];

export function DashboardCharts({ orderStatusDistribution, salesByCategory }: DashboardChartsProps) {
  const totalOrders = orderStatusDistribution.reduce((acc, item) => acc + item.total, 0);
  const totalSales = salesByCategory.reduce((acc, item) => acc + item.revenue, 0);

  const pieSegments = orderStatusDistribution.reduce(
    (acc, item, index) => {
      const portion = totalOrders > 0 ? (item.total / totalOrders) * 100 : 0;
      const start = acc.cursor;
      const end = start + portion;
      acc.cursor = end;
      acc.segments.push(`${COLORS[index % COLORS.length]} ${start}% ${end}%`);
      return acc;
    },
    { cursor: 0, segments: [] as string[] },
  );

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Distribución de pedidos por estado</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer className="grid gap-4 md:grid-cols-[220px_1fr] md:items-center">
            <div
              className="mx-auto h-44 w-44 rounded-full border"
              style={{
                background:
                  pieSegments.segments.length > 0
                    ? `conic-gradient(${pieSegments.segments.join(", ")})`
                    : "hsl(var(--muted))",
              }}
            />
            <div className="space-y-2">
              {orderStatusDistribution.map((item, index) => {
                const percentage = totalOrders > 0 ? (item.total / totalOrders) * 100 : 0;
                return (
                  <div key={item.status} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <span
                        className="inline-block h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      {item.status}
                    </span>
                    <span className="font-medium">
                      {item.total} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ventas por categoría (Top)</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer className="space-y-3">
            {salesByCategory.map((item, index) => {
              const width = totalSales > 0 ? (item.revenue / totalSales) * 100 : 0;
              return (
                <div key={item.category} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="truncate pr-2">{item.category}</span>
                    <span className="font-medium">
                      L {new Intl.NumberFormat("es-HN").format(item.revenue)}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${width}%`,
                        backgroundColor: COLORS[index % COLORS.length],
                      }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">{item.units} unidades vendidas</p>
                </div>
              );
            })}
            {salesByCategory.length === 0 && (
              <p className="text-sm text-muted-foreground">No hay ventas registradas para analizar categorías.</p>
            )}
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
