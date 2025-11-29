import { keepPreviousData, useMutation, useQuery, useQueryClient, type DefaultError, type UseQueryResult } from "@tanstack/react-query"
import type { InscripcionCreate, InscripcionUpdate, InscripcionesPage, InscripcionListParams } from "@/services/inscripciones"
import { actualizarInscripcion, crearInscripcion, listInscripciones } from "@/services/inscripciones"

export function useInscripciones(params: InscripcionListParams = {}): UseQueryResult<InscripcionesPage, DefaultError> {
  const { page = 0, limit = 10, q = "", idPrograma, idCiclo, idClase } = params
  return useQuery<InscripcionesPage>({
    queryKey: ["inscripciones", { page, limit, q, idPrograma, idCiclo, idClase }],
    queryFn: () => listInscripciones({ page, limit, q, idPrograma, idCiclo, idClase }),
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  })
}

export function useCreateInscripcion() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: InscripcionCreate) => crearInscripcion(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["inscripciones"] })
    },
  })
}

export function useUpdateInscripcion() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: InscripcionUpdate }) => actualizarInscripcion(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["inscripciones"] })
    },
  })
}
