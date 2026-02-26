"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";

type ReportesChartsProps = {
  ventasPorDia: Array<{ fecha: string; total: number }>;
  topProductos: Array<{ nombre: string; unidades: number }>;
};

export function ReportesCharts({ ventasPorDia, topProductos }: ReportesChartsProps) {
  const maxVentas = Math.max(...ventasPorDia.map((item) => item.total), 1);
  const maxUnidades = Math.max(...topProductos.map((item) => item.unidades), 1);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Ventas por día</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer className="space-y-3">
            {ventasPorDia.map((dia) => (
              <div key={dia.fecha} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>{dia.fecha}</span>
                  <span className="font-medium">L {new Intl.NumberFormat("es-HN").format(dia.total)}</span>
                </div>
                <div className="h-2 rounded-full bg-muted">
                  <div className="h-2 rounded-full bg-chart-2" style={{ width: `${(dia.total / maxVentas) * 100}%` }} />
                </div>
              </div>
            ))}
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top productos (unidades)</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer className="space-y-3">
            {topProductos.map((producto) => (
              <div key={producto.nombre} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="truncate pr-2">{producto.nombre}</span>
                  <span className="font-medium">{producto.unidades}</span>
                </div>
                <div className="h-2 rounded-full bg-muted">
                  <div className="h-2 rounded-full bg-chart-3" style={{ width: `${(producto.unidades / maxUnidades) * 100}%` }} />
                </div>
              </div>
            ))}
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
