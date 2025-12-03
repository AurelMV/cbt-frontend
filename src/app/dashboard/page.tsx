"use client"

import { useDashboard } from "@/hooks/use-dashboard"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { IngresosChart } from "@/components/dashboard/ingresos-chart"
import { ProgramasChart } from "@/components/dashboard/programas-chart"
import { CiclosChart } from "@/components/dashboard/ciclos-chart"
import { PagosChart } from "@/components/dashboard/pagos-chart"

export default function Page() {
  const { data, isLoading, error } = useDashboard()

  if (isLoading) return <div className="p-6">Cargando dashboard...</div>
  if (error) return <div className="p-6 text-red-500">Error al cargar dashboard</div>
  if (!data) return null

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6 w-full max-w-full overflow-x-hidden">
      <StatsCards stats={data.stats} />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-1 lg:col-span-4 min-w-0">
          <IngresosChart data={data.charts.ingresos_por_mes} />
        </div>
        <div className="col-span-1 lg:col-span-3 min-w-0">
          <ProgramasChart data={data.charts.inscripciones_por_programa} />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-1 lg:col-span-4 min-w-0">
          <CiclosChart data={data.charts.inscripciones_por_ciclo} />
        </div>
        <div className="col-span-1 lg:col-span-3 min-w-0">
          <PagosChart data={data.charts.estado_pagos} />
        </div>
      </div>
    </div>
  )
}
