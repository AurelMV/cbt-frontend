import { api } from "./http"

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

export function listarProgramas() {
  return api.get<ProgramaRead[]>("/programas")
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
