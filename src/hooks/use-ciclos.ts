import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { CicloCreate, CicloRead, CicloUpdate } from "@/services/ciclos"
import { actualizarCiclo, crearCiclo, listarCiclos } from "@/services/ciclos"

export function useCiclos() {
  return useQuery<CicloRead[]>({
    queryKey: ["ciclos"],
    queryFn: listarCiclos,
    staleTime: 30_000,
  })
}

export function useCreateCiclo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CicloCreate) => crearCiclo(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ciclos"] })
    },
  })
}

export function useUpdateCiclo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: CicloUpdate }) => actualizarCiclo(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ciclos"] })
    },
  })
}
