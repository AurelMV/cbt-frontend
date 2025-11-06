import { api } from "./http"

export interface GrupoRead {
  id: number
  nombreGrupo: string
  aforo: number
  estado: boolean
  ciclo_id: number
}

export interface GrupoCreate {
  nombreGrupo: string
  aforo: number
  estado?: boolean // default true if omitted
  ciclo_id: number
}

export interface GrupoUpdate {
  nombreGrupo: string
  aforo: number
  estado: boolean
  ciclo_id: number
}

// Compat: mantener alias antiguo "Grupo"
export type Grupo = GrupoRead

// Compat: endpoint con barra final se usa en algunos lugares
export async function getGrupos() {
  return api.get<GrupoRead[]>("/grupos/")
}

export async function listarGrupos() {
  return api.get<GrupoRead[]>("/grupos")
}

export async function crearGrupo(body: GrupoCreate) {
  // Si estado viene indefinido, el backend asume true
  return api.post<GrupoRead>("/grupos", body)
}

export async function actualizarGrupo(id: number, body: GrupoUpdate) {
  return api.put<GrupoRead>(`/grupos/${id}`, body)
}

export async function getGruposPorCiclo(cicloId: number) {
  const grupos = await getGrupos()
  return grupos.filter(g => g.ciclo_id === cicloId)
}
