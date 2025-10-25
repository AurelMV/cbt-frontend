import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Field, FieldContent, FieldError, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import FileUploader from "@/components/common/file-uploader"
import { toast } from "sonner"

const schema = z.object({
  dni: z.string().length(8, "DNI de 8 dígitos").regex(/^\d{8}$/g, "Formato inválido"),
  ciclo: z.string().min(1, "Seleccione ciclo"),
  comprobante: z.string().min(3, "Requerido"),
  fecha: z.string().refine((v) => {
    const d = new Date(v)
    if (Number.isNaN(d.getTime())) return false
    return d <= new Date()
  }, { message: "No puede ser futura" }),
  monto: z.coerce.number().positive("Monto inválido"),
  banco: z.string().min(1, "Seleccione una opción"),
  archivo: z.instanceof(File),
})

type FormValues = z.infer<typeof schema>

export default function Page() {
  const [perfil, setPerfil] = useState<{ nombre: string; programas: string[] } | null>(null)
  const [loadingPerfil, setLoadingPerfil] = useState(false)

  const form = useForm<FormValues>({
    // Ajuste de tipos por diferencias entre zod v4 y RHF tipos estrictos
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: { dni: "", ciclo: "", banco: "" },
    mode: "onChange",
  })

  const buscar = async () => {
    setLoadingPerfil(true)
    try {
      const dni = form.getValues("dni")
      // Simulación de fetch a /api/alumnos/:dni
      await new Promise((r) => setTimeout(r, 600))
      setPerfil({ nombre: `Alumno ${dni}`, programas: ["Programa 1"] })
      toast.success("Datos encontrados", { description: `Alumno ${dni}` })
    } catch {
      setPerfil(null)
      toast.error("No se encontraron datos para el DNI ingresado")
    } finally {
      setLoadingPerfil(false)
    }
  }

  const onSubmit = async (values: FormValues) => {
    try {
      await new Promise((r) => setTimeout(r, 700))
      toast.success("Pago registrado", { description: `Comprobante ${values.comprobante}` })
      form.reset()
    } catch {
      toast.error("No se pudo registrar el pago")
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6 space-y-6">
      <h1 className="text-2xl md:text-3xl font-semibold">Registro de Pagos</h1>

      <div className="border rounded-lg p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <FieldLabel htmlFor="dni">DNI</FieldLabel>
            <Input id="dni" inputMode="numeric" maxLength={8} {...form.register("dni")} />
          </div>
          <div>
            <FieldLabel>Ciclo</FieldLabel>
            <Select value={form.watch("ciclo")} onValueChange={(v) => form.setValue("ciclo", v, { shouldValidate: true })}>
              <SelectTrigger aria-invalid={!!form.formState.errors.ciclo}>
                <SelectValue placeholder="Seleccione ciclo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2025-1">2025-1</SelectItem>
                <SelectItem value="2025-2">2025-2</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button type="button" onClick={buscar} disabled={loadingPerfil || !form.watch("dni") || !form.watch("ciclo")}>{loadingPerfil ? "Buscando…" : "Buscar"}</Button>
          </div>
        </div>
        {perfil && (
          <div className="text-sm text-muted-foreground">
            {perfil.nombre} · {perfil.programas.join(", ")}
          </div>
        )}
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" noValidate>
        <FieldSet>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="comprobante">Nº de comprobante</FieldLabel>
              <FieldContent>
                <Input id="comprobante" aria-invalid={!!form.formState.errors.comprobante} {...form.register("comprobante")} />
                <FieldError errors={[form.formState.errors.comprobante]} />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor="fecha">Fecha de pago</FieldLabel>
              <FieldContent>
                <Input id="fecha" type="date" aria-invalid={!!form.formState.errors.fecha} {...form.register("fecha")} />
                <FieldError errors={[form.formState.errors.fecha]} />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor="monto">Monto</FieldLabel>
              <FieldContent>
                <Input id="monto" type="number" step="0.01" min="0" aria-invalid={!!form.formState.errors.monto} {...form.register("monto", { valueAsNumber: true })} />
                <FieldError errors={[form.formState.errors.monto]} />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel>Banco/Proveedor</FieldLabel>
              <FieldContent>
                <Select value={form.watch("banco")} onValueChange={(v) => form.setValue("banco", v, { shouldValidate: true })}>
                  <SelectTrigger aria-invalid={!!form.formState.errors.banco}>
                    <SelectValue placeholder="Seleccione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bcp">BCP</SelectItem>
                    <SelectItem value="bbva">BBVA</SelectItem>
                    <SelectItem value="interbank">Interbank</SelectItem>
                  </SelectContent>
                </Select>
                <FieldError errors={[form.formState.errors.banco]} />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel>Archivo comprobante (PDF/JPG/PNG ≤ 5MB)</FieldLabel>
              <FieldContent>
                <FileUploader value={form.getValues("archivo") as unknown as File | null} onChange={(f) => form.setValue("archivo", f as File, { shouldValidate: true })} />
                <FieldError errors={[form.formState.errors.archivo]} />
              </FieldContent>
            </Field>
          </FieldGroup>
        </FieldSet>
        <Button type="submit" disabled={!form.formState.isValid}>Registrar pago</Button>
      </form>
    </div>
  )
}
