import { api } from "./http"

export interface Ciclo {
  id: number
  nombreCiclo: string
  fechaInicio: string
  fechaFin: string
  estado: boolean
}

export async function getCiclos() {
  return api.get<Ciclo[]>("/ciclos/")
}
