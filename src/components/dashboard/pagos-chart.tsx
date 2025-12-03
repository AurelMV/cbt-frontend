"use client"

import { Pie, PieChart } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import type { ChartDataPoint } from "@/services/dashboard"

const chartConfig = {
  value: {
    label: "Pagos",
  },
  pagado: {
    label: "Pagado",
    color: "var(--primary)",
  },
  pendiente: {
    label: "Pendiente",
    color: "var(--muted-foreground)",
  },
} satisfies ChartConfig

interface PagosChartProps {
  readonly data: ChartDataPoint[]
}

export function PagosChart({ data }: PagosChartProps) {
  const processedData = data.map((item, index) => ({
    ...item,
    fill: item.fill || (index === 0 ? "var(--color-pagado)" : "var(--color-pendiente)"),
  }))

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="items-center pb-0">
        <CardTitle>Estado de Pagos</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px]">
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Pie data={processedData} dataKey="value" nameKey="name" innerRadius={60} />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
