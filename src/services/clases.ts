import { api } from "./http"

export interface ClaseRead {
  id: number
  codigoClase: string
  grupo_id: number
}

export interface ClaseCreate {
  codigoClase: string
  grupo_id: number
}

export interface ClaseUpdate {
  codigoClase: string
  grupo_id: number
}

// Compat: algunos lugares usan barra final en GET
export async function getClases() {
  return api.get<ClaseRead[]>("/clases/")
}

export async function listarClases() {
  return api.get<ClaseRead[]>("/clases")
}

export async function crearClase(body: ClaseCreate) {
  return api.post<ClaseRead>("/clases", body)
}

export async function actualizarClase(id: number, body: ClaseUpdate) {
  return api.put<ClaseRead>(`/clases/${id}`, body)
}
