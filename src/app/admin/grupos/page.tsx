import { useMemo, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"
import { useGrupos, useCreateGrupo, useUpdateGrupo } from "@/hooks/use-grupos"
import { useCiclos } from "@/hooks/use-ciclos"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Field, FieldContent, FieldError, FieldLabel } from "@/components/ui/field"
import { useForm, type Resolver } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
 

export default function Page() {
  const { data, isLoading, isError, refetch } = useGrupos()
  const ciclosQuery = useCiclos()

  const ciclosMap = useMemo(() => {
    return Object.fromEntries((ciclosQuery.data ?? []).map(c => [c.id, c.nombreCiclo])) as Record<number, string>
  }, [ciclosQuery.data])

  return (
    <div className="p-4 md:p-6 space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Grupos</CardTitle>
          <CreateGrupoSheet onCreated={refetch} />
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
                  <th className="text-left p-2">Aforo</th>
                  <th className="text-left p-2">Estado</th>
                  <th className="text-left p-2">Ciclo</th>
                  <th className="text-left p-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && ["sk1","sk2","sk3","sk4"].map(k => (
                  <tr key={k} className="border-t">
                    <td className="p-2"><Skeleton className="h-4 w-12" /></td>
                    <td className="p-2"><Skeleton className="h-4 w-40" /></td>
                    <td className="p-2"><Skeleton className="h-4 w-16" /></td>
                    <td className="p-2"><Skeleton className="h-6 w-16" /></td>
                    <td className="p-2"><Skeleton className="h-4 w-40" /></td>
                    <td className="p-2"><Skeleton className="h-8 w-24" /></td>
                  </tr>
                ))}
                {isError && !isLoading && (
                  <tr><td className="p-2 text-red-600" colSpan={6}>No se pudieron cargar los grupos.</td></tr>
                )}
                {data?.map((g) => (
                  <tr key={g.id} className="border-t">
                    <td className="p-2">{g.id}</td>
                    <td className="p-2">{g.nombreGrupo}</td>
                    <td className="p-2">{g.aforo}</td>
                    <td className="p-2">{g.estado ? "Activo" : "Inactivo"}</td>
                    <td className="p-2">{ciclosMap[g.ciclo_id] ?? g.ciclo_id}</td>
                    <td className="p-2">
                      <EditGrupoSheet grupo={g} onSaved={refetch} />
                    </td>
                  </tr>
                ))}
                {data?.length === 0 && !isLoading && (
                  <tr><td className="p-2" colSpan={6}>Sin grupos</td></tr>
                )}
              </tbody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

const grupoSchema = z.object({
  nombreGrupo: z.string().min(1, "Nombre requerido"),
  aforo: z.coerce.number().int().positive("Aforo debe ser > 0"),
  estado: z.boolean(),
  ciclo_id: z.coerce.number().int().positive("Ciclo requerido"),
})

