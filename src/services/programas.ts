import { api } from "./http"

export interface Programa {
  id: number
  nombrePrograma: string
}

export async function getProgramas() {
  return api.get<Programa[]>("/programas/")
}
