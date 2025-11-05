import { useEffect, useState } from "react"
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
import { getProgramas } from "@/services/programas"
import { getCiclos } from "@/services/ciclos"
import { getGruposPorCiclo } from "@/services/grupos"
import { getDepartamentos, getProvinciasPorDepartamento, getDistritosPorProvincia, getColegiosPorDistrito } from "@/services/ubicacion"
import type { Programa } from "@/services/programas"
import type { Ciclo } from "@/services/ciclos"
import type { Grupo } from "@/services/grupos"
import type { Departamento, Distrito, Provincia, Colegio } from "@/services/ubicacion"
import { createPreinscripcion } from "@/services/preinscripciones"
import { createPrePago } from "@/services/prepagos"

const schema = z.object({
  // Datos personales
  nroDocumento: z.string().min(8, "DNI debe tener 8 dígitos").max(12).regex(/^\d+$/g, "Sólo números"),
  nombreAlumno: z.string().min(2).max(100),
  aPaterno: z.string().min(2).max(100),
  aMaterno: z.string().min(2).max(100),
  fechaNacimiento: z.string().refine((v) => !Number.isNaN(new Date(v).getTime()), { message: "Fecha inválida" }),
  sexo: z.enum(["M", "F"]).default("M"),
  email: z.string().email(),
  telefonoEstudiante: z.string().min(7).max(15),
  telefonoApoderado: z.string().min(7).max(15),
  Direccion: z.string().min(3).max(200),
  anoCulminado: z.coerce.number().int().min(1900).max(new Date().getFullYear()),

  // Ubicación/colegio
  departamento_id: z.coerce.number(),
  provincia_id: z.coerce.number(),
  distrito_id: z.coerce.number(),
  idColegio: z.coerce.number(),

  // Académico
  idPrograma: z.coerce.number(),
  idCiclo: z.coerce.number(),
  grupoId: z.coerce.number().optional(),

  // Pago
  nroVoucher: z.string().min(3),
  medioPago: z.enum(["deposito", "transferencia", "yape", "plin"]).default("deposito"),
  monto: z.coerce.number().positive(),
  fechaPago: z.string().refine((v) => !Number.isNaN(new Date(v).getTime()), { message: "Fecha de pago inválida" }),
  TipoPago: z.enum(["matricula", "mensualidad", "inscripcion"]).default("inscripcion"),
  documento: z.instanceof(File).optional(),
})

type FormValues = z.infer<typeof schema>

