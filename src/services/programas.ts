import { api } from "./http"

// Paginación mínima compatible con backend
type Page<T> = {
  items: T[]
  total: number
  pages: number
  limit: number
  offset: number
  page: number
}

export type ProgramaRead = {
  id: number
  nombrePrograma: string
}

export type ProgramaCreate = {
  nombrePrograma: string
}

export type ProgramaUpdate = {
  nombrePrograma: string
}

export async function listarProgramas() {
  const page = await api.get<Page<ProgramaRead>>("/programas")
  return page.items
}

export function crearPrograma(body: ProgramaCreate) {
  return api.post<ProgramaRead>("/programas", body)
}

export function actualizarPrograma(id: number, body: ProgramaUpdate) {
  return api.put<ProgramaRead>(`/programas/${id}`, body)
}

// Compatibilidad con módulos existentes
export function getProgramas() {
  return listarProgramas()
}
