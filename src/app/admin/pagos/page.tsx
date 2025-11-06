import { useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"
import { usePagos, useUpdatePago } from "@/hooks/use-pagos"
import { useForm, type Resolver } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Field, FieldContent, FieldError, FieldLabel } from "@/components/ui/field"
// Bandeja ahora vive en el sidebar; no se muestra aquí

export default function Page() {
  const { data, isLoading, isError, refetch } = usePagos()
  const [q, setQ] = useState("")

  const rows = data ?? []
  const filtrados = useMemo(() => {
    // Sin datos de nombre/dni en PagoRead, filtramos por comprobante y fecha
    return rows.filter(r => (!q || [r.nroVoucher, r.fecha].some(f => f.toLowerCase().includes(q.toLowerCase()))))
  }, [rows, q])

  

  return (
    <div className="p-4 md:p-6 space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Gestión de Pagos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-3">
              <label className="text-sm" htmlFor="qPagos">Buscar (Comprobante o Fecha)</label>
              <Input id="qPagos" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ej. C-1001 o 2025-10-20" />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Inscripción</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isError && (
                <TableRow><TableCell colSpan={6} className="text-red-600">No se pudieron cargar pagos.</TableCell></TableRow>
              )}
              {isLoading && (
                <TableRow><TableCell colSpan={6}>Cargando…</TableCell></TableRow>
              )}
              {filtrados.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{r.id}</TableCell>
                  <TableCell>#{r.idInscripcion}</TableCell>
                  <TableCell>{r.fecha}</TableCell>
                  <TableCell>S/ {r.monto.toFixed(2)}</TableCell>
                  <TableCell className="capitalize">{r.Estado ? "aprobado" : "pendiente"}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <EditPagoSheet pago={r} onSaved={refetch} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

const pagoSchema = z.object({
  nroVoucher: z.string().min(1, "Requerido"),
  fecha: z.string().min(1, "Requerido"),
  monto: z.coerce.number().positive("Monto > 0"),
  medioPago: z.string().min(1, "Requerido"),
})

function EditPagoSheet({ pago, onSaved }: Readonly<{ pago: import("@/services/pagos").PagoRead; onSaved: () => void }>) {
  const updateMutation = useUpdatePago()
  const closeRef = useRef<HTMLButtonElement | null>(null)
  const form = useForm<import("@/services/pagos").PagoUpdate>({
    resolver: zodResolver(pagoSchema) as unknown as Resolver<import("@/services/pagos").PagoUpdate>,
    defaultValues: {
      nroVoucher: pago.nroVoucher,
      fecha: pago.fecha,
      monto: pago.monto,
      medioPago: pago.medioPago,
      idInscripcion: pago.idInscripcion,
      foto: pago.foto,
      Estado: pago.Estado,
    },
  })

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await updateMutation.mutateAsync({ id: pago.id, body: values })
      toast.success("Pago actualizado")
      onSaved()
      closeRef.current?.click()
    } catch (e) {
      const msg = e instanceof Error ? e.message : "No se pudo actualizar"
      toast.error(msg)
    }
  })

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size="sm" variant="outline">Editar</Button>
      </SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Pago {pago.id}</SheetTitle>
        </SheetHeader>
        <div className="p-4 space-y-3">
          <form onSubmit={onSubmit} className="space-y-3">
            <Field>
              <FieldLabel htmlFor={`pagoVoucher-${pago.id}`}>Comprobante</FieldLabel>
              <FieldContent>
                <Input id={`pagoVoucher-${pago.id}`} {...form.register("nroVoucher")} />
                <FieldError errors={[form.formState.errors.nroVoucher]} />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor={`pagoFecha-${pago.id}`}>Fecha</FieldLabel>
              <FieldContent>
                <Input id={`pagoFecha-${pago.id}`} type="date" {...form.register("fecha")} />
                <FieldError errors={[form.formState.errors.fecha]} />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor={`pagoMonto-${pago.id}`}>Monto</FieldLabel>
              <FieldContent>
                <Input id={`pagoMonto-${pago.id}`} type="number" step="0.01" min={0} {...form.register("monto", { valueAsNumber: true })} />
                <FieldError errors={[form.formState.errors.monto]} />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor={`pagoBanco-${pago.id}`}>Banco</FieldLabel>
              <FieldContent>
                <Input id={`pagoBanco-${pago.id}`} {...form.register("medioPago")} />
                <FieldError errors={[form.formState.errors.medioPago]} />
              </FieldContent>
            </Field>
            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={updateMutation.isPending}>{updateMutation.isPending ? "Guardando…" : "Guardar"}</Button>
              <SheetClose asChild>
                <Button type="button" variant="outline" ref={closeRef}>Cancelar</Button>
              </SheetClose>
            </div>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  )
}
