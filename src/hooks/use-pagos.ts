import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { PagoRead, PagoUpdate } from "@/services/pagos"
import { actualizarPago, getPagos } from "@/services/pagos"

export function usePagos() {
  return useQuery<PagoRead[]>({
    queryKey: ["pagos"],
    queryFn: getPagos,
    staleTime: 30_000,
  })
}

export function useUpdatePago() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: PagoUpdate }) => actualizarPago(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pagos"] })
    },
  })
}
