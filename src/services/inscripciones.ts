import { api } from "./http"

export interface InscripcionLookup {
  idInscripcion: number
  idAlumno: number
  idCiclo: number
  nombreAlumno: string
  aPaterno: string
  aMaterno: string
  Codigo?: string | null
}

export async function buscarInscripcion(dni: string, idCiclo: number) {
  const params = new URLSearchParams({ dni, idCiclo: String(idCiclo) })
  return api.get<InscripcionLookup>(`/inscripciones/buscar?${params.toString()}`)
}
