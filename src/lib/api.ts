// Lightweight API client wrappers for backend integration (uses central http services)
import { api } from "@/services/http"

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

export async function getProgramas(): Promise<ProgramaRead[]> {
  return api.get<ProgramaRead[]>(`/programas`)
}

export async function createPrograma(body: ProgramaCreate): Promise<ProgramaRead> {
  return api.post<ProgramaRead>(`/programas`, body)
}

export async function updatePrograma(id: number, body: ProgramaUpdate): Promise<ProgramaRead> {
  return api.put<ProgramaRead>(`/programas/${id}`, body)
}
