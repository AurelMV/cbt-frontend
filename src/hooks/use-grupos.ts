import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { GrupoCreate, GrupoRead, GrupoUpdate } from "@/services/grupos"
import { actualizarGrupo, crearGrupo, listarGrupos } from "@/services/grupos"

export function useGrupos() {
  return useQuery<GrupoRead[]>({
    queryKey: ["grupos"],
    queryFn: listarGrupos,
    staleTime: 30_000,
  })
}

export function useCreateGrupo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: GrupoCreate) => crearGrupo(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["grupos"] })
    },
  })
}

export function useUpdateGrupo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: GrupoUpdate }) => actualizarGrupo(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["grupos"] })
    },
  })
}
