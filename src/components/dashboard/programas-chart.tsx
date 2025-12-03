"use client"

import { Pie, PieChart } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import type { ChartDataPoint } from "@/services/dashboard"

const chartConfig = {
  value: {
    label: "Inscripciones",
  },
  program1: {
    label: "Programa 1",
    color: "var(--primary)",
  },
  program2: {
    label: "Programa 2",
    color: "var(--secondary)",
  },
  program3: {
    label: "Programa 3",
    color: "var(--accent)",
  },
  program4: {
    label: "Programa 4",
    color: "var(--muted)",
  },
  program5: {
    label: "Programa 5",
    color: "var(--destructive)",
  },
} satisfies ChartConfig

interface ProgramasChartProps {
  readonly data: ChartDataPoint[]
}

export function ProgramasChart({ data }: ProgramasChartProps) {
  // Assign colors dynamically if not provided, or map to config
  const COLORS = [
    "var(--color-program1)",
    "var(--color-program2)",
    "var(--color-program3)",
    "var(--color-program4)",
    "var(--color-program5)",
  ];

  const processedData = data.map((item, index) => ({
    ...item,
    fill: item.fill || COLORS[index % COLORS.length],
  }))

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="items-center pb-0">
        <CardTitle>Inscripciones por Programa</CardTitle>
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
