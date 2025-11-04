import { api } from "./http"

export interface Grupo {
  id: number
  nombreGrupo: string
  aforo: number
  estado: boolean
  ciclo_id: number
}

export async function getGrupos() {
  return api.get<Grupo[]>("/grupos/")
}

export async function getGruposPorCiclo(cicloId: number) {
  const grupos = await getGrupos()
  return grupos.filter(g => g.ciclo_id === cicloId)
}
