import { api } from "./http"

export interface PreInscripcionCreate {
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
  idCiclo: number
  idPrograma: number
  estado?: string | null
}

export interface PreInscripcion extends PreInscripcionCreate { id: number; estado: string }

export const getPreinscripciones = () => api.get<PreInscripcion[]>("/preinscripciones/")
export const createPreinscripcion = (data: PreInscripcionCreate) => api.post<PreInscripcion>("/preinscripciones/", data)
