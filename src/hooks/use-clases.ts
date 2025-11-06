import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { ClaseCreate, ClaseRead, ClaseUpdate } from "@/services/clases"
import { actualizarClase, crearClase, listarClases } from "@/services/clases"

export function useClases() {
  return useQuery<ClaseRead[]>({
    queryKey: ["clases"],
    queryFn: listarClases,
    staleTime: 30_000,
  })
}

export function useCreateClase() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: ClaseCreate) => crearClase(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clases"] })
    },
  })
}

export function useUpdateClase() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: ClaseUpdate }) => actualizarClase(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clases"] })
    },
  })
}
