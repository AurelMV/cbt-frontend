"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import type { ChartDataPoint } from "@/services/dashboard"

const chartConfig = {
  ingresos: {
    label: "Ingresos",
    color: "var(--primary)",
  },
} satisfies ChartConfig

interface IngresosChartProps {
  readonly data: ChartDataPoint[]
}

export function IngresosChart({ data }: IngresosChartProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Ingresos por Mes</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
          <BarChart accessibilityLayer data={data}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="name"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 7)}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `S/ ${value}`}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="value" fill="var(--color-ingresos)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
