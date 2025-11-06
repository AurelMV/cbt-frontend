import { api } from "./http"

export interface PagoCreate {
  nroVoucher: string
  medioPago: string
  monto: number
  fecha: string // ISO date (YYYY-MM-DD)
  idInscripcion: number
  foto?: string | null
  Estado?: boolean // false = pendiente, true = validado
}

export async function crearPago(payload: PagoCreate, opts?: { silentError?: boolean }) {
  return api.post<PagoRead>(`/pagos/`, payload, { silentError: opts?.silentError })
}

export interface PagoRead {
  id: number
  nroVoucher: string
  medioPago: string
  monto: number
  fecha: string
  idInscripcion: number
  foto?: string | null
  Estado: boolean
}

export async function getPagos() {
  return api.get<PagoRead[]>("/pagos/")
}

export interface PagoUpdate {
  nroVoucher: string
  medioPago: string
  monto: number
  fecha: string
  idInscripcion: number
  foto?: string | null
  Estado: boolean
}

export async function actualizarPago(id: number, body: PagoUpdate) {
  return api.put<PagoRead>(`/pagos/${id}`, body)
}
