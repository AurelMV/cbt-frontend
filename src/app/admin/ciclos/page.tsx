import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"
import { useCiclos, useCreateCiclo, useUpdateCiclo } from "@/hooks/use-ciclos"
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Field, FieldContent, FieldError, FieldLabel } from "@/components/ui/field"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useRef, useState } from "react"
import { FileDown } from "lucide-react"
import { ExportDialog } from "@/components/admin/export-dialog"

export default function Page() {
  const { data, isLoading, isError, refetch } = useCiclos()
  const [exportId, setExportId] = useState<number | null>(null)

  return (
    <div className="p-4 md:p-6 space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Ciclos</CardTitle>
          <CreateCicloSheet onCreated={refetch} />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>Actualizar</Button>
          </div>

          {/* Tabla */}
          <div className="overflow-auto">
            <Table>
              <thead>
                <tr>
                  <th className="text-left p-2">ID</th>
                  <th className="text-left p-2">Nombre</th>
                  <th className="text-left p-2">Inicio</th>
                  <th className="text-left p-2">Fin</th>
                  <th className="text-left p-2">Estado</th>
                  <th className="text-left p-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && ["sk1","sk2","sk3","sk4"].map(k => (
                  <tr key={k} className="border-t">
                    <td className="p-2"><Skeleton className="h-4 w-12" /></td>
                    <td className="p-2"><Skeleton className="h-4 w-40" /></td>
                    <td className="p-2"><Skeleton className="h-4 w-28" /></td>
                    <td className="p-2"><Skeleton className="h-4 w-28" /></td>
                    <td className="p-2"><Skeleton className="h-6 w-16" /></td>
                    <td className="p-2"><Skeleton className="h-8 w-24" /></td>
                  </tr>
                ))}
                {isError && !isLoading && (
                  <tr><td className="p-2 text-red-600" colSpan={6}>No se pudieron cargar los ciclos.</td></tr>
                )}
                {data?.map((c) => (
                  <tr key={c.id} className="border-t">
                    <td className="p-2">{c.id}</td>
                    <td className="p-2">{c.nombreCiclo}</td>
                    <td className="p-2">{c.fechaInicio}</td>
                    <td className="p-2">{c.fechaFin}</td>
                    <td className="p-2">{c.estado ? "Activo" : "Inactivo"}</td>
                    <td className="p-2 flex gap-2">
                      <EditCicloSheet ciclo={c} onSaved={refetch} />
                      <Button variant="ghost" size="icon" onClick={() => setExportId(c.id)} title="Exportar Reporte">
                        <FileDown className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {data?.length === 0 && !isLoading && (
                  <tr><td className="p-2" colSpan={6}>Sin ciclos</td></tr>
                )}
              </tbody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      <ExportDialog 
        open={!!exportId} 
        onOpenChange={(open) => !open && setExportId(null)}
        entityType="ciclo"
        entityId={exportId}
        title="Exportar Reporte de Ciclo"
      />
    </div>
  )
}

const cicloSchema = z
  .object({
    nombreCiclo: z.string().min(1, "Nombre requerido"),
    fechaInicio: z.string().min(1, "Inicio requerido"),
    fechaFin: z.string().min(1, "Fin requerido"),
    estado: z.boolean(),
  })
  .refine(
    (v) => {
      const ini = new Date(v.fechaInicio)
      const fin = new Date(v.fechaFin)
  return !Number.isNaN(ini.getTime()) && !Number.isNaN(fin.getTime()) && fin >= ini
    },
    { message: "Fin debe ser posterior o igual al inicio", path: ["fechaFin"] }
  )

function CreateCicloSheet({ onCreated }: Readonly<{ onCreated: () => void }>) {
  const createMutation = useCreateCiclo()
  const form = useForm<z.infer<typeof cicloSchema>>({
    resolver: zodResolver(cicloSchema),
    defaultValues: { nombreCiclo: "", fechaInicio: "", fechaFin: "", estado: true },
  })
  const closeRef = useRef<HTMLButtonElement | null>(null)

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await createMutation.mutateAsync(values)
      toast.success("Ciclo creado")
      onCreated()
      closeRef.current?.click()
      form.reset({ nombreCiclo: "", fechaInicio: "", fechaFin: "", estado: true })
    } catch (e) {
      const msg = e instanceof Error ? e.message : "No se pudo crear"
      toast.error(msg)
    }
  })

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button>Nuevo ciclo</Button>
      </SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Nuevo ciclo</SheetTitle>
        </SheetHeader>
        <div className="p-4">
          <form onSubmit={onSubmit} className="space-y-4">
            <Field>
              <FieldLabel htmlFor="cicloNombre">Nombre</FieldLabel>
              <FieldContent>
                <Input id="cicloNombre" {...form.register("nombreCiclo")} placeholder="Ej. 2025-2" />
                <FieldError errors={[form.formState.errors.nombreCiclo]} />
              </FieldContent>
            </Field>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="cicloInicio">Inicio</FieldLabel>
                <FieldContent>
                  <Input id="cicloInicio" type="date" {...form.register("fechaInicio")} />
                  <FieldError errors={[form.formState.errors.fechaInicio]} />
                </FieldContent>
              </Field>
              <Field>
                <FieldLabel htmlFor="cicloFin">Fin</FieldLabel>
                <FieldContent>
                  <Input id="cicloFin" type="date" {...form.register("fechaFin")} />
                  <FieldError errors={[form.formState.errors.fechaFin]} />
                </FieldContent>
              </Field>
            </div>
            <Field>
              <FieldLabel htmlFor="cicloEstado">Activo</FieldLabel>
              <FieldContent>
                <Checkbox id="cicloEstado" checked={form.watch("estado")} onCheckedChange={(v) => form.setValue("estado", Boolean(v))} />
                <FieldError errors={[form.formState.errors.estado]} />
              </FieldContent>
            </Field>
            <div className="flex gap-2">
              <Button type="submit" disabled={createMutation.isPending}>{createMutation.isPending ? "Creando…" : "Crear"}</Button>
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

