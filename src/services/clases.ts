import { api } from "./http"
import type { PaginatedResponse } from "./pagination"

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
  const page = await api.get<ClaseRead[] | PaginatedResponse<ClaseRead>>("/clases/")
  return Array.isArray(page) ? page : page.items
}

export async function listarClases() {
  const page = await api.get<ClaseRead[] | PaginatedResponse<ClaseRead>>("/clases")
  return Array.isArray(page) ? page : page.items
}

export async function crearClase(body: ClaseCreate) {
  return api.post<ClaseRead>("/clases", body)
}

export async function actualizarClase(id: number, body: ClaseUpdate) {
  return api.put<ClaseRead>(`/clases/${id}`, body)
}
