import { api } from "./http"

export interface DashboardStats {
  total_alumnos: number
  total_inscripciones: number
  ingresos_totales: number
  pagos_pendientes: number
}

export interface ChartDataPoint {
  name: string
  value: number
  fill?: string
}

export interface DashboardData {
  stats: DashboardStats
  charts: {
    ingresos_por_mes: ChartDataPoint[]
    inscripciones_por_programa: ChartDataPoint[]
    inscripciones_por_ciclo: ChartDataPoint[]
    estado_pagos: ChartDataPoint[]
  }
}

export const getDashboardData = async (): Promise<DashboardData> => {
  return api.get<DashboardData>("/dashboard/")
}
