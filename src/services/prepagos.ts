import { api } from "./http"

export interface PrePagoCreate {
  nroVoucher: string
  medioPago: string
  monto: number
  fecha: string
  idInscripcion: number
  foto?: string | null
  TipoPago: string
}

export interface PrePago extends PrePagoCreate { id: number }

export const getPrepagos = () => api.get<PrePago[]>("/prepagos/")
export const createPrePago = (data: PrePagoCreate) => api.post<PrePago>("/prepagos/", data)
