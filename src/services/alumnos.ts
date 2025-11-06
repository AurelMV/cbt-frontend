import { api } from "./http"

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

export async function getAlumnos() {
  return api.get<AlumnoRead[]>("/alumnos/")
}

export async function crearAlumno(body: AlumnoCreate) {
  return api.post<AlumnoRead>("/alumnos/", body)
}

export async function actualizarAlumno(id: number, body: AlumnoUpdate) {
  return api.put<AlumnoRead>(`/alumnos/${id}`, body)
}
