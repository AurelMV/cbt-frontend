import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { aprobarPago as apiAprobarPago, aprobarPreinscripcion as apiAprobarPre, getCounts, listPagosPendientes, listPreinsPendientes, rechazarPago as apiRechazarPago, rechazarPreinscripcion as apiRechazarPre, type BandejaPagoItem, type BandejaPreItem } from "@/services/bandeja"
import { getCiclos } from "@/services/ciclos"
import { api } from "@/services/http"

type Grupo = { id: number; nombreGrupo: string; ciclo_id: number }
type Clase = { id: number; codigoClase: string; grupo_id: number }

type ButtonVariant = "default" | "secondary" | "destructive" | "ghost" | "link" | "outline"
type ButtonSize = "default" | "sm" | "lg" | "icon"

export function BandejaButton({
  label = "Bandeja",
  variant = "secondary",
  size = "default",
  className,
  icon,
  trigger,
}: Readonly<{
  label?: string
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
  icon?: React.ReactNode
  trigger?: React.ReactNode
}>) {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState("inscripciones")

  // Datos reales desde backend
  const [inscripciones, setInscripciones] = useState<BandejaPreItem[]>([])
  const [pagos, setPagos] = useState<BandejaPagoItem[]>([])
  const [counts, setCounts] = useState<{ pre: number; pay: number }>({ pre: 0, pay: 0 })
  const [grupos, setGrupos] = useState<Grupo[]>([])
  const [clases, setClases] = useState<Clase[]>([])
  const [selGrupoByPre, setSelGrupoByPre] = useState<Record<number, number | undefined>>({})
  const [selClaseByPre, setSelClaseByPre] = useState<Record<number, number | undefined>>({})
  const [ciclos, setCiclos] = useState<Array<{ id: number; nombreCiclo: string }>>([])

  const [cicloFiltroPagos, setCicloFiltroPagos] = useState<string>("all")
  const cicloNombre = useMemo(() => Object.fromEntries(ciclos.map(c => [c.id, c.nombreCiclo])), [ciclos])
  const pagosFiltrados = useMemo(() => pagos
    .filter(p => cicloFiltroPagos === "all" || (p.inscripcion?.idCiclo && String(p.inscripcion.idCiclo) === cicloFiltroPagos))
    .sort((a, b) => new Date(b.pago.fecha).getTime() - new Date(a.pago.fecha).getTime()), [pagos, cicloFiltroPagos])
  const pendingInsCount = counts.pre
  const pendingPayCount = counts.pay
  const totalPending = pendingInsCount + pendingPayCount

  const reloadAll = async () => {
    try {
      const [c, pre, pay, cg, cc, ci] = await Promise.all([
        getCounts(),
        listPreinsPendientes(),
        listPagosPendientes(),
        api.get<Grupo[]>("/grupos/"),
        api.get<Clase[]>("/clases/"),
        getCiclos(),
      ])
      setCounts({ pre: c.preinscripcionesPendientes, pay: c.pagosPendientes })
      setInscripciones(pre)
      setPagos(pay)
      setGrupos(cg)
      setClases(cc)
      setCiclos(ci)
    } catch {
      // noop
    }
  }

  useEffect(() => { if (open) reloadAll() }, [open])

  const aprobarInscripcion = async (preId: number, idGrupo: number | undefined, idClase: number | undefined) => {
    try {
      if (!idGrupo || !idClase) { toast.error("Falta seleccionar grupo y clase"); return }
      await apiAprobarPre(preId, { idGrupo, idClase })
      toast.success("Inscripción aprobada")
      await reloadAll()
    } catch { toast.error("No se pudo aprobar la inscripción") }
  }
  const rechazarInscripcion = async (preId: number) => {
    try { await apiRechazarPre(preId); toast.success("Inscripción rechazada"); await reloadAll() } catch { toast.error("No se pudo rechazar") }
  }

  const aprobarPago = async (id: number, nombre?: string) => {
    try { await apiAprobarPago(id); toast.success("Pago aprobado", { description: nombre ? `De ${nombre}` : undefined }); await reloadAll() } catch { toast.error("No se pudo aprobar el pago") }
  }
  const desaprobarPago = async (id: number) => {
    try { await apiRechazarPago(id); toast.success("Pago rechazado"); await reloadAll() } catch { toast.error("No se pudo rechazar el pago") }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <div className="relative inline-flex w-full">
          {trigger ?? (
            <Button variant={variant} size={size} className={className}>
              {icon}
              {size === "icon" ? <span className="sr-only">{label}</span> : label}
            </Button>
          )}
          {totalPending > 0 && (
            <Badge
              variant="default"
              className="absolute -right-1 -top-1 h-5 min-w-5 rounded-full px-1 text-[10px] leading-4"
            >
              {totalPending}
            </Badge>
          )}
        </div>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-3xl">
        <SheetHeader>
          <SheetTitle>Bandeja de revisión</SheetTitle>
        </SheetHeader>

        <div className="p-4">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList>
              <TabsTrigger value="inscripciones">Inscripciones pendientes</TabsTrigger>
              <TabsTrigger value="pagos">Pagos</TabsTrigger>
            </TabsList>

            <TabsContent value="inscripciones" className="mt-4 space-y-3">
              {inscripciones.length === 0 ? (
                <div className="text-sm text-muted-foreground">No hay inscripciones pendientes.</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>DNI</TableHead>
                      <TableHead>Ciclo</TableHead>
                      <TableHead>Programa</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inscripciones.map(({ preinscripcion: pre, prepagos }) => {
                      const gruposCiclo = grupos.filter(g => g.ciclo_id === pre.idCiclo)
                      const selGrupo = selGrupoByPre[pre.id]
                      const clasesGrupo = clases.filter(c => c.grupo_id === (selGrupo ?? -1))
                      const selClase = selClaseByPre[pre.id]
                      return (
                        <TableRow key={pre.id}>
                          <TableCell>{pre.nombreAlumno} {pre.aPaterno} {pre.aMaterno}</TableCell>
                          <TableCell>{pre.nroDocumento}</TableCell>
                          <TableCell>{cicloNombre[pre.idCiclo] ?? pre.idCiclo}</TableCell>
                          <TableCell>{pre.idPrograma}</TableCell>
                          <TableCell>
                            <Sheet>
                              <SheetTrigger asChild>
                                <Button size="sm" variant="outline">Ver detalles</Button>
                              </SheetTrigger>
                              <SheetContent side="right" className="w-full sm:max-w-lg">
                                <SheetHeader>
                                  <SheetTitle>Revisión de preinscripción #{pre.id}</SheetTitle>
                                </SheetHeader>
                                <div className="p-4 space-y-4 text-sm overflow-y-auto h-[calc(100vh-8rem)]">
                                  <div className="grid grid-cols-1 gap-2">
                                    <div><strong>Estudiante:</strong> {pre.nombreAlumno} {pre.aPaterno} {pre.aMaterno}</div>
                                    <div className="grid grid-cols-2 gap-2">
                                      <div><strong>DNI:</strong> {pre.nroDocumento}</div>
                                      <div><strong>Sexo:</strong> {pre.sexo}</div>
                                      <div><strong>Fecha nac.:</strong> {pre.fechaNacimiento}</div>
                                      <div><strong>Email:</strong> {pre.email}</div>
                                      <div><strong>Tel. Est.:</strong> {pre.telefonoEstudiante}</div>
                                      <div><strong>Tel. Apod.:</strong> {pre.telefonoApoderado}</div>
                                      <div><strong>Dirección:</strong> {pre.Direccion}</div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                      <div><strong>Programa:</strong> {pre.idPrograma}</div>
                                      <div><strong>Ciclo:</strong> {cicloNombre[pre.idCiclo] ?? pre.idCiclo}</div>
                                    </div>
                                  </div>

                                  <div className="space-y-2">
                                    <div className="font-medium">Prepagos ({prepagos.length})</div>
                                    {prepagos.length === 0 ? (
                                      <div className="text-muted-foreground">Sin prepagos</div>
                                    ) : (
                                      <div className="space-y-3">
                                        {prepagos.map(pp => (
                                          <div key={pp.id} className="flex gap-3 items-start">
                                            <div className="min-w-40 text-xs">
                                              <div><strong>Comprobante:</strong> {pp.nroVoucher}</div>
                                              <div><strong>Medio:</strong> {pp.medioPago}</div>
                                              <div><strong>Monto:</strong> S/ {pp.monto.toFixed(2)}</div>
                                              <div><strong>Fecha:</strong> {pp.fecha}</div>
                                              <div><strong>Tipo:</strong> {pp.TipoPago}</div>
                                            </div>
                                            {pp.foto ? (
                                              <img src={pp.foto} alt="Evidencia" className="h-32 w-auto rounded border" />
                                            ) : (
                                              <div className="text-muted-foreground text-xs">Sin imagen</div>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>

                                  <div className="space-y-2">
                                    <div className="font-medium">Asignar Grupo y Clase</div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                      <div>
                                        <Select value={selGrupo ? String(selGrupo) : undefined} onValueChange={(v) => { const g = Number(v); setSelGrupoByPre(s => ({ ...s, [pre.id]: g })); setSelClaseByPre(s => ({ ...s, [pre.id]: undefined })) }}>
                                          <SelectTrigger className="w-full"><SelectValue placeholder="Grupo" /></SelectTrigger>
                                          <SelectContent>
                                            {gruposCiclo.map(g => (<SelectItem key={g.id} value={String(g.id)}>{g.nombreGrupo}</SelectItem>))}
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <div>
                                        <Select value={selClase ? String(selClase) : undefined} onValueChange={(v) => { const c = Number(v); setSelClaseByPre(s => ({ ...s, [pre.id]: c })) }}>
                                          <SelectTrigger className="w-full"><SelectValue placeholder="Clase" /></SelectTrigger>
                                          <SelectContent>
                                            {clasesGrupo.map(c => (<SelectItem key={c.id} value={String(c.id)}>{c.codigoClase}</SelectItem>))}
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex gap-2 pt-2">
                                    <Button size="sm" onClick={() => aprobarInscripcion(pre.id, selGrupo, selClase)}>Aprobar</Button>
                                    <Button size="sm" variant="destructive" onClick={() => rechazarInscripcion(pre.id)}>Rechazar</Button>
                                  </div>
                                </div>
                              </SheetContent>
                            </Sheet>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
            </TabsContent>

            <TabsContent value="pagos" className="mt-4 space-y-4">
              <div>
                <label className="text-sm" htmlFor="cicloFiltro">Ciclo</label>
                <Select value={cicloFiltroPagos} onValueChange={setCicloFiltroPagos}>
                  <SelectTrigger id="cicloFiltro" className="w-40">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="2025-1">2025-1</SelectItem>
                    <SelectItem value="2025-2">2025-2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Comprobante</TableHead>
                    <TableHead>Estudiante</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagosFiltrados.map(item => (
                    <TableRow key={item.pago.id}>
                      <TableCell>{item.pago.fecha}</TableCell>
                      <TableCell>{item.pago.nroVoucher}</TableCell>
                      <TableCell>{item.alumno ? `${item.alumno.nombreAlumno} ${item.alumno.aPaterno} ${item.alumno.aMaterno}` : "-"}</TableCell>
                      <TableCell>S/ {item.pago.monto.toFixed(2)}</TableCell>
                      <TableCell className="capitalize">{item.pago.Estado ? "aprobado" : "pendiente"}</TableCell>
                      <TableCell>
                        <Sheet>
                          <SheetTrigger asChild>
                            <Button size="sm" variant="outline">Ver detalles</Button>
                          </SheetTrigger>
                          <SheetContent side="right" className="w-full sm:max-w-lg">
                            <SheetHeader>
                              <SheetTitle>Revisión de pago #{item.pago.id}</SheetTitle>
                            </SheetHeader>
                            <div className="p-4 space-y-4 text-sm overflow-y-auto h-[calc(100vh-8rem)]">
                              <div className="grid grid-cols-2 gap-2">
                                <div><strong>Fecha:</strong> {item.pago.fecha}</div>
                                <div><strong>Comprobante:</strong> {item.pago.nroVoucher}</div>
                                <div><strong>Monto:</strong> S/ {item.pago.monto.toFixed(2)}</div>
                                <div><strong>Medio:</strong> {item.pago.medioPago}</div>
                                <div><strong>Ciclo:</strong> {item.inscripcion?.idCiclo ? (cicloNombre[item.inscripcion.idCiclo] ?? item.inscripcion.idCiclo) : "-"}</div>
                                <div><strong>Documento:</strong> {item.alumno?.nroDocumento ?? "-"}</div>
                              </div>
                              <div>
                                <div className="font-medium mb-2">Evidencia</div>
                                {item.pago.foto ? (
                                  <img src={item.pago.foto} alt="Evidencia" className="max-h-72 rounded border" />
                                ) : (
                                  <div className="text-muted-foreground">Sin imagen</div>
                                )}
                              </div>
                              <div className="flex gap-2">
                                {!item.pago.Estado && <Button size="sm" onClick={() => aprobarPago(item.pago.id, item.alumno ? item.alumno.nombreAlumno : undefined)}>Aprobar</Button>}
                                <Button size="sm" variant="destructive" onClick={() => desaprobarPago(item.pago.id)}>Rechazar</Button>
                              </div>
                            </div>
                          </SheetContent>
                        </Sheet>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  )
}
