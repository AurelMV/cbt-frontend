import { api } from "./http"
import type { PaginatedResponse } from "./pagination"

export interface PagoListItem extends PagoRead {
  tipoPago?: string | null
  nombreAlumno: string
  aPaterno?: string | null
  aMaterno?: string | null
  nombreCiclo: string
}

export type PagosPage = PaginatedResponse<PagoListItem>

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

export const downloadComprobantePago = async (id: number) => {
  const BASE = import.meta.env.VITE_BASE_URL_API as string
  const url = `${BASE}/pagos/${id}/comprobante`
  const res = await fetch(url)
  if (!res.ok) throw new Error("Error descargando comprobante")
  const blob = await res.blob()
  const downloadUrl = window.URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = downloadUrl
  a.download = `Comprobante-Pago-${id}.pdf`
  document.body.appendChild(a)
  a.click()
  a.remove()
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

export interface PagoListParams {
  page?: number
  limit?: number
  q?: string
  idCiclo?: number
  estado?: boolean
  tipoPago?: string
}

export async function listPagos(params?: PagoListParams) {
  const search = new URLSearchParams()
  if (typeof params?.page === "number") search.set("page", String(params.page))
  if (typeof params?.limit === "number") search.set("limit", String(params.limit))
  if (params?.q) search.set("q", params.q)
  if (typeof params?.idCiclo === "number") search.set("idCiclo", String(params.idCiclo))
  if (typeof params?.estado === "boolean") search.set("estado", String(params.estado))
  if (params?.tipoPago) search.set("tipoPago", params.tipoPago)
  const url = `/pagos/${search.toString() ? `?${search.toString()}` : ""}`
  return api.get<PaginatedResponse<PagoListItem>>(url)
}

// Compat: solo items
export async function getPagos() {
  const page = await listPagos()
  return page.items
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
