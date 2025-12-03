import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { ProgramaCreate, ProgramaRead, ProgramaUpdate } from "@/services/programas"
import { crearPrograma, listarProgramas, actualizarPrograma } from "@/services/programas"

export function useProgramas() {
  return useQuery<ProgramaRead[]>({
    queryKey: ["programas"],
    queryFn: listarProgramas,
    staleTime: 30_000,
  })
}

export function useCreatePrograma() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: ProgramaCreate) => crearPrograma(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["programas"] })
    },
  })
}

export function useUpdatePrograma() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: ProgramaUpdate }) => actualizarPrograma(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["programas"] })
    },
  })
}
