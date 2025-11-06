import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { AlumnoRead, AlumnoUpdate } from "@/services/alumnos"
import { actualizarAlumno, getAlumnos } from "@/services/alumnos"

export function useAlumnos() {
  return useQuery<AlumnoRead[]>({
    queryKey: ["alumnos"],
    queryFn: getAlumnos,
    staleTime: 30_000,
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
