import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { InscripcionCreate, InscripcionRead, InscripcionUpdate } from "@/services/inscripciones"
import { actualizarInscripcion, crearInscripcion, getInscripciones } from "@/services/inscripciones"

export function useInscripciones() {
  return useQuery<InscripcionRead[]>({
    queryKey: ["inscripciones"],
    queryFn: getInscripciones,
    staleTime: 30_000,
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
