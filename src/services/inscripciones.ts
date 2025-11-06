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

export async function buscarInscripcion(dni: string, idCiclo: number, opts?: { silentError?: boolean }) {
  const params = new URLSearchParams({ dni, idCiclo: String(idCiclo) })
  return api.get<InscripcionLookup>(`/inscripciones/buscar?${params.toString()}`, { silentError: opts?.silentError })
}

// Tipos y endpoints principales
export interface InscripcionCreate {
  turno: string
  fecha: string // ISO date
  Estado?: boolean // default true
  idAlumno: number
  idPrograma: number
  idCiclo: number
  idClase: number
  Codigo: string
  EstadoPago: string
  TipoPago: string
}

export interface InscripcionRead extends InscripcionCreate { id: number }

export async function getInscripciones() {
  return api.get<InscripcionRead[]>("/inscripciones/")
}

export async function crearInscripcion(body: InscripcionCreate) {
  return api.post<InscripcionRead>("/inscripciones/", body)
}

export interface InscripcionUpdate {
  turno: string
  fecha: string
  Estado: boolean
  idAlumno: number
  idPrograma: number
  idCiclo: number
  idClase: number
  Codigo: string
  EstadoPago: string
  TipoPago: string
}

export async function actualizarInscripcion(id: number, body: InscripcionUpdate) {
  return api.put<InscripcionRead>(`/inscripciones/${id}`, body)
}
