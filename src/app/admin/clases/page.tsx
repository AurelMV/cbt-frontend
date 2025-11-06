import { useMemo, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table } from "@/components/ui/table"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"
import { useClases, useCreateClase, useUpdateClase } from "@/hooks/use-clases"
import { useGrupos } from "@/hooks/use-grupos"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Field, FieldContent, FieldError, FieldLabel } from "@/components/ui/field"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

export default function Page() {
  const { data, isLoading, isError, refetch } = useClases()
  const gruposQuery = useGrupos()

  const gruposMap = useMemo(() => {
    return Object.fromEntries((gruposQuery.data ?? []).map(g => [g.id, g.nombreGrupo])) as Record<number, string>
  }, [gruposQuery.data])


  return (
    <div className="p-4 md:p-6 space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Clases</CardTitle>
          <CreateClaseSheet onCreated={refetch} />
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
                  <th className="text-left p-2">Código</th>
                  <th className="text-left p-2">Grupo</th>
                  <th className="text-left p-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && ["sk1","sk2","sk3","sk4"].map(k => (
                  <tr key={k} className="border-t">
                    <td className="p-2"><Skeleton className="h-4 w-12" /></td>
                    <td className="p-2"><Skeleton className="h-4 w-40" /></td>
                    <td className="p-2"><Skeleton className="h-4 w-40" /></td>
                    <td className="p-2"><Skeleton className="h-8 w-24" /></td>
                  </tr>
                ))}
                {isError && !isLoading && (
                  <tr><td className="p-2 text-red-600" colSpan={4}>No se pudieron cargar las clases.</td></tr>
                )}
                {data?.map((c) => (
                  <tr key={c.id} className="border-t">
                    <td className="p-2">{c.id}</td>
                    <td className="p-2">{c.codigoClase}</td>
                    <td className="p-2">{gruposMap[c.grupo_id] ?? c.grupo_id}</td>
                    <td className="p-2">
                      <EditClaseSheet clase={c} onSaved={refetch} />
                    </td>
                  </tr>
                ))}
                {data?.length === 0 && !isLoading && (
                  <tr><td className="p-2" colSpan={4}>Sin clases</td></tr>
                )}
              </tbody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

const claseSchema = z.object({
  codigoClase: z.string().min(1, "Código requerido"),
  grupo_id: z.coerce.number().int().positive("Grupo requerido"),
})

function CreateClaseSheet({ onCreated }: Readonly<{ onCreated: () => void }>) {
  const createMutation = useCreateClase()
  const grupos = useGrupos()
  const form = useForm<import("@/services/clases").ClaseCreate>({
    resolver: zodResolver(claseSchema) as any,
    defaultValues: { codigoClase: "", grupo_id: 0 },
  })
  const closeRef = useRef<HTMLButtonElement | null>(null)

  const onSubmit = form.handleSubmit(async (values) => {
    try {
  await createMutation.mutateAsync(values)
      toast.success("Clase creada")
      onCreated()
      closeRef.current?.click()
      form.reset({ codigoClase: "", grupo_id: 0 })
    } catch (e) {
      const msg = e instanceof Error ? e.message : "No se pudo crear"
      toast.error(msg)
    }
  })

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button>Nueva clase</Button>
      </SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Nueva clase</SheetTitle>
        </SheetHeader>
        <div className="p-4">
          <form onSubmit={onSubmit} className="space-y-4">
            <Field>
              <FieldLabel htmlFor="claseCodigo">Código</FieldLabel>
              <FieldContent>
                <Input id="claseCodigo" {...form.register("codigoClase")} placeholder="Ej. MAT-101" />
                <FieldError errors={[form.formState.errors.codigoClase]} />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor="claseGrupo">Grupo</FieldLabel>
              <FieldContent>
                <Select value={String(form.watch("grupo_id") || "")} onValueChange={(v) => form.setValue("grupo_id", Number(v))}>
                  <SelectTrigger id="claseGrupo" className="w-[180px]"><SelectValue placeholder={grupos.isLoading ? "Cargando…" : "Selecciona grupo"} /></SelectTrigger>
                  <SelectContent>
                    {(grupos.data ?? []).map(g => (
                      <SelectItem key={g.id} value={String(g.id)}>{g.nombreGrupo}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError errors={[form.formState.errors.grupo_id]} />
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

function EditClaseSheet({ clase, onSaved }: Readonly<{ clase: { id: number; codigoClase: string; grupo_id: number }; onSaved: () => void }>) {
  const updateMutation = useUpdateClase()
  const grupos = useGrupos()
  const form = useForm<import("@/services/clases").ClaseUpdate>({
    resolver: zodResolver(claseSchema) as any,
    defaultValues: { codigoClase: clase.codigoClase, grupo_id: clase.grupo_id },
  })
  const closeRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    form.reset({ codigoClase: clase.codigoClase, grupo_id: clase.grupo_id })
  }, [clase.id, clase.codigoClase, clase.grupo_id])

  const onSubmit = form.handleSubmit(async (values) => {
    try {
  await updateMutation.mutateAsync({ id: clase.id, body: values })
      toast.success("Clase actualizada")
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
          <SheetTitle>Editar clase</SheetTitle>
        </SheetHeader>
        <div className="p-4">
          <form onSubmit={onSubmit} className="space-y-4">
            <Field>
              <FieldLabel htmlFor={`claseCodigo-${clase.id}`}>Código</FieldLabel>
              <FieldContent>
                <Input id={`claseCodigo-${clase.id}`} {...form.register("codigoClase")} />
                <FieldError errors={[form.formState.errors.codigoClase]} />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor={`claseGrupo-${clase.id}`}>Grupo</FieldLabel>
              <FieldContent>
                <Select value={String(form.watch("grupo_id") || "")} onValueChange={(v) => form.setValue("grupo_id", Number(v))}>
                  <SelectTrigger id={`claseGrupo-${clase.id}`} className="w-[180px]"><SelectValue placeholder={grupos.isLoading ? "Cargando…" : "Selecciona grupo"} /></SelectTrigger>
                  <SelectContent>
                    {(grupos.data ?? []).map(g => (
                      <SelectItem key={g.id} value={String(g.id)}>{g.nombreGrupo}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError errors={[form.formState.errors.grupo_id]} />
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