function EditCicloSheet({ ciclo, onSaved }: Readonly<{ ciclo: { id: number; nombreCiclo: string; fechaInicio: string; fechaFin: string; estado: boolean }; onSaved: () => void }>) {
  const updateMutation = useUpdateCiclo()
  const form = useForm<z.infer<typeof cicloSchema>>({
    resolver: zodResolver(cicloSchema),
    defaultValues: { nombreCiclo: ciclo.nombreCiclo, fechaInicio: ciclo.fechaInicio, fechaFin: ciclo.fechaFin, estado: ciclo.estado },
  })
  const closeRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    form.reset({ nombreCiclo: ciclo.nombreCiclo, fechaInicio: ciclo.fechaInicio, fechaFin: ciclo.fechaFin, estado: ciclo.estado })
  }, [ciclo.id, ciclo.nombreCiclo, ciclo.fechaInicio, ciclo.fechaFin, ciclo.estado])

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await updateMutation.mutateAsync({ id: ciclo.id, body: values })
      toast.success("Ciclo actualizado")
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
          <SheetTitle>Editar ciclo</SheetTitle>
        </SheetHeader>
        <div className="p-4">
          <form onSubmit={onSubmit} className="space-y-4">
            <Field>
              <FieldLabel htmlFor={`cicloNombre-${ciclo.id}`}>Nombre</FieldLabel>
              <FieldContent>
                <Input id={`cicloNombre-${ciclo.id}`} {...form.register("nombreCiclo")} />
                <FieldError errors={[form.formState.errors.nombreCiclo]} />
              </FieldContent>
            </Field>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor={`cicloInicio-${ciclo.id}`}>Inicio</FieldLabel>
                <FieldContent>
                  <Input id={`cicloInicio-${ciclo.id}`} type="date" {...form.register("fechaInicio")} />
                  <FieldError errors={[form.formState.errors.fechaInicio]} />
                </FieldContent>
              </Field>
              <Field>
                <FieldLabel htmlFor={`cicloFin-${ciclo.id}`}>Fin</FieldLabel>
                <FieldContent>
                  <Input id={`cicloFin-${ciclo.id}`} type="date" {...form.register("fechaFin")} />
                  <FieldError errors={[form.formState.errors.fechaFin]} />
                </FieldContent>
              </Field>
            </div>
            <Field>
              <FieldLabel htmlFor={`cicloEstado-${ciclo.id}`}>Activo</FieldLabel>
              <FieldContent>
                <Checkbox id={`cicloEstado-${ciclo.id}`} checked={form.watch("estado")} onCheckedChange={(v) => form.setValue("estado", Boolean(v))} />
                <FieldError errors={[form.formState.errors.estado]} />
              </FieldContent>
            </Field>
            <div className="flex gap-2">
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
