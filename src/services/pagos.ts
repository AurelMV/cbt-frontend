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

export async function crearPago(payload: PagoCreate) {
  return api.post(`/pagos/`, payload)
}
