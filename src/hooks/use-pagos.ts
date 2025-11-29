import { useMutation, useQuery, useQueryClient, type UseQueryResult } from "@tanstack/react-query"
import type { PagoListParams, PagoUpdate, PagosPage } from "@/services/pagos"
import { actualizarPago, listPagos } from "@/services/pagos"

export function usePagos(params: PagoListParams = {}): UseQueryResult<PagosPage> {
  const { page = 0, limit = 10, q = "", idCiclo, estado, tipoPago } = params
  return useQuery<PagosPage>({
    queryKey: ["pagos", { page, limit, q, idCiclo, estado, tipoPago }],
    queryFn: () => listPagos({ page, limit, q, idCiclo, estado, tipoPago }),
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
