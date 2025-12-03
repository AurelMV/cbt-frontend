import { keepPreviousData, useMutation, useQuery, useQueryClient, type DefaultError, type UseQueryResult } from "@tanstack/react-query"
import type { AlumnoListParams, AlumnoUpdate, AlumnosPage } from "@/services/alumnos"
import { actualizarAlumno, listAlumnos } from "@/services/alumnos"

export function useAlumnos(params: AlumnoListParams = {}): UseQueryResult<AlumnosPage, DefaultError> {
  const page = params.page ?? 0
  const limit = params.limit ?? 15
  const q = params.q ?? ""
  const sexo = params.sexo
  const idColegio = params.idColegio
  return useQuery<AlumnosPage>({
    queryKey: ["alumnos", { page, limit, q, sexo, idColegio }],
    queryFn: () => listAlumnos({ page, limit, q, sexo, idColegio }),
    staleTime: 30_000,
      placeholderData: keepPreviousData,
  })
}

export function useUpdateAlumno() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: AlumnoUpdate }) => actualizarAlumno(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["alumnos"] })
    },
  })
}