export default function Page() {
  const [submitting, setSubmitting] = useState(false)
  const [programas, setProgramas] = useState<Programa[]>([])
  const [ciclos, setCiclos] = useState<Ciclo[]>([])
  const [grupos, setGrupos] = useState<Grupo[]>([])
  const [departamentos, setDepartamentos] = useState<Departamento[]>([])
  const [provincias, setProvincias] = useState<Provincia[]>([])
  const [distritos, setDistritos] = useState<Distrito[]>([])
  const [colegios, setColegios] = useState<Colegio[]>([])

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      sexo: "M",
      medioPago: "deposito",
      TipoPago: "inscripcion",
    },
    mode: "onChange",
  })
  const { clear } = useAutoSaveForm<FormValues>({
    form,
    storageKey: "inscripcion-form",
    // Requerimiento: al recargar, limpiar y no restaurar datos guardados
    restoreOnMount: false,
    clearOnMount: true,
  })

  // Carga catálogos iniciales
  useEffect(() => {
    (async () => {
      try {
        const [progs, cics, deps] = await Promise.all([getProgramas(), getCiclos(), getDepartamentos()])
        setProgramas(progs)
        // Mostrar solo ciclos activos (estado === true)
        setCiclos(cics.filter(c => c.estado === true))
        setDepartamentos(deps)
      } catch (e: any) {
        toast.error("No se pudieron cargar catálogos", { description: e.message })
      }
    })()
  }, [])

  // Provincias por departamento
  useEffect(() => {
    const depId = form.watch("departamento_id")
    if (!depId) { setProvincias([]); setDistritos([]); setColegios([]); return }
    getProvinciasPorDepartamento(depId).then(setProvincias).catch(() => setProvincias([]))
  }, [form.watch("departamento_id")])

  // Distritos por provincia
  useEffect(() => {
    const provId = form.watch("provincia_id")
    if (!provId) { setDistritos([]); setColegios([]); return }
    getDistritosPorProvincia(provId).then(setDistritos).catch(() => setDistritos([]))
  }, [form.watch("provincia_id")])

  // Colegios por distrito
  useEffect(() => {
    const distId = form.watch("distrito_id")
    if (!distId) { setColegios([]); return }
    getColegiosPorDistrito(distId).then(setColegios).catch(() => setColegios([]))
  }, [form.watch("distrito_id")])

  // Grupos por ciclo
  useEffect(() => {
    const cicloId = form.watch("idCiclo")
    if (!cicloId) { setGrupos([]); return }
    getGruposPorCiclo(cicloId).then(setGrupos).catch(() => setGrupos([]))
  }, [form.watch("idCiclo")])

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true)
    try {
      // 1) Crear PreInscripción
      const pre = await createPreinscripcion({
        nombreAlumno: values.nombreAlumno,
        aMaterno: values.aMaterno,
        aPaterno: values.aPaterno,
        sexo: values.sexo,
        telefonoEstudiante: values.telefonoEstudiante,
        telefonoApoderado: values.telefonoApoderado,
        fechaNacimiento: values.fechaNacimiento,
        email: values.email,
        anoCulminado: values.anoCulminado,
        Direccion: values.Direccion,
        nroDocumento: values.nroDocumento,
        idColegio: values.idColegio,
        idCiclo: values.idCiclo,
        idPrograma: values.idPrograma,
        estado: "pendiente",
      })

      // 2) Crear PrePago vinculado
      await createPrePago({
        nroVoucher: values.nroVoucher,
        medioPago: values.medioPago,
        monto: values.monto,
        fecha: values.fechaPago,
        idInscripcion: pre.id,
        foto: null, // pendiente: subir archivo y guardar URL
        TipoPago: values.TipoPago,
      })

      toast.success("Inscripción enviada", { description: `Referencia #${pre.id} - ${values.nombreAlumno}` })
      clear(); form.reset()
    } catch (e: any) {
      toast.error("No se pudo enviar la inscripción", { description: e.message })
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
              <FieldLabel htmlFor="nroDocumento">DNI</FieldLabel>
              <FieldContent>
                <Input id="nroDocumento" inputMode="numeric" aria-invalid={!!form.formState.errors.nroDocumento} {...form.register("nroDocumento")} />
                <FieldError errors={[form.formState.errors.nroDocumento]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="nombreAlumno">Nombres</FieldLabel>
              <FieldContent>
                <Input id="nombreAlumno" aria-invalid={!!form.formState.errors.nombreAlumno} {...form.register("nombreAlumno")} />
                <FieldError errors={[form.formState.errors.nombreAlumno]} />
              </FieldContent>
            </Field>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="aPaterno">Apellido paterno</Label>
                <Input id="aPaterno" aria-invalid={!!form.formState.errors.aPaterno} {...form.register("aPaterno")} />
              </div>
              <div>
                <Label htmlFor="aMaterno">Apellido materno</Label>
                <Input id="aMaterno" aria-invalid={!!form.formState.errors.aMaterno} {...form.register("aMaterno")} />
              </div>
            </div>
            <FieldError errors={[form.formState.errors.aPaterno, form.formState.errors.aMaterno]} />

            <Field>
              <FieldLabel htmlFor="fechaNacimiento">Fecha de nacimiento</FieldLabel>
              <FieldContent>
                <Input id="fechaNacimiento" type="date" aria-invalid={!!form.formState.errors.fechaNacimiento} {...form.register("fechaNacimiento")} />
                <FieldError errors={[form.formState.errors.fechaNacimiento]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>Sexo</FieldLabel>
              <FieldContent>
                <Select value={form.watch("sexo")} onValueChange={(v) => form.setValue("sexo", v as any, { shouldValidate: true })}>
                  <SelectTrigger><SelectValue placeholder="Seleccione…" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Masculino</SelectItem>
                    <SelectItem value="F">Femenino</SelectItem>
                  </SelectContent>
                </Select>
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <FieldContent>
                <Input id="email" type="email" aria-invalid={!!form.formState.errors.email} {...form.register("email")} />
                <FieldError errors={[form.formState.errors.email]} />
              </FieldContent>
            </Field>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="telefonoEstudiante">Teléfono estudiante</Label>
                <Input id="telefonoEstudiante" inputMode="tel" {...form.register("telefonoEstudiante")} />
              </div>
              <div>
                <Label htmlFor="telefonoApoderado">Teléfono apoderado</Label>
                <Input id="telefonoApoderado" inputMode="tel" {...form.register("telefonoApoderado")} />
              </div>
            </div>

            <Field>
              <FieldLabel htmlFor="Direccion">Dirección</FieldLabel>
              <FieldContent>
                <Input id="Direccion" aria-invalid={!!form.formState.errors.Direccion} {...form.register("Direccion")} />
                <FieldError errors={[form.formState.errors.Direccion]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="anoCulminado">Año de culminación</FieldLabel>
              <FieldContent>
                <Input id="anoCulminado" inputMode="numeric" aria-invalid={!!form.formState.errors.anoCulminado} {...form.register("anoCulminado")} />
                <FieldError errors={[form.formState.errors.anoCulminado]} />
              </FieldContent>
            </Field>

            {/* Ubicación y colegio */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Departamento</Label>
                <Select value={String(form.watch("departamento_id") ?? "")} onValueChange={(v) => form.setValue("departamento_id", Number(v), { shouldValidate: true })}>
                  <SelectTrigger><SelectValue placeholder="Seleccione…" /></SelectTrigger>
                  <SelectContent>
                    {departamentos.map(d => <SelectItem key={d.id} value={String(d.id)}>{d.nombreDepartamento}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Provincia</Label>
                <Select value={String(form.watch("provincia_id") ?? "")} onValueChange={(v) => form.setValue("provincia_id", Number(v), { shouldValidate: true })}>
                  <SelectTrigger><SelectValue placeholder="Seleccione…" /></SelectTrigger>
                  <SelectContent>
                    {provincias.map(p => <SelectItem key={p.id} value={String(p.id)}>{p.nombreProvincia}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Distrito</Label>
                <Select value={String(form.watch("distrito_id") ?? "")} onValueChange={(v) => form.setValue("distrito_id", Number(v), { shouldValidate: true })}>
                  <SelectTrigger><SelectValue placeholder="Seleccione…" /></SelectTrigger>
                  <SelectContent>
                    {distritos.map(d => <SelectItem key={d.id} value={String(d.id)}>{d.nombreDistrito}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Field>
              <FieldLabel>Colegio</FieldLabel>
              <FieldContent>
                <Select value={String(form.watch("idColegio") ?? "")} onValueChange={(v) => form.setValue("idColegio", Number(v), { shouldValidate: true })}>
                  <SelectTrigger><SelectValue placeholder="Seleccione…" /></SelectTrigger>
                  <SelectContent>
                    {colegios.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.nombreColegio}</SelectItem>)}
                  </SelectContent>
                </Select>
              </FieldContent>
            </Field>

            {/* Académico */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Programa</Label>
                <Select value={String(form.watch("idPrograma") ?? "")} onValueChange={(v) => form.setValue("idPrograma", Number(v), { shouldValidate: true })}>
                  <SelectTrigger><SelectValue placeholder="Seleccione…" /></SelectTrigger>
                  <SelectContent>
                    {programas.map(p => <SelectItem key={p.id} value={String(p.id)}>{p.nombrePrograma}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Ciclo</Label>
                <Select value={String(form.watch("idCiclo") ?? "")} onValueChange={(v) => form.setValue("idCiclo", Number(v), { shouldValidate: true })}>
                  <SelectTrigger><SelectValue placeholder="Seleccione…" /></SelectTrigger>
                  <SelectContent>
                    {ciclos.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.nombreCiclo}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <FieldDescription>El grupo se determinará con la coordinación. (Opcional)</FieldDescription>
            <Field>
              <FieldLabel>Grupo (opcional)</FieldLabel>
              <FieldContent>
                <Select value={String(form.watch("grupoId") ?? "")} onValueChange={(v) => form.setValue("grupoId", Number(v))}>
                  <SelectTrigger><SelectValue placeholder="Seleccione…" /></SelectTrigger>
                  <SelectContent>
                    {grupos.map(g => <SelectItem key={g.id} value={String(g.id)}>{g.nombreGrupo}</SelectItem>)}
                  </SelectContent>
                </Select>
              </FieldContent>
            </Field>

            {/* Pago */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="nroVoucher">Nº de voucher</Label>
                <Input id="nroVoucher" {...form.register("nroVoucher")} />
              </div>
              <div>
                <Label htmlFor="monto">Monto</Label>
                <Input id="monto" inputMode="decimal" {...form.register("monto")} />
              </div>
              <div>
                <Label htmlFor="fechaPago">Fecha de pago</Label>
                <Input id="fechaPago" type="date" {...form.register("fechaPago")} />
              </div>
            </div>
            <Field>
              <FieldLabel>Medio de pago</FieldLabel>
              <FieldContent>
                <Select value={form.watch("medioPago")} onValueChange={(v) => form.setValue("medioPago", v as any, { shouldValidate: true })}>
                  <SelectTrigger><SelectValue placeholder="Seleccione…" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="deposito">Depósito</SelectItem>
                    <SelectItem value="transferencia">Transferencia</SelectItem>
                    <SelectItem value="yape">Yape</SelectItem>
                    <SelectItem value="plin">Plin</SelectItem>
                  </SelectContent>
                </Select>
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel>Tipo de pago</FieldLabel>
              <FieldContent>
                <Select value={form.watch("TipoPago")} onValueChange={(v) => form.setValue("TipoPago", v as any, { shouldValidate: true })}>
                  <SelectTrigger><SelectValue placeholder="Seleccione…" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inscripcion">Inscripción</SelectItem>
                    <SelectItem value="matricula">Matrícula</SelectItem>
                    <SelectItem value="mensualidad">Mensualidad</SelectItem>
                  </SelectContent>
                </Select>
              </FieldContent>
            </Field>

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
