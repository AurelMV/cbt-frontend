import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel, FieldSet, FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useAutoSaveForm } from "@/hooks/use-autosave-form"
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"
import FileUploader from "@/components/common/file-uploader"

const schema = z.object({
  dni: z.string().min(8, "DNI debe tener 8 dígitos").max(8, "DNI debe tener 8 dígitos").regex(/^\d{8}$/g, "Formato inválido"),
  nombres: z.string().min(2, "Mínimo 2 caracteres").max(100, "Máximo 100 caracteres").regex(/^[A-Za-zÁÉÍÓÚÑáéíóúñ ]+$/g, "Sólo letras y espacios"),
  apellidos: z.string().min(2, "Requerido").max(100, "Máximo 100 caracteres").regex(/^[A-Za-zÁÉÍÓÚÑáéíóúñ ]+$/g, "Sólo letras y espacios"),
  nacimiento: z.string().refine((v) => {
    const d = new Date(v)
    if (Number.isNaN(d.getTime())) return false
    const today = new Date()
    const age = today.getFullYear() - d.getFullYear() - (today < new Date(today.getFullYear(), d.getMonth(), d.getDate()) ? 1 : 0)
    return age >= 12
  }, { message: "Debe tener al menos 12 años" }),
  email: z.string().email("Email inválido"),
  telefono: z.string().optional().refine((v) => !v || (v.length >= 7 && v.length <= 15), { message: "Teléfono inválido" }),
  programa: z.string().min(1, "Seleccione un programa"),
  documento: z.instanceof(File).optional(),
  ciclo: z.string().optional(),
  grupo: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

export default function Page() {
  const [submitting, setSubmitting] = useState(false)
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      dni: "",
      nombres: "",
      apellidos: "",
      nacimiento: "",
      email: "",
      telefono: "",
      programa: "",
      ciclo: "",
      grupo: "",
    },
    mode: "onChange",
  })
  const { clear } = useAutoSaveForm({ form, storageKey: "inscripcion-form" })

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true)
    try {
      // Simulación de POST; integrar con /api/inscripciones en producción
      await new Promise((r) => setTimeout(r, 800))
  const referencia = Math.random().toString(36).slice(2, 8).toUpperCase()
  toast.success("Inscripción recibida. Su solicitud será revisada. Respuesta en 24 horas.", { description: `Nº referencia: ${referencia} · Postulante: ${values.nombres} ${values.apellidos}` })
      clear()
      form.reset()
    } catch {
      toast.error("No se pudo enviar la inscripción. Intente nuevamente.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6">
      <h1 className="text-2xl md:text-3xl font-semibold mb-2">Inscripción</h1>
      <p className="text-muted-foreground mb-6">Complete los datos. Los campos marcados son obligatorios.</p>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" noValidate>
        <FieldSet>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="dni">DNI</FieldLabel>
              <FieldContent>
                <Input id="dni" inputMode="numeric" maxLength={8} aria-invalid={!!form.formState.errors.dni} {...form.register("dni")} />
                <FieldError errors={[form.formState.errors.dni]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="nombres">Nombres</FieldLabel>
              <FieldContent>
                <Input id="nombres" aria-invalid={!!form.formState.errors.nombres} {...form.register("nombres")} />
                <FieldError errors={[form.formState.errors.nombres]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="apellidos">Apellidos</FieldLabel>
              <FieldContent>
                <Input id="apellidos" aria-invalid={!!form.formState.errors.apellidos} {...form.register("apellidos")} />
                <FieldError errors={[form.formState.errors.apellidos]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="nacimiento">Fecha de nacimiento</FieldLabel>
              <FieldContent>
                <Input id="nacimiento" type="date" aria-invalid={!!form.formState.errors.nacimiento} {...form.register("nacimiento")} />
                <FieldError errors={[form.formState.errors.nacimiento]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <FieldContent>
                <Input id="email" type="email" aria-invalid={!!form.formState.errors.email} {...form.register("email")} />
                <FieldError errors={[form.formState.errors.email]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="telefono">Teléfono (opcional)</FieldLabel>
              <FieldContent>
                <Input id="telefono" inputMode="tel" {...form.register("telefono")} />
                <FieldError errors={[form.formState.errors.telefono]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>Programa seleccionado</FieldLabel>
              <FieldContent>
                <Select value={form.watch("programa")} onValueChange={(v) => form.setValue("programa", v, { shouldValidate: true })}>
                  <SelectTrigger aria-invalid={!!form.formState.errors.programa}>
                    <SelectValue placeholder="Seleccione…" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="programa-1">Programa 1</SelectItem>
                    <SelectItem value="programa-2">Programa 2</SelectItem>
                  </SelectContent>
                </Select>
                <FieldDescription>Puede ser actualizado por el administrador.</FieldDescription>
                <FieldError errors={[form.formState.errors.programa]} />
              </FieldContent>
            </Field>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ciclo">Ciclo (opcional)</Label>
                <Input id="ciclo" {...form.register("ciclo")} />
              </div>
              <div>
                <Label htmlFor="grupo">Grupo (opcional)</Label>
                <Input id="grupo" {...form.register("grupo")} />
              </div>
            </div>

            <Field>
              <FieldLabel>Evidencia de pago (PDF/JPG/PNG, ≤ 5MB)</FieldLabel>
              <FieldContent>
                <FileUploader
                  accept=".pdf,.jpg,.jpeg,.png"
                  maxSizeMB={5}
                  value={form.getValues("documento") as File | undefined as File | null}
                  onChange={(file) => form.setValue("documento", file ?? undefined)}
                />
              </FieldContent>
            </Field>
          </FieldGroup>
        </FieldSet>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={submitting || !form.formState.isValid}>
            {submitting ? "Enviando…" : "Enviar inscripción"}
          </Button>
          <Button type="button" variant="outline" onClick={() => form.reset()}>Limpiar</Button>
        </div>
      </form>
      <Toaster />
    </div>
  )
}
