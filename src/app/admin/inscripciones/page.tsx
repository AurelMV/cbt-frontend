import { useEffect, useMemo, useRef, useState } from "react"
import { animate, stagger } from "animejs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { toast } from "sonner"
import { useInscripciones, useCreateInscripcion, useUpdateInscripcion } from "@/hooks/use-inscripciones"
import { useAlumnos } from "@/hooks/use-alumnos"
import { useCiclos } from "@/hooks/use-ciclos"
import { useClases } from "@/hooks/use-clases"
import { useProgramas } from "@/hooks/use-programas"
import type { InscripcionListItem } from "@/services/inscripciones"
import { useForm, Controller } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Field, FieldContent, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type DecoratedInscripcion = InscripcionListItem & {
  nombreMostrar: string
  apellidos: string
  cicloLabel: string
  grupoLabel: string
}

export default function Page() {
  const EMAIL_REGEX = /^[^@\s]+@[^@\s]+\.[^@\s]+$/
    const [q, setQ] = useState("") // búsqueda backend: Código, EstadoPago, TipoPago
    const [dniLookup, setDniLookup] = useState("") // campo para búsqueda rápida por DNI + ciclo (endpoint /inscripciones/buscar)
    const [lookupLoading, setLookupLoading] = useState(false)
    const [page, setPage] = useState(0)
    const [ciclo, setCiclo] = useState("")
    const [programa, setPrograma] = useState("")
    const [clase, setClase] = useState("")
    const limit = 10
    const inscQ = useInscripciones({
      page,
      limit,
      q,
      idCiclo: ciclo ? Number(ciclo) : undefined,
      idPrograma: programa ? Number(programa) : undefined,
      idClase: clase ? Number(clase) : undefined,
    })
  const createInsc = useCreateInscripcion()
    // Ajuste: backend limita 'limit' a <= 100 y 'page' es 0-based
    // Usamos primera página (page=0) y límite máximo permitido (100)
    const alumnosQ = useAlumnos({ page: 0, limit: 100 })
  const ciclosQ = useCiclos()
  const clasesQ = useClases()
  const programasQ = useProgramas()

  const pageSize = limit
  const totalRegistros = inscQ.data?.total ?? 0
  const totalPaginas = inscQ.data?.pages ?? 0
  const gridRef = useRef<HTMLTableSectionElement>(null)
  const [edit, setEdit] = useState<InscripcionListItem | null>(null)
  const [openCreate, setOpenCreate] = useState(false)
  const [wizard, setWizard] = useState<"alumno" | "insc" | "pago">("alumno")

  // Schemas de validación
  const alumnoSchema = z.object({
    nombreAlumno: z.string().min(1, "Nombre requerido"),
    aPaterno: z.string().min(1, "Apellido paterno requerido"),
    aMaterno: z.string().optional().default(""),
    sexo: z.enum(["M", "F"]).default("M"),
    telefonoEstudiante: z.string().optional().default(""),
    telefonoApoderado: z.string().optional().default(""),
    fechaNacimiento: z.string().optional().default(""),
    email: z.union([z.string().regex(EMAIL_REGEX, "Email inválido"), z.literal("")]),
    anoCulminado: z.coerce.number().int().min(1900).max(2100).default(new Date().getFullYear()),
    Direccion: z.string().optional().default(""),
    nroDocumento: z.string().min(8, "DNI inválido"),
    idColegio: z.coerce.number().nonnegative().default(0),
  })

  const inscSchema = z.object({
    idPrograma: z.coerce.number().min(1, "Seleccione programa"),
    idCiclo: z.coerce.number().min(1, "Seleccione ciclo"),
    idClase: z.coerce.number().min(1, "Seleccione clase"),
    Codigo: z.string().min(1, "Código requerido"),
    turno: z.string().min(1, "Turno requerido"),
    fecha: z.string().min(1, "Fecha requerida"),
    Estado: z.boolean().default(true),
    EstadoPago: z.string().default("pendiente"),
    TipoPago: z.string().default("inscripcion"),
  })

  const pagoSchema = z.object({
    nroVoucher: z.string().min(1, "Comprobante requerido"),
    medioPago: z.string().min(1, "Medio requerido"),
    monto: z.coerce.number().positive("Monto debe ser > 0"),
    fecha: z.string().min(1, "Fecha requerida"),
    archivo: z.any().optional().nullable(),
  })

  const createSchema = z
    .object({
      crearAlumno: z.boolean().default(false),
      alumnoSel: z.string().optional(),
      alumno: alumnoSchema.optional(),
      insc: inscSchema,
      pagoNow: z.boolean().default(false),
      pago: pagoSchema.optional(),
    })
    .refine((d) => d.crearAlumno || (!!d.alumnoSel && d.alumnoSel !== ""), {
      message: "Seleccione o cree un alumno",
      path: ["alumnoSel"],
    })
    .refine((d) => !d.pagoNow || !!d.pago, {
      message: "Complete los datos de pago",
      path: ["pago"],
    })

  const createForm = useForm({
    resolver: zodResolver(createSchema),
    defaultValues: {
      crearAlumno: false,
      alumnoSel: "",
      alumno: {
        nombreAlumno: "",
        aPaterno: "",
        aMaterno: "",
        sexo: "M",
        telefonoEstudiante: "",
        telefonoApoderado: "",
        fechaNacimiento: "",
        email: "",
        anoCulminado: new Date().getFullYear(),
        Direccion: "",
        nroDocumento: "",
        idColegio: 0,
      },
      insc: {
        turno: "mañana",
        fecha: new Date().toISOString().slice(0, 10),
        Estado: true,
        idPrograma: 0,
        idCiclo: 0,
        idClase: 0,
        Codigo: "",
        EstadoPago: "pendiente",
        TipoPago: "inscripcion",
      },
      pagoNow: false,
      pago: {
        nroVoucher: "",
        medioPago: "deposito",
        monto: 0,
        fecha: new Date().toISOString().slice(0, 10),
        archivo: null,
      },
    },
  })

  const rows = useMemo<InscripcionListItem[]>(() => inscQ.data?.items ?? [], [inscQ.data])

  const decoradas = useMemo<DecoratedInscripcion[]>(() => {
    return rows.map((r) => ({
      ...r,
      nombreMostrar: r.nombreAlumno || `Alumno #${r.idAlumno}`,
      apellidos: [r.aPaterno, r.aMaterno].filter(Boolean).join(" ") || "—",
      cicloLabel: r.nombreCiclo || `Ciclo #${r.idCiclo}`,
      grupoLabel: r.nombreGrupo || "—",
    }))
  }, [rows])

  const pageItems = decoradas

  // Reset de página al cambiar filtros
  useEffect(() => { setPage(0) }, [ciclo, programa, clase, q])

  useEffect(() => {
    setClase("")
  }, [ciclo])

  // Animación de aparición de filas
  useEffect(() => {
    const el = gridRef.current
    if (!el) return
    const rowsEls = el.querySelectorAll('[data-insc-row]')
    if (!rowsEls.length) return
    // estado inicial
    rowsEls.forEach(r => {
      ;(r as HTMLElement).style.opacity = '0'
      ;(r as HTMLElement).style.transform = 'translateY(12px)'
    })
    // animar
    animate(rowsEls as unknown as Element, {
      opacity: [0, 1],
      translateY: [12, 0],
      duration: 420,
      delay: stagger(50),
      easing: 'easeOutQuad'
    })
  }, [pageItems])

  const onSubmitCrear = createForm.handleSubmit(async (data) => {
    try {
      let idAlumno = Number(data.alumnoSel) || 0
      if (data.crearAlumno) {
        const res = await (await import("@/services/alumnos")).crearAlumno({
          nombreAlumno: data.alumno?.nombreAlumno ?? "",
          aPaterno: data.alumno?.aPaterno ?? "",
          aMaterno: data.alumno?.aMaterno ?? "",
          sexo: data.alumno?.sexo ?? "M",
          telefonoEstudiante: data.alumno?.telefonoEstudiante ?? "",
          telefonoApoderado: data.alumno?.telefonoApoderado ?? "",
          fechaNacimiento: data.alumno?.fechaNacimiento ?? "",
          email: data.alumno?.email ?? "",
          anoCulminado: data.alumno?.anoCulminado ?? new Date().getFullYear(),
          Direccion: data.alumno?.Direccion ?? "",
          nroDocumento: data.alumno?.nroDocumento ?? "",
          idColegio: data.alumno?.idColegio ?? 0,
        })
        idAlumno = res.id
      }
      if (!idAlumno) {
        toast.error("Seleccione o cree un alumno")
        return
      }
      const insc = await createInsc.mutateAsync({ ...data.insc, idAlumno })
      if (data.pagoNow && data.pago) {
        let foto: string | null = null
        const file: File | null | undefined = (data.pago as { archivo?: File | null }).archivo ?? null
        if (file instanceof File) {
          foto = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => (typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("No se pudo leer archivo")))
            reader.onerror = () => reject(new Error("No se pudo leer archivo"))
            reader.readAsDataURL(file)
          })
        }
        await (await import("@/services/pagos")).crearPago({
          nroVoucher: data.pago.nroVoucher,
          medioPago: data.pago.medioPago,
          monto: data.pago.monto,
          fecha: data.pago.fecha,
          idInscripcion: insc.id,
          foto,
          Estado: false,
        })
      }
      toast.success("Inscripción creada")
      setOpenCreate(false)
      createForm.reset()
      inscQ.refetch()
    } catch (e) {
      const msg = e instanceof Error ? e.message : "No se pudo crear la inscripción"
      toast.error(msg)
    }
  })

  return (
    <div className="p-4 md:p-6 space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Gestión de Inscripciones</CardTitle>
          <Sheet open={openCreate} onOpenChange={setOpenCreate}>
            <SheetTrigger asChild>
              <Button>Nueva inscripción</Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-xl p-0">
              <SheetHeader className="px-4 py-4">
                <SheetTitle>Nueva inscripción</SheetTitle>
              </SheetHeader>
              <form onSubmit={onSubmitCrear} className="flex h-full flex-col">
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                  <Tabs value={wizard} onValueChange={(v) => setWizard(v as typeof wizard)} className="w-full">
                    <TabsList className="mb-2">
                      <TabsTrigger value="alumno">Alumno</TabsTrigger>
                      <TabsTrigger value="insc">Inscripción</TabsTrigger>
                      <TabsTrigger value="pago">Pago</TabsTrigger>
                    </TabsList>

                    <TabsContent value="alumno" className="mt-0">
                      <FieldSet>
                        <FieldLegend>Alumno</FieldLegend>
                        <FieldGroup>
                          <Field>
                            <FieldLabel htmlFor="crearAlumno">
                              <div className="flex items-center gap-2">
                                <input id="crearAlumno" type="checkbox" {...createForm.register("crearAlumno")} />
                                <span>Crear nuevo alumno</span>
                              </div>
                            </FieldLabel>
                          </Field>
                          {!createForm.watch("crearAlumno") && (
                            <Field>
                              <FieldLabel htmlFor="alumnoSel">Alumno existente</FieldLabel>
                              <FieldContent>
                                <Controller
                                  control={createForm.control}
                                  name="alumnoSel"
                                  render={({ field }) => (
                                    <Select value={field.value ?? ""} onValueChange={field.onChange}>
                                      <SelectTrigger id="alumnoSel">
                                        <SelectValue placeholder={alumnosQ.isLoading ? "Cargando…" : "Seleccione"} />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {(alumnosQ.data?.items ?? []).map((a) => (
                                          <SelectItem key={a.id} value={String(a.id)}>
                                            {a.nombreAlumno} {a.aPaterno}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  )}
                                />
                                <FieldError errors={[createForm.formState.errors.alumnoSel]} />
                              </FieldContent>
                            </Field>
                          )}
                          {createForm.watch("crearAlumno") && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <Field>
                                <FieldLabel htmlFor="alNombre">Nombre</FieldLabel>
                                <FieldContent>
                                  <Input id="alNombre" {...createForm.register("alumno.nombreAlumno")} />
                                  <FieldError errors={[createForm.formState.errors.alumno?.nombreAlumno]} />
                                </FieldContent>
                              </Field>
                              <Field>
                                <FieldLabel htmlFor="alAPaterno">Apellido paterno</FieldLabel>
                                <FieldContent>
                                  <Input id="alAPaterno" {...createForm.register("alumno.aPaterno")} />
                                  <FieldError errors={[createForm.formState.errors.alumno?.aPaterno]} />
                                </FieldContent>
                              </Field>
                              <Field>
                                <FieldLabel htmlFor="alAMaterno">Apellido materno</FieldLabel>
                                <FieldContent>
                                  <Input id="alAMaterno" {...createForm.register("alumno.aMaterno")} />
                                  <FieldError errors={[createForm.formState.errors.alumno?.aMaterno]} />
                                </FieldContent>
                              </Field>
                              <Field>
                                <FieldLabel htmlFor="alSexo">Sexo</FieldLabel>
                                <FieldContent>
                                  <Controller
                                    control={createForm.control}
                                    name="alumno.sexo"
                                    render={({ field }) => (
                                      <Select value={field.value ?? "M"} onValueChange={field.onChange}>
                                        <SelectTrigger id="alSexo"><SelectValue placeholder="Seleccione" /></SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="M">Masculino</SelectItem>
                                          <SelectItem value="F">Femenino</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    )}
                                  />
                                  <FieldError errors={[createForm.formState.errors.alumno?.sexo]} />
                                </FieldContent>
                              </Field>
                              <Field>
                                <FieldLabel htmlFor="alDni">DNI</FieldLabel>
                                <FieldContent>
                                  <Input id="alDni" {...createForm.register("alumno.nroDocumento")} />
                                  <FieldError errors={[createForm.formState.errors.alumno?.nroDocumento]} />
                                </FieldContent>
                              </Field>
                              <Field>
                                <FieldLabel htmlFor="alNacimiento">Fecha de nacimiento</FieldLabel>
                                <FieldContent>
                                  <Input id="alNacimiento" type="date" {...createForm.register("alumno.fechaNacimiento")} />
                                  <FieldError errors={[createForm.formState.errors.alumno?.fechaNacimiento]} />
                                </FieldContent>
                              </Field>
                              <Field>
                                <FieldLabel htmlFor="alAno">Año culminado</FieldLabel>
                                <FieldContent>
                                  <Input id="alAno" type="number" min={1900} max={2100} {...createForm.register("alumno.anoCulminado", { valueAsNumber: true })} />
                                  <FieldError errors={[createForm.formState.errors.alumno?.anoCulminado]} />
                                </FieldContent>
                              </Field>
                              <Field>
                                <FieldLabel htmlFor="alColegio">ID Colegio</FieldLabel>
                                <FieldContent>
                                  <Input id="alColegio" type="number" min={0} {...createForm.register("alumno.idColegio", { valueAsNumber: true })} />
                                  <FieldError errors={[createForm.formState.errors.alumno?.idColegio]} />
                                </FieldContent>
                              </Field>
                              <Field className="md:col-span-2">
                                <FieldLabel htmlFor="alDireccion">Dirección</FieldLabel>
                                <FieldContent>
                                  <Input id="alDireccion" {...createForm.register("alumno.Direccion")} />
                                  <FieldError errors={[createForm.formState.errors.alumno?.Direccion]} />
                                </FieldContent>
                              </Field>
                              <Field>
                                <FieldLabel htmlFor="alTelEst">Teléfono estudiante</FieldLabel>
                                <FieldContent>
                                  <Input id="alTelEst" {...createForm.register("alumno.telefonoEstudiante")} />
                                  <FieldError errors={[createForm.formState.errors.alumno?.telefonoEstudiante]} />
                                </FieldContent>
                              </Field>
                              <Field>
                                <FieldLabel htmlFor="alTelApo">Teléfono apoderado</FieldLabel>
                                <FieldContent>
                                  <Input id="alTelApo" {...createForm.register("alumno.telefonoApoderado")} />
                                  <FieldError errors={[createForm.formState.errors.alumno?.telefonoApoderado]} />
                                </FieldContent>
                              </Field>
                              <Field>
                                <FieldLabel htmlFor="alEmail">Email</FieldLabel>
                                <FieldContent>
                                  <Input id="alEmail" type="email" {...createForm.register("alumno.email")} />
                                  <FieldError errors={[createForm.formState.errors.alumno?.email]} />
                                </FieldContent>
                              </Field>
                            </div>
                          )}
                        </FieldGroup>
                      </FieldSet>
                    </TabsContent>

                    <TabsContent value="insc" className="mt-0">
                      <FieldSet>
                        <FieldLegend>Inscripción</FieldLegend>
                        <FieldGroup>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Field>
                              <FieldLabel htmlFor="programaSel">Programa</FieldLabel>
                              <FieldContent>
                                <Controller
                                  control={createForm.control}
                                  name="insc.idPrograma"
                                  render={({ field }) => {
                                    let selVal = ""
                                    if (typeof field.value === "number") selVal = String(field.value)
                                    else if (typeof field.value === "string") selVal = field.value
                                    return (
                                      <Select value={selVal} onValueChange={(v) => field.onChange(Number(v))}>
                                        <SelectTrigger id="programaSel"><SelectValue placeholder={programasQ.isLoading ? "Cargando…" : "Seleccione"} /></SelectTrigger>
                                        <SelectContent>
                                          {(programasQ.data ?? []).map(p => (<SelectItem key={p.id} value={String(p.id)}>{p.nombrePrograma}</SelectItem>))}
                                        </SelectContent>
                                      </Select>
                                    )
                                  }}
                                />
                                <FieldError errors={[createForm.formState.errors.insc?.idPrograma]} />
                              </FieldContent>
                            </Field>
                            <Field>
                              <FieldLabel htmlFor="cicloSel">Ciclo</FieldLabel>
                              <FieldContent>
                                <Controller
                                  control={createForm.control}
                                  name="insc.idCiclo"
                                  render={({ field }) => {
                                    let selVal = ""
                                    if (typeof field.value === "number") selVal = String(field.value)
                                    else if (typeof field.value === "string") selVal = field.value
                                    return (
                                      <Select value={selVal} onValueChange={(v) => field.onChange(Number(v))}>
                                        <SelectTrigger id="cicloSel"><SelectValue placeholder={ciclosQ.isLoading ? "Cargando…" : "Seleccione"} /></SelectTrigger>
                                        <SelectContent>
                                          {(ciclosQ.data ?? []).map(c => (<SelectItem key={c.id} value={String(c.id)}>{c.nombreCiclo}</SelectItem>))}
                                        </SelectContent>
                                      </Select>
                                    )
                                  }}
                                />
                                <FieldError errors={[createForm.formState.errors.insc?.idCiclo]} />
                              </FieldContent>
                            </Field>
                            <Field>
                              <FieldLabel htmlFor="claseSel">Clase</FieldLabel>
                              <FieldContent>
                                <Controller
                                  control={createForm.control}
                                  name="insc.idClase"
                                  render={({ field }) => {
                                    let selVal = ""
                                    if (typeof field.value === "number") selVal = String(field.value)
                                    else if (typeof field.value === "string") selVal = field.value
                                    return (
                                      <Select value={selVal} onValueChange={(v) => field.onChange(Number(v))}>
                                        <SelectTrigger id="claseSel"><SelectValue placeholder={clasesQ.isLoading ? "Cargando…" : "Seleccione"} /></SelectTrigger>
                                        <SelectContent>
                                          {(clasesQ.data ?? []).map(c => (<SelectItem key={c.id} value={String(c.id)}>{c.codigoClase}</SelectItem>))}
                                        </SelectContent>
                                      </Select>
                                    )
                                  }}
                                />
                                <FieldError errors={[createForm.formState.errors.insc?.idClase]} />
                              </FieldContent>
                            </Field>
                            <Field>
                              <FieldLabel htmlFor="codigoInsc">Código</FieldLabel>
                              <FieldContent>
                                <Input id="codigoInsc" {...createForm.register("insc.Codigo")} />
                                <FieldError errors={[createForm.formState.errors.insc?.Codigo]} />
                              </FieldContent>
                            </Field>
                            <Field>
                              <FieldLabel htmlFor="turnoInsc">Turno</FieldLabel>
                              <FieldContent>
                                <Input id="turnoInsc" {...createForm.register("insc.turno")} />
                                <FieldError errors={[createForm.formState.errors.insc?.turno]} />
                              </FieldContent>
                            </Field>
                            <Field>
                              <FieldLabel htmlFor="fechaInsc">Fecha</FieldLabel>
                              <FieldContent>
                                <Input id="fechaInsc" type="date" {...createForm.register("insc.fecha")} />
                                <FieldError errors={[createForm.formState.errors.insc?.fecha]} />
                              </FieldContent>
                            </Field>
                          </div>
                        </FieldGroup>
                      </FieldSet>
                    </TabsContent>

                    <TabsContent value="pago" className="mt-0">
                      <FieldSet>
                        <FieldLegend>Pago (opcional)</FieldLegend>
                        <FieldGroup>
                          <Field>
                            <FieldLabel htmlFor="pagoNow">
                              <div className="flex items-center gap-2">
                                <input id="pagoNow" type="checkbox" {...createForm.register("pagoNow")} />
                                <span>Registrar pago ahora</span>
                              </div>
                            </FieldLabel>
                          </Field>
                          {createForm.watch("pagoNow") && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <Field>
                                <FieldLabel htmlFor="nroVoucher">Comprobante</FieldLabel>
                                <FieldContent>
                                  <Input id="nroVoucher" {...createForm.register("pago.nroVoucher")} />
                                  <FieldError errors={[createForm.formState.errors.pago?.nroVoucher]} />
                                </FieldContent>
                              </Field>
                              <Field>
                                <FieldLabel htmlFor="fechaPago">Fecha</FieldLabel>
                                <FieldContent>
                                  <Input id="fechaPago" type="date" {...createForm.register("pago.fecha")} />
                                  <FieldError errors={[createForm.formState.errors.pago?.fecha]} />
                                </FieldContent>
                              </Field>
                              <Field>
                                <FieldLabel htmlFor="montoPago">Monto</FieldLabel>
                                <FieldContent>
                                  <Input id="montoPago" type="number" min={0} step="0.01" {...createForm.register("pago.monto", { valueAsNumber: true })} />
                                  <FieldError errors={[createForm.formState.errors.pago?.monto]} />
                                </FieldContent>
                              </Field>
                              <Field>
                                <FieldLabel htmlFor="medioPago">Medio</FieldLabel>
                                <FieldContent>
                                  <Input id="medioPago" {...createForm.register("pago.medioPago")} />
                                  <FieldError errors={[createForm.formState.errors.pago?.medioPago]} />
                                </FieldContent>
                              </Field>
                              <Field className="md:col-span-2">
                                <FieldLabel htmlFor="archivoPago">Evidencia (imagen/pdf)</FieldLabel>
                                <FieldContent>
                                  <Controller
                                    control={createForm.control}
                                    name="pago.archivo"
                                    render={({ field }) => (
                                      <Input id="archivoPago" type="file" accept="image/*,application/pdf" onChange={(e) => field.onChange(e.target.files?.[0] ?? null)} />
                                    )}
                                  />
                                </FieldContent>
                              </Field>
                            </div>
                          )}
                        </FieldGroup>
                      </FieldSet>
                    </TabsContent>
                  </Tabs>
                </div>
                <div className="border-t bg-background p-3 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Button type="button" variant="outline" onClick={() => setOpenCreate(false)}>Cancelar</Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button type="button" variant="outline" disabled={wizard === "alumno"} onClick={() => setWizard(wizard === "pago" ? "insc" : "alumno")}>Atrás</Button>
                    {wizard === "pago" ? (
                      <Button type="submit" disabled={createInsc.isPending}>{createInsc.isPending ? "Creando…" : "Crear"}</Button>
                    ) : (
                      <Button
                        type="button"
                        onClick={async () => {
                          if (wizard === "alumno") {
                            const ok = await createForm.trigger(["crearAlumno", "alumnoSel", "alumno.nombreAlumno", "alumno.aPaterno", "alumno.nroDocumento"]) 
                            if (ok) setWizard("insc")
                          } else if (wizard === "insc") {
                            const ok = await createForm.trigger(["insc.idPrograma", "insc.idCiclo", "insc.idClase", "insc.Codigo", "insc.turno", "insc.fecha"]) 
                            if (ok) setWizard("pago")
                          }
                        }}
                      >Siguiente</Button>
                    )}
                  </div>
                </div>
              </form>
            </SheetContent>
          </Sheet>
        </CardHeader>
        <CardContent className="space-y-4">

          {/* Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
            <div>
              <label className="text-sm" htmlFor="cicloList">Ciclo</label>
              <Select value={ciclo} onValueChange={(v)=>setCiclo(v)}>
                <SelectTrigger id="cicloList">
                  <SelectValue placeholder={ciclosQ.isLoading ? "Cargando…" : "Selecciona un ciclo"} />
                </SelectTrigger>
                <SelectContent>
                  {(ciclosQ.data ?? []).map(c => (<SelectItem key={c.id} value={String(c.id)}>{c.nombreCiclo}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm" htmlFor="progList">Programa</label>
              <Select value={programa} onValueChange={(v)=>setPrograma(v === "all" ? "" : v)}>
                <SelectTrigger id="progList">
                  <SelectValue placeholder={programasQ.isLoading ? "Cargando…" : "Todos"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {(programasQ.data ?? []).map(p => (<SelectItem key={p.id} value={String(p.id)}>{p.nombrePrograma}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm" htmlFor="claseList">Clase</label>
              <Select value={clase || "all"} onValueChange={(v)=>setClase(v === "all" ? "" : v)}>
                <SelectTrigger id="claseList">
                  <SelectValue placeholder={clasesQ.isLoading ? "Cargando…" : "Todas"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {(clasesQ.data ?? []).map(c => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.codigoClase}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm" htmlFor="buscarInsc">Buscar backend (Código / estado / tipo)</label>
              <Input id="buscarInsc" value={q} onChange={(e) => { setPage(0); setQ(e.target.value) }} placeholder="Ej. COD-001 pendiente inscripcion" />
            </div>
            <div className="md:col-span-2 flex flex-col gap-1">
              <label className="text-sm" htmlFor="dniLookup">Buscar inscripción por DNI + Ciclo</label>
              <div className="flex gap-2">
                <Input id="dniLookup" value={dniLookup} onChange={(e)=>setDniLookup(e.target.value)} placeholder="DNI alumno" className="flex-1" />
                <Button
                  type="button"
                  variant="outline"
                  disabled={!dniLookup || !ciclo || lookupLoading}
                  onClick={async ()=>{
                    if(!dniLookup || !ciclo) return
                    setLookupLoading(true)
                    try {
                      const mod = await import("@/services/inscripciones")
                      const res = await mod.buscarInscripcion(dniLookup, Number(ciclo), { silentError: true })
                      toast.success(`Inscripción encontrada: Código ${res.Codigo ?? '—'} Alumno ${res.nombreAlumno} ${res.aPaterno}`)
                      // Si tiene código lo usamos para filtrar remoto
                      if(res.Codigo){
                        setQ(res.Codigo)
                        setPage(0)
                      }
                    } catch {
                      toast.error("No se encontró inscripción para ese DNI y ciclo")
                    } finally {
                      setLookupLoading(false)
                    }
                  }}
                >{lookupLoading ? 'Buscando…' : 'Buscar DNI'}</Button>
              </div>
            </div>
          </div>

          {/* Lista (tabla) con paginación */}
          {ciclo ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Apellidos</TableHead>
                    <TableHead>Ciclo</TableHead>
                    <TableHead>Grupo</TableHead>
                    <TableHead>Clase</TableHead>
                    <TableHead>Nro Pagos</TableHead>
                    <TableHead>Estado Pago</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody ref={gridRef}>
                  {pageItems.map(r => (
                    <TableRow key={r.id} data-insc-row>
                      <TableCell className="font-medium">{r.Codigo}</TableCell>
                      <TableCell>{r.nombreMostrar}</TableCell>
                      <TableCell>{r.apellidos}</TableCell>
                      <TableCell>{r.cicloLabel}</TableCell>
                      <TableCell>{r.grupoLabel}</TableCell>
                      <TableCell>{r.codigoClase}</TableCell>
                      <TableCell>{r.pagosCount}</TableCell>
                      <TableCell className="capitalize">{r.EstadoPago}</TableCell>
                      <TableCell>
                        <Sheet open={edit?.id === r.id} onOpenChange={(open) => setEdit(open ? r : null)}>
                          <SheetTrigger asChild>
                            <Button size="sm" variant="outline">Editar</Button>
                          </SheetTrigger>
                          <SheetContent side="right">
                            <SheetHeader>
                              <SheetTitle>Editar inscripción</SheetTitle>
                            </SheetHeader>
                            {edit && <EditInscripcionForm value={edit} onCancel={() => setEdit(null)} onSaved={() => { setEdit(null); inscQ.refetch() }} />}
                          </SheetContent>
                        </Sheet>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Paginación */}
              <div className="flex items-center justify-between pt-4">
                <div className="text-sm text-muted-foreground">
                  {totalRegistros > 0
                    ? `Mostrando ${page * pageSize + 1}-${Math.min((page + 1) * pageSize, totalRegistros)} de ${totalRegistros}`
                    : "Sin registros"}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" disabled={page<=0} onClick={()=>setPage(p=>Math.max(0,p-1))}>Anterior</Button>
                  <div className="text-sm">{totalPaginas === 0 ? 0 : page + 1} / {totalPaginas || 1}</div>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page + 1 >= totalPaginas}
                    onClick={()=>setPage(p=> Math.min(Math.max(0, totalPaginas - 1), p + 1))}
                  >Siguiente</Button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-sm text-muted-foreground p-3 border rounded-md">
              Selecciona un ciclo para ver las inscripciones.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Componente de edición con validación mínima (Código y Fecha)
function EditInscripcionForm({ value, onCancel, onSaved }: { readonly value: InscripcionListItem; readonly onCancel: () => void; readonly onSaved: () => void }) {
  const { mutateAsync } = useUpdateInscripcion()
  const schema = z.object({
    Codigo: z.string().min(1, "Código requerido"),
    fecha: z.string().min(1, "Fecha requerida"),
  })
  type FormData = z.infer<typeof schema>
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { Codigo: value.Codigo, fecha: value.fecha },
    values: { Codigo: value.Codigo, fecha: value.fecha },
  })

  const onSubmit = form.handleSubmit(async (data) => {
    await mutateAsync({
      id: value.id,
      body: {
        turno: value.turno,
        fecha: data.fecha,
        Estado: !!value.Estado,
        idAlumno: value.idAlumno,
        idPrograma: value.idPrograma,
        idCiclo: value.idCiclo,
        idClase: value.idClase,
        Codigo: data.Codigo,
        EstadoPago: value.EstadoPago,
        TipoPago: value.TipoPago,
      },
    })
    toast.success("Inscripción actualizada")
    onSaved()
  })

  return (
    <div className="p-4 space-y-4">
      <form onSubmit={onSubmit} className="space-y-4">
        <Field>
          <FieldLabel htmlFor="editCodigo">Código</FieldLabel>
          <FieldContent>
            <Input id="editCodigo" {...form.register("Codigo")} />
            <FieldError errors={[form.formState.errors.Codigo]} />
          </FieldContent>
        </Field>
        <Field>
          <FieldLabel htmlFor="editFecha">Fecha</FieldLabel>
          <FieldContent>
            <Input id="editFecha" type="date" {...form.register("fecha")} />
            <FieldError errors={[form.formState.errors.fecha]} />
          </FieldContent>
        </Field>
        <div className="flex gap-2 pt-2">
          <Button type="submit">Guardar</Button>
          <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        </div>
      </form>
    </div>
  )
}
