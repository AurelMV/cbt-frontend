import { api } from "./http"
import type { PaginatedResponse } from "./pagination"

export interface AlumnoCreate {
  nombreAlumno: string
  aMaterno: string
  aPaterno: string
  sexo: string
  telefonoEstudiante: string
  telefonoApoderado: string
  fechaNacimiento: string // ISO date
  email: string
  anoCulminado: number
  Direccion: string
  nroDocumento: string
  idColegio: number
}

export interface AlumnoRead extends AlumnoCreate { id: number }

export interface AlumnoListItem extends AlumnoRead {
  edad: number
  colegioNombre?: string | null
}

export interface AlumnoUpdate {
  nombreAlumno: string
  aMaterno: string
  aPaterno: string
  sexo: string
  telefonoEstudiante: string
  telefonoApoderado: string
  fechaNacimiento: string
  email: string
  anoCulminado: number
  Direccion: string
  nroDocumento: string
  idColegio: number
}

export type AlumnosPage = PaginatedResponse<AlumnoListItem>

export interface AlumnoListParams {
  page?: number
  limit?: number
  q?: string
  sexo?: string
  idColegio?: number
}

export async function listAlumnos(params?: AlumnoListParams) {
  const search = new URLSearchParams()
  if (typeof params?.page === "number") search.set("page", String(params.page))
  if (typeof params?.limit === "number") search.set("limit", String(params.limit))
  if (params?.q) search.set("q", params.q)
  if (params?.sexo) search.set("sexo", params.sexo)
  if (typeof params?.idColegio === "number") search.set("idColegio", String(params.idColegio))
  const url = `/alumnos/${search.toString() ? `?${search.toString()}` : ""}`
  return api.get<PaginatedResponse<AlumnoListItem>>(url)
}

// Compat: obtener solo items
export async function getAlumnos() {
  const page = await listAlumnos()
  return page.items
}

export async function crearAlumno(body: AlumnoCreate) {
  return api.post<AlumnoRead>("/alumnos/", body)
}

export async function actualizarAlumno(id: number, body: AlumnoUpdate) {
  return api.put<AlumnoRead>(`/alumnos/${id}`, body)
}
