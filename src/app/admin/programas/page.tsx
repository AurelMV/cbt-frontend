 import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table } from "@/components/ui/table"
import { toast } from "sonner"
import { useCreatePrograma, useProgramas, useUpdatePrograma } from "@/hooks/use-programas"
import { Skeleton } from "@/components/ui/skeleton"
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Field, FieldContent, FieldError, FieldLabel } from "@/components/ui/field"
import { useRef, useEffect } from "react"

export default function Page() {
  const { data, isLoading, isError, refetch } = useProgramas()

  return (
    <div className="p-4 md:p-6 space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Programas</CardTitle>
          <CreateProgramaSheet onCreated={refetch} />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>Actualizar</Button>
          </div>
          <div className="overflow-auto">
            <Table>
              <thead>
                <tr>
                  <th className="text-left p-2">ID</th>
                  <th className="text-left p-2">Nombre</th>
                  <th className="text-left p-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && (
                  ["sk1", "sk2", "sk3", "sk4"].map((k) => (
                    <tr key={k} className="border-t">
                      <td className="p-2"><Skeleton className="h-4 w-16" /></td>
                      <td className="p-2"><Skeleton className="h-4 w-48" /></td>
                      <td className="p-2"><Skeleton className="h-8 w-24" /></td>
                    </tr>
                  ))
                )}
                {isError && !isLoading && (
                  <tr><td className="p-2 text-red-600" colSpan={3}>No se pudieron cargar los programas.</td></tr>
                )}
                {data?.map((p) => (
                  <tr key={p.id} className="border-t">
                    <td className="p-2">{p.id}</td>
                    <td className="p-2">{p.nombrePrograma}</td>
                    <td className="p-2">
                      <EditProgramaSheet programa={p} onSaved={refetch} />
                    </td>
                  </tr>
                ))}
                {data?.length === 0 && !isLoading && (
                  <tr><td className="p-2" colSpan={3}>Sin programas</td></tr>
                )}
              </tbody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

const programaSchema = z.object({ nombrePrograma: z.string().min(1, "Nombre requerido") })

function CreateProgramaSheet({ onCreated }: Readonly<{ onCreated: () => void }>) {
  const createMutation = useCreatePrograma()
  const form = useForm<{ nombrePrograma: string }>({
    resolver: zodResolver(programaSchema),
    defaultValues: { nombrePrograma: "" },
  })
  const closeRef = useRef<HTMLButtonElement | null>(null)

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await createMutation.mutateAsync({ nombrePrograma: values.nombrePrograma.trim() })
      toast.success("Programa creado")
      onCreated()
      closeRef.current?.click()
      form.reset({ nombrePrograma: "" })
    } catch (e) {
      const msg = e instanceof Error ? e.message : "No se pudo crear"
      toast.error(msg)
    }
  })

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button>Nuevo programa</Button>
      </SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Nuevo programa</SheetTitle>
        </SheetHeader>
        <div className="p-4">
          <form onSubmit={onSubmit} className="space-y-4">
            <Field>
              <FieldLabel htmlFor="progNombre">Nombre</FieldLabel>
              <FieldContent>
                <Input id="progNombre" {...form.register("nombrePrograma")} />
                <FieldError errors={[form.formState.errors.nombrePrograma]} />
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

function EditProgramaSheet({ programa, onSaved }: Readonly<{ programa: { id: number; nombrePrograma: string }; onSaved: () => void }>) {
  const updateMutation = useUpdatePrograma()
  const form = useForm<{ nombrePrograma: string }>({
    resolver: zodResolver(programaSchema),
    defaultValues: { nombrePrograma: programa.nombrePrograma },
  })
  const closeRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    form.reset({ nombrePrograma: programa.nombrePrograma })
  }, [programa.id, programa.nombrePrograma])

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await updateMutation.mutateAsync({ id: programa.id, body: { nombrePrograma: values.nombrePrograma.trim() } })
      toast.success("Programa actualizado")
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
          <SheetTitle>Editar programa</SheetTitle>
        </SheetHeader>
        <div className="p-4">
          <form onSubmit={onSubmit} className="space-y-4">
            <Field>
              <FieldLabel htmlFor={`progNombreEdit-${programa.id}`}>Nombre</FieldLabel>
              <FieldContent>
                <Input id={`progNombreEdit-${programa.id}`} {...form.register("nombrePrograma")} />
                <FieldError errors={[form.formState.errors.nombrePrograma]} />
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
