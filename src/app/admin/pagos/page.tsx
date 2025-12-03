import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { usePagos, useUpdatePago } from "@/hooks/use-pagos";
import type { PagoListItem, PagoRead } from "@/services/pagos";
import { useForm, type Resolver } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCiclos } from "@/hooks/use-ciclos";
// Bandeja ahora vive en el sidebar; no se muestra aquí

export default function Page() {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [ciclo, setCiclo] = useState("");
  const [estado, setEstado] = useState("todos");
  const [tipoPago, setTipoPago] = useState("");
  const limit = 10;
  const ciclosQ = useCiclos();
  const estadoParam = estado === "todos" ? undefined : estado === "aprobado";
  const { data, isLoading, isError, refetch } = usePagos({
    page: Math.max(0, page - 1),
    limit,
    q,
    idCiclo: ciclo ? Number(ciclo) : undefined,
    estado: estadoParam,
    tipoPago: tipoPago || undefined,
  });
  const rows = useMemo<PagoListItem[]>(() => data?.items ?? [], [data]);
  const total = data?.total ?? 0;
  const pages = data?.pages ?? 1;

  useEffect(() => {
    setPage(1);
  }, [ciclo, estado, tipoPago]);

  const tipoOptions = useMemo(() => {
    const set = new Set<string>();
    for (const item of data?.items ?? []) {
      const value = item.tipoPago ?? "";
      if (value) set.add(value);
    }
    if (tipoPago && !set.has(tipoPago)) {
      set.add(tipoPago);
    }
    return Array.from(set).sort();
  }, [data, tipoPago]);

  const enriched = useMemo(() => {
    return rows.map((pago) => {
      const codigoPago = pago.nroVoucher || `PAGO-${pago.id}`;
      const nombreEst = pago.nombreAlumno || `Alumno #${pago.idInscripcion}`;
      const apellidos =
        [pago.aPaterno, pago.aMaterno].filter(Boolean).join(" ") || "—";
      const cicloNombre = pago.nombreCiclo || "—";
      const tipoPago = pago.tipoPago || pago.medioPago || "—";
      return {
        ...pago,
        codigoPago,
        nombreEst,
        apellidos,
        cicloNombre,
        tipoPago,
      };
    });
  }, [rows]);

  const filtrados = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return enriched;
    return enriched.filter((r) =>
      [r.codigoPago, r.nombreEst, r.apellidos, r.fecha].some((value) =>
        value.toLowerCase().includes(term)
      )
    );
  }, [enriched, q]);

  return (
    <div className="p-4 md:p-6 space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Gestión de Pagos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <div>
              <label className="text-sm" htmlFor="cicloPagos">
                Ciclo
              </label>
              <Select
                value={ciclo || "all"}
                onValueChange={(v) => setCiclo(v === "all" ? "" : v)}
              >
                <SelectTrigger id="cicloPagos">
                  <SelectValue
                    placeholder={ciclosQ.isLoading ? "Cargando…" : "Todos"}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {(ciclosQ.data ?? []).map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.nombreCiclo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm" htmlFor="estadoPagos">
                Estado
              </label>
              <Select value={estado} onValueChange={setEstado}>
                <SelectTrigger id="estadoPagos">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="aprobado">Aprobado</SelectItem>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm" htmlFor="tipoPagos">
                Tipo de pago
              </label>
              <Select
                value={tipoPago || "all"}
                onValueChange={(v) => setTipoPago(v === "all" ? "" : v)}
              >
                <SelectTrigger id="tipoPagos">
                  <SelectValue
                    placeholder={tipoOptions.length ? "Todos" : "Sin datos"}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {tipoOptions.map((tipo) => (
                    <SelectItem key={tipo} value={tipo} className="capitalize">
                      {tipo.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <label className="text-sm" htmlFor="qPagos">
                Buscar (Comprobante o Fecha)
              </label>
              <Input
                id="qPagos"
                value={q}
                onChange={(e) => {
                  setPage(1);
                  setQ(e.target.value);
                }}
                placeholder="Ej. C-1001 o 2025-10-20"
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código Pago</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Apellidos</TableHead>
                <TableHead>Fecha Pago</TableHead>
                <TableHead>Tipo Pago</TableHead>
                <TableHead>Ciclo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isError && (
                <TableRow>
                  <TableCell colSpan={9} className="text-red-600">
                    No se pudieron cargar pagos.
                  </TableCell>
                </TableRow>
              )}
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={9}>Cargando…</TableCell>
                </TableRow>
              )}
              {!isLoading && !isError && filtrados.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9}>Sin resultados</TableCell>
                </TableRow>
              )}
              {filtrados.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{r.codigoPago}</TableCell>
                  <TableCell>S/ {r.monto.toFixed(2)}</TableCell>
                  <TableCell>{r.nombreEst}</TableCell>
                  <TableCell>{r.apellidos}</TableCell>
                  <TableCell>{r.fecha}</TableCell>
                  <TableCell className="capitalize">{r.tipoPago}</TableCell>
                  <TableCell>{r.cicloNombre}</TableCell>
                  <TableCell className="capitalize">
                    {r.Estado ? "aprobado" : "pendiente"}
                  </TableCell>
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
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div>
          {total > 0
            ? `Mostrando ${(page - 1) * limit + 1}-${Math.min(
                page * limit,
                total
              )} de ${total}`
            : "Sin registros"}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Anterior
          </Button>
          <div>
            {page} / {pages || 1}
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= pages}
            onClick={() => setPage((p) => Math.min(pages || 1, p + 1))}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  );
}