function CreateGrupoSheet({ onCreated }: Readonly<{ onCreated: () => void }>) {
  const createMutation = useCreateGrupo()
  const ciclos = useCiclos()
  const form = useForm<import("@/services/grupos").GrupoUpdate>({
    // Casting resolver to any to accommodate z.coerce with RHF types
    resolver: zodResolver(grupoSchema) as Resolver<import("@/services/grupos").GrupoUpdate>,
    defaultValues: { nombreGrupo: "", aforo: 0, estado: true, ciclo_id: 0 },
  })
  const closeRef = useRef<HTMLButtonElement | null>(null)

  const onSubmit = form.handleSubmit(async (values) => {
    try {
  await createMutation.mutateAsync(values as unknown as import("@/services/grupos").GrupoCreate)
      toast.success("Grupo creado")
      onCreated()
      closeRef.current?.click()
      form.reset({ nombreGrupo: "", aforo: 0, estado: true, ciclo_id: 0 })
    } catch (e) {
      const msg = e instanceof Error ? e.message : "No se pudo crear"
      toast.error(msg)
    }
  })

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button>Nuevo grupo</Button>
      </SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Nuevo grupo</SheetTitle>
        </SheetHeader>
        <div className="p-4">
          <form onSubmit={onSubmit} className="space-y-4">
            <Field>
              <FieldLabel htmlFor="grupoNombre">Nombre</FieldLabel>
              <FieldContent>
                <Input id="grupoNombre" {...form.register("nombreGrupo")} placeholder="Ej. G1 - Tarde" />
                <FieldError errors={[form.formState.errors.nombreGrupo]} />
              </FieldContent>
            </Field>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="grupoAforo">Aforo</FieldLabel>
                <FieldContent>
                  <Input id="grupoAforo" type="number" {...form.register("aforo", { valueAsNumber: true })} />
                  <FieldError errors={[form.formState.errors.aforo]} />
                </FieldContent>
              </Field>
              <Field>
                <FieldLabel htmlFor="grupoCiclo">Ciclo</FieldLabel>
                <FieldContent>
                  <Select value={String(form.watch("ciclo_id") || "")} onValueChange={(v) => form.setValue("ciclo_id", Number(v))}>
                    <SelectTrigger id="grupoCiclo" className="w-[180px]"><SelectValue placeholder={ciclos.isLoading ? "Cargando…" : "Selecciona ciclo"} /></SelectTrigger>
                    <SelectContent>
                      {(ciclos.data ?? []).map(c => (
                        <SelectItem key={c.id} value={String(c.id)}>{c.nombreCiclo}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError errors={[form.formState.errors.ciclo_id]} />
                </FieldContent>
              </Field>
            </div>
            <Field>
              <FieldLabel htmlFor="grupoEstado">Activo</FieldLabel>
              <FieldContent>
                <Checkbox id="grupoEstado" checked={form.watch("estado")} onCheckedChange={(v) => form.setValue("estado", Boolean(v))} />
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

function EditGrupoSheet({ grupo, onSaved }: Readonly<{ grupo: { id: number; nombreGrupo: string; aforo: number; estado: boolean; ciclo_id: number }; onSaved: () => void }>) {
  const updateMutation = useUpdateGrupo()
  const ciclos = useCiclos()
  const form = useForm<import("@/services/grupos").GrupoUpdate>({
    resolver: zodResolver(grupoSchema) as Resolver<import("@/services/grupos").GrupoUpdate>,
    defaultValues: { nombreGrupo: grupo.nombreGrupo, aforo: grupo.aforo, estado: grupo.estado, ciclo_id: grupo.ciclo_id },
  })
  const closeRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    form.reset({ nombreGrupo: grupo.nombreGrupo, aforo: grupo.aforo, estado: grupo.estado, ciclo_id: grupo.ciclo_id })
  }, [grupo.id, grupo.nombreGrupo, grupo.aforo, grupo.estado, grupo.ciclo_id])

  const onSubmit = form.handleSubmit(async (values) => {
    try {
  await updateMutation.mutateAsync({ id: grupo.id, body: values })
      toast.success("Grupo actualizado")
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
          <SheetTitle>Editar grupo</SheetTitle>
        </SheetHeader>
        <div className="p-4">
          <form onSubmit={onSubmit} className="space-y-4">
            <Field>
              <FieldLabel htmlFor={`grupoNombre-${grupo.id}`}>Nombre</FieldLabel>
              <FieldContent>
                <Input id={`grupoNombre-${grupo.id}`} {...form.register("nombreGrupo")} />
                <FieldError errors={[form.formState.errors.nombreGrupo]} />
              </FieldContent>
            </Field>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor={`grupoAforo-${grupo.id}`}>Aforo</FieldLabel>
                <FieldContent>
                  <Input id={`grupoAforo-${grupo.id}`} type="number" {...form.register("aforo", { valueAsNumber: true })} />
                  <FieldError errors={[form.formState.errors.aforo]} />
                </FieldContent>
              </Field>
              <Field>
                <FieldLabel htmlFor={`grupoCiclo-${grupo.id}`}>Ciclo</FieldLabel>
                <FieldContent>
                  <Select value={String(form.watch("ciclo_id") || "")} onValueChange={(v) => form.setValue("ciclo_id", Number(v))}>
                    <SelectTrigger id={`grupoCiclo-${grupo.id}`} className="w-[180px]"><SelectValue placeholder={ciclos.isLoading ? "Cargando…" : "Selecciona ciclo"} /></SelectTrigger>
                    <SelectContent>
                      {(ciclos.data ?? []).map(c => (
                        <SelectItem key={c.id} value={String(c.id)}>{c.nombreCiclo}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError errors={[form.formState.errors.ciclo_id]} />
                </FieldContent>
              </Field>
            </div>
            <Field>
              <FieldLabel htmlFor={`grupoEstado-${grupo.id}`}>Activo</FieldLabel>
              <FieldContent>
                <Checkbox id={`grupoEstado-${grupo.id}`} checked={form.watch("estado")} onCheckedChange={(v) => form.setValue("estado", Boolean(v))} />
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
