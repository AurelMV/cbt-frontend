import { api, BASE } from "./http"

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

export const downloadComprobante = async (id: number) => {
  const url = `${BASE}/preinscripciones/${id}/comprobante`
  const res = await fetch(url)
  if (!res.ok) throw new Error("Error descargando comprobante")
  const blob = await res.blob()
  const downloadUrl = window.URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = downloadUrl
  a.download = `Comprobante-PRE-${id}.pdf`
  document.body.appendChild(a)
  a.click()
  a.remove()
}