const pagoSchema = z.object({
  nroVoucher: z.string().min(1, "Requerido"),
  fecha: z.string().min(1, "Requerido"),
  monto: z.coerce.number().positive("Monto > 0"),
  medioPago: z.string().min(1, "Requerido"),
});

function EditPagoSheet({
  pago,
  onSaved,
}: Readonly<{ pago: PagoRead; onSaved: () => void }>) {
  const updateMutation = useUpdatePago();
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const form = useForm<import("@/services/pagos").PagoUpdate>({
    resolver: zodResolver(pagoSchema) as unknown as Resolver<
      import("@/services/pagos").PagoUpdate
    >,
    defaultValues: {
      nroVoucher: pago.nroVoucher,
      fecha: pago.fecha,
      monto: pago.monto,
      medioPago: pago.medioPago,
      idInscripcion: pago.idInscripcion,
      foto: pago.foto,
      Estado: pago.Estado,
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await updateMutation.mutateAsync({ id: pago.id, body: values });
      toast.success("Pago actualizado");
      onSaved();
      closeRef.current?.click();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "No se pudo actualizar";
      toast.error(msg);
    }
  });

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size="sm" variant="outline">
          Editar
        </Button>
      </SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Pago {pago.id}</SheetTitle>
        </SheetHeader>
        <div className="p-4 space-y-3">
          <form onSubmit={onSubmit} className="space-y-3">
            <Field>
              <FieldLabel htmlFor={`pagoVoucher-${pago.id}`}>
                Comprobante
              </FieldLabel>
              <FieldContent>
                <Input
                  id={`pagoVoucher-${pago.id}`}
                  {...form.register("nroVoucher")}
                />
                <FieldError errors={[form.formState.errors.nroVoucher]} />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor={`pagoFecha-${pago.id}`}>Fecha</FieldLabel>
              <FieldContent>
                <Input
                  id={`pagoFecha-${pago.id}`}
                  type="date"
                  {...form.register("fecha")}
                />
                <FieldError errors={[form.formState.errors.fecha]} />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor={`pagoMonto-${pago.id}`}>Monto</FieldLabel>
              <FieldContent>
                <Input
                  id={`pagoMonto-${pago.id}`}
                  type="number"
                  step="0.01"
                  min={0}
                  {...form.register("monto", { valueAsNumber: true })}
                />
                <FieldError errors={[form.formState.errors.monto]} />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor={`pagoBanco-${pago.id}`}>Banco</FieldLabel>
              <FieldContent>
                <Input
                  id={`pagoBanco-${pago.id}`}
                  {...form.register("medioPago")}
                />
                <FieldError errors={[form.formState.errors.medioPago]} />
              </FieldContent>
            </Field>
            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Guardando…" : "Guardar"}
              </Button>
              <SheetClose asChild>
                <Button type="button" variant="outline" ref={closeRef}>
                  Cancelar
                </Button>
              </SheetClose>
            </div>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
