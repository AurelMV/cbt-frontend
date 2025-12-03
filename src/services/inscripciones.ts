import { api } from "./http"
import type { PaginatedResponse } from "./pagination"

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

export interface InscripcionListItem extends InscripcionRead {
  nombreAlumno: string
  aPaterno?: string | null
  aMaterno?: string | null
  nombreCiclo: string
  nombreGrupo: string
  codigoClase: string
  pagosCount: number
}

export type InscripcionesPage = PaginatedResponse<InscripcionListItem>

export interface InscripcionListParams {
  page?: number
  limit?: number
  q?: string
  idPrograma?: number
  idCiclo?: number
  idClase?: number
}

export async function listInscripciones(params?: InscripcionListParams) {
  const search = new URLSearchParams()
  if (typeof params?.page === "number") search.set("page", String(params.page))
  if (typeof params?.limit === "number") search.set("limit", String(params.limit))
  if (params?.q) search.set("q", params.q)
  if (typeof params?.idPrograma === "number") search.set("idPrograma", String(params.idPrograma))
  if (typeof params?.idCiclo === "number") search.set("idCiclo", String(params.idCiclo))
  if (typeof params?.idClase === "number") search.set("idClase", String(params.idClase))
  const url = `/inscripciones/${search.toString() ? `?${search.toString()}` : ""}`
  return api.get<PaginatedResponse<InscripcionListItem>>(url)
}

// Compat: solo items
export async function getInscripciones() {
  const page = await listInscripciones()
  return page.items
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
