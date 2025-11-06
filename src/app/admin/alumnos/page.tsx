import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table } from "@/components/ui/table"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"
import { useAlumnos, useUpdateAlumno } from "@/hooks/use-alumnos"
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Field, FieldContent, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useForm, type Resolver } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useRef } from "react"

export default function Page() {
  const { data, isLoading, isError, refetch } = useAlumnos()
  

  return (
    <div className="p-4 md:p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Alumnos</CardTitle>
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
                  <th className="text-left p-2">DNI</th>
                  <th className="text-left p-2">Email</th>
                  <th className="text-left p-2">Colegio</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && ["sk1","sk2","sk3","sk4"].map(k => (
                  <tr key={k} className="border-t">
                    <td className="p-2"><Skeleton className="h-4 w-12" /></td>
                    <td className="p-2"><Skeleton className="h-4 w-40" /></td>
                    <td className="p-2"><Skeleton className="h-4 w-28" /></td>
                    <td className="p-2"><Skeleton className="h-4 w-40" /></td>
                    <td className="p-2"><Skeleton className="h-4 w-16" /></td>
                  </tr>
                ))}
                {isError && !isLoading && (
                  <tr><td className="p-2 text-red-600" colSpan={5}>No se pudieron cargar los alumnos.</td></tr>
                )}
                {data?.map((a) => (
                  <tr key={a.id} className="border-t">
                    <td className="p-2">{a.id}</td>
                    <td className="p-2">{a.nombreAlumno} {a.aPaterno} {a.aMaterno}</td>
                    <td className="p-2">{a.nroDocumento}</td>
                    <td className="p-2">{a.email}</td>
                    <td className="p-2">{a.idColegio}</td>
                    <td className="p-2"><EditAlumnoSheet alumno={a} onSaved={refetch} /></td>
                  </tr>
                ))}
                {data?.length === 0 && !isLoading && (
                  <tr><td className="p-2" colSpan={6}>Sin alumnos</td></tr>
                )}
              </tbody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

const alumnoSchema = z.object({
  nombreAlumno: z.string().min(1, "Requerido"),
  aPaterno: z.string().min(1, "Requerido"),
  aMaterno: z.string().min(1, "Requerido"),
  sexo: z.enum(["M", "F"], { message: "Solo M o F" }),
  telefonoEstudiante: z.string().min(1, "Requerido"),
  telefonoApoderado: z.string().min(1, "Requerido"),
  fechaNacimiento: z.string().min(1, "Requerido"),
  email: z
    .string()
    .min(1, "Requerido")
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Email inválido"),
  anoCulminado: z.coerce.number().int().min(1900).max(2100),
  Direccion: z.string().min(1, "Requerido"),
  nroDocumento: z.string().min(1, "Requerido"),
  idColegio: z.coerce.number().int().positive(),
})

function EditAlumnoSheet({ alumno, onSaved }: Readonly<{ alumno: import("@/services/alumnos").AlumnoRead; onSaved: () => void }>) {
  const updateMutation = useUpdateAlumno()
  const form = useForm<import("@/services/alumnos").AlumnoUpdate>({
    resolver: zodResolver(alumnoSchema) as Resolver<import("@/services/alumnos").AlumnoUpdate>,
    defaultValues: {
      nombreAlumno: alumno.nombreAlumno,
      aPaterno: alumno.aPaterno,
      aMaterno: alumno.aMaterno,
      sexo: alumno.sexo,
      telefonoEstudiante: alumno.telefonoEstudiante,
      telefonoApoderado: alumno.telefonoApoderado,
      fechaNacimiento: alumno.fechaNacimiento,
      email: alumno.email,
      anoCulminado: alumno.anoCulminado,
      Direccion: alumno.Direccion,
      nroDocumento: alumno.nroDocumento,
      idColegio: alumno.idColegio,
    },
  })
  const closeRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    form.reset({
      nombreAlumno: alumno.nombreAlumno,
      aPaterno: alumno.aPaterno,
      aMaterno: alumno.aMaterno,
      sexo: alumno.sexo,
      telefonoEstudiante: alumno.telefonoEstudiante,
      telefonoApoderado: alumno.telefonoApoderado,
      fechaNacimiento: alumno.fechaNacimiento,
      email: alumno.email,
      anoCulminado: alumno.anoCulminado,
      Direccion: alumno.Direccion,
      nroDocumento: alumno.nroDocumento,
      idColegio: alumno.idColegio,
    })
  }, [alumno.id])

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await updateMutation.mutateAsync({ id: alumno.id, body: values })
      toast.success("Alumno actualizado")
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
          <SheetTitle>Editar alumno</SheetTitle>
        </SheetHeader>
        <div className="p-4">
          <form onSubmit={onSubmit} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field>
                <FieldLabel htmlFor={`al-nombre-${alumno.id}`}>Nombres</FieldLabel>
                <FieldContent>
                  <Input id={`al-nombre-${alumno.id}`} {...form.register("nombreAlumno")} />
                  <FieldError errors={[form.formState.errors.nombreAlumno]} />
                </FieldContent>
              </Field>
              <Field>
                <FieldLabel htmlFor={`al-paterno-${alumno.id}`}>A. paterno</FieldLabel>
                <FieldContent>
                  <Input id={`al-paterno-${alumno.id}`} {...form.register("aPaterno")} />
                  <FieldError errors={[form.formState.errors.aPaterno]} />
                </FieldContent>
              </Field>
              <Field>
                <FieldLabel htmlFor={`al-materno-${alumno.id}`}>A. materno</FieldLabel>
                <FieldContent>
                  <Input id={`al-materno-${alumno.id}`} {...form.register("aMaterno")} />
                  <FieldError errors={[form.formState.errors.aMaterno]} />
                </FieldContent>
              </Field>
              <Field>
                <FieldLabel htmlFor={`al-sexo-${alumno.id}`}>Sexo</FieldLabel>
                <FieldContent>
                  <Select value={form.watch("sexo")} onValueChange={(v) => form.setValue("sexo", v as "M" | "F")}> 
                    <SelectTrigger id={`al-sexo-${alumno.id}`} className="w-[180px]"><SelectValue placeholder="Sexo" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M">Masculino</SelectItem>
                      <SelectItem value="F">Femenino</SelectItem>
                    </SelectContent>
                  </Select>
                  <FieldError errors={[form.formState.errors.sexo]} />
                </FieldContent>
              </Field>
              <Field>
                <FieldLabel htmlFor={`al-fecha-${alumno.id}`}>Fecha nac.</FieldLabel>
                <FieldContent>
                  <Input id={`al-fecha-${alumno.id}`} type="date" {...form.register("fechaNacimiento")} />
                  <FieldError errors={[form.formState.errors.fechaNacimiento]} />
                </FieldContent>
              </Field>
              <Field>
                <FieldLabel htmlFor={`al-email-${alumno.id}`}>Email</FieldLabel>
                <FieldContent>
                  <Input id={`al-email-${alumno.id}`} type="email" {...form.register("email")} />
                  <FieldError errors={[form.formState.errors.email]} />
                </FieldContent>
              </Field>
              <Field>
                <FieldLabel htmlFor={`al-ano-${alumno.id}`}>Año fin</FieldLabel>
                <FieldContent>
                  <Input id={`al-ano-${alumno.id}`} type="number" {...form.register("anoCulminado", { valueAsNumber: true })} />
                  <FieldError errors={[form.formState.errors.anoCulminado]} />
                </FieldContent>
              </Field>
              <Field>
                <FieldLabel htmlFor={`al-dir-${alumno.id}`}>Dirección</FieldLabel>
                <FieldContent>
                  <Input id={`al-dir-${alumno.id}`} {...form.register("Direccion")} />
                  <FieldError errors={[form.formState.errors.Direccion]} />
                </FieldContent>
              </Field>
              <Field>
                <FieldLabel htmlFor={`al-dni-${alumno.id}`}>DNI</FieldLabel>
                <FieldContent>
                  <Input id={`al-dni-${alumno.id}`} {...form.register("nroDocumento")} />
                  <FieldError errors={[form.formState.errors.nroDocumento]} />
                </FieldContent>
              </Field>
              <Field>
                <FieldLabel htmlFor={`al-col-${alumno.id}`}>Colegio</FieldLabel>
                <FieldContent>
                  <Input id={`al-col-${alumno.id}`} type="number" {...form.register("idColegio", { valueAsNumber: true })} />
                  <FieldError errors={[form.formState.errors.idColegio]} />
                </FieldContent>
              </Field>
              <Field>
                <FieldLabel htmlFor={`al-telE-${alumno.id}`}>Tel. Estudiante</FieldLabel>
                <FieldContent>
                  <Input id={`al-telE-${alumno.id}`} {...form.register("telefonoEstudiante")} />
                  <FieldError errors={[form.formState.errors.telefonoEstudiante]} />
                </FieldContent>
              </Field>
              <Field>
                <FieldLabel htmlFor={`al-telA-${alumno.id}`}>Tel. Apoderado</FieldLabel>
                <FieldContent>
                  <Input id={`al-telA-${alumno.id}`} {...form.register("telefonoApoderado")} />
                  <FieldError errors={[form.formState.errors.telefonoApoderado]} />
                </FieldContent>
              </Field>
            </div>
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
