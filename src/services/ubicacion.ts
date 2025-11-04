import { api } from "./http"

export interface Departamento { id: number; nombreDepartamento: string }
export interface Provincia { id: number; nombreProvincia: string; departamento_id: number }
export interface Distrito { id: number; nombreDistrito: string; provincia_id: number }
export interface Colegio { id: number; nombreColegio: string; distrito_id: number }

export const getDepartamentos = () => api.get<Departamento[]>("/departamentos/")
export const getProvincias = () => api.get<Provincia[]>("/provincias/")
export const getDistritos = () => api.get<Distrito[]>("/distritos/")
export const getColegios = () => api.get<Colegio[]>("/colegios/")

export async function getProvinciasPorDepartamento(departamentoId: number) {
  const all = await getProvincias()
  return all.filter(p => p.departamento_id === departamentoId)
}
export async function getDistritosPorProvincia(provinciaId: number) {
  const all = await getDistritos()
  return all.filter(d => d.provincia_id === provinciaId)
}
export async function getColegiosPorDistrito(distritoId: number) {
  const all = await getColegios()
  return all.filter(c => c.distrito_id === distritoId)
}
