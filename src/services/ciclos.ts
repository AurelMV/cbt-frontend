import { api } from "./http"
import type { PaginatedResponse } from "./pagination"

export interface CicloRead {
  id: number
  nombreCiclo: string
  fechaInicio: string // ISO date
  fechaFin: string    // ISO date
  estado: boolean
}

export interface CicloCreate {
  nombreCiclo: string
  fechaInicio: string // ISO date
  fechaFin: string    // ISO date
  estado: boolean
}

export interface CicloUpdate {
  nombreCiclo: string
  fechaInicio: string
  fechaFin: string
  estado: boolean
}

// Compatibilidad: algunos módulos importan `Ciclo` en lugar de `CicloRead`.
export type Ciclo = CicloRead

export async function getCiclos() {
  const page = await api.get<CicloRead[] | PaginatedResponse<CicloRead>>("/ciclos/")
  return Array.isArray(page) ? page : page.items
}

export async function listarCiclos() {
  const page = await api.get<CicloRead[] | PaginatedResponse<CicloRead>>("/ciclos")
  return Array.isArray(page) ? page : page.items
}

export async function crearCiclo(body: CicloCreate) {
  return api.post<CicloRead>("/ciclos", body)
}

export async function actualizarCiclo(id: number, body: CicloUpdate) {
  return api.put<CicloRead>(`/ciclos/${id}`, body)
}
