import { api } from "./http"

export type PreInscripcion = {
  id: number
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
  estado?: string
}

export type PrePago = {
  id: number
  nroVoucher: string
  medioPago: string
  monto: number
  fecha: string
  idInscripcion: number
  foto?: string | null
  TipoPago: string
  estado?: string
}

export type BandejaPreItem = {
  preinscripcion: PreInscripcion
  prepagos: PrePago[]
}

export type BandejaCounts = {
  preinscripcionesPendientes: number
  pagosPendientes: number
}

export async function getCounts() {
  return api.get<BandejaCounts>("/bandeja/counts")
}

export async function listPreinsPendientes() {
  return api.get<BandejaPreItem[]>("/bandeja/preinscripciones")
}

export async function aprobarPreinscripcion(preId: number, payload: { idGrupo: number; idClase: number }) {
  return api.post(`/bandeja/preinscripciones/${preId}/aprobar`, payload)
}

export async function rechazarPreinscripcion(preId: number) {
  return api.post(`/bandeja/preinscripciones/${preId}/rechazar`, {})
}

export type BandejaPagoItem = {
  pago: {
    id: number
    nroVoucher: string
    medioPago: string
    monto: number
    fecha: string
    idInscripcion: number
    foto?: string | null
    Estado: boolean
  }
  inscripcion: {
    id: number
    idCiclo: number
    idAlumno: number
  } | null
  alumno: {
    id: number
    nombreAlumno: string
    aPaterno: string
    aMaterno: string
    nroDocumento: string
  } | null
}

export async function listPagosPendientes() {
  return api.get<BandejaPagoItem[]>("/bandeja/pagos")
}

export async function aprobarPago(id: number) {
  return api.post(`/bandeja/pagos/${id}/aprobar`, {})
}

export async function rechazarPago(id: number) {
  return api.post(`/bandeja/pagos/${id}/rechazar`, {})
}
