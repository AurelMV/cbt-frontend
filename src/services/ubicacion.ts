import { api } from "./http"

export interface Departamento { id: number; nombreDepartamento: string }
export interface Provincia { id: number; nombreProvincia: string; departamento_id: number }
export interface Distrito { id: number; nombreDistrito: string; provincia_id: number }
export interface Colegio { id: number; nombreColegio: string; distrito_id: number }

export const getDepartamentos = () => api.get<Departamento[]>("/departamentos/")

export const getProvinciasPorDepartamento = (departamentoId: number) => 
  api.get<Provincia[]>(`/provincias/?departamento_id=${departamentoId}`)

export const getDistritosPorProvincia = (provinciaId: number) => 
  api.get<Distrito[]>(`/distritos/?provincia_id=${provinciaId}`)

export const getColegiosPorDistrito = (distritoId: number) => 
  api.get<Colegio[]>(`/colegios/?distrito_id=${distritoId}`)
