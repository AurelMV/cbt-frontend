import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

// Tipos locales usados por la bandeja (mock)
type EstadoInscripcion = "pendiente" | "aprobado" | "rechazado"
type Acceso = "habilitado" | "bloqueado"
type Inscrito = {
  id: string
  ciclo: string
  nombre: string
  dni: string
  email: string
  programa: string
  grupo?: string
  clase?: string
  estado: EstadoInscripcion
  acceso: Acceso
  evidenciaUrl?: string
}

type EstadoPago = "pendiente" | "aprobado" | "rechazado"
type Pago = { id: string; ciclo: string; dni: string; nombre: string; monto: number; fecha: string; banco: string; comprobante: string; estado: EstadoPago }

// Datos mock separados para la bandeja (demostración)
const MOCK_INSCRITOS: Inscrito[] = [
  { id: "I-001", ciclo: "2025-2", nombre: "Ana Pérez", dni: "12345678", email: "ana@example.com", programa: "Programa 1", grupo: "", clase: "", estado: "pendiente", acceso: "habilitado", evidenciaUrl: "" },
  { id: "I-002", ciclo: "2025-2", nombre: "Juan Díaz", dni: "87654321", email: "juan@example.com", programa: "Programa 2", grupo: "", clase: "", estado: "pendiente", acceso: "habilitado", evidenciaUrl: "" },
  { id: "I-010", ciclo: "2025-1", nombre: "María López", dni: "11223344", email: "maria@example.com", programa: "Programa 1", grupo: "A", clase: "101", estado: "rechazado", acceso: "bloqueado" },
]

const MOCK_PAGOS: Pago[] = [
  { id: "P-901", ciclo: "2025-2", dni: "12345678", nombre: "Ana Pérez", monto: 150, fecha: "2025-10-20", banco: "BCP", comprobante: "C-1001", estado: "pendiente" },
  { id: "P-902", ciclo: "2025-2", dni: "87654321", nombre: "Juan Díaz", monto: 200, fecha: "2025-10-21", banco: "BBVA", comprobante: "C-1002", estado: "pendiente" },
  { id: "P-800", ciclo: "2025-1", dni: "11223344", nombre: "María López", monto: 180, fecha: "2025-05-21", banco: "Interbank", comprobante: "C-9988", estado: "aprobado" },
]

type ButtonVariant = "default" | "secondary" | "destructive" | "ghost" | "link" | "outline"
type ButtonSize = "default" | "sm" | "lg" | "icon"

export function BandejaButton({
  label = "Bandeja",
  variant = "secondary",
  size = "default",
  className,
  icon,
  trigger,
}: {
  label?: string
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
  icon?: React.ReactNode
  trigger?: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState("inscripciones")

  // Estados locales de mock (independientes de las tablas principales)
  const [inscripciones, setInscripciones] = useState<Inscrito[]>(MOCK_INSCRITOS)
  const [pagos, setPagos] = useState<Pago[]>(MOCK_PAGOS)

  const [cicloFiltroPagos, setCicloFiltroPagos] = useState<string>("all")
  const pendientes = useMemo(() => inscripciones.filter(i => i.estado === "pendiente"), [inscripciones])
  const pagosFiltrados = useMemo(() => pagos
    .filter(p => cicloFiltroPagos === "all" || p.ciclo === cicloFiltroPagos)
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()), [pagos, cicloFiltroPagos])
  const pendingInsCount = pendientes.length
  const pendingPayCount = pagos.filter(p => p.estado === "pendiente").length
  const totalPending = pendingInsCount + pendingPayCount

  const aprobarInscripcion = (id: string, email: string) => {
    setInscripciones(prev => prev.map(i => i.id === id ? { ...i, estado: "aprobado", acceso: "habilitado" } : i))
    toast.success("Inscripción aprobada", { description: `Se envió un correo de confirmación a ${email}` })
  }
  const rechazarInscripcion = (id: string, email: string) => {
    setInscripciones(prev => prev.map(i => i.id === id ? { ...i, estado: "rechazado" } : i))
    toast.error("Inscripción rechazada", { description: `Se envió un correo de rechazo a ${email}` })
  }

  const aprobarPago = (id: string, nombre: string) => {
    setPagos(prev => prev.map(p => p.id === id ? { ...p, estado: "aprobado" } : p))
    // Simulación: matrícula actualizada automáticamente
    toast.success("Pago aprobado", { description: `La matrícula de ${nombre} fue actualizada automáticamente` })
  }
  const desaprobarPago = (id: string) => {
    setPagos(prev => prev.map(p => p.id === id ? { ...p, estado: "rechazado" } : p))
    toast.error("Pago desaprobado", { description: `El registro fue marcado como rechazado` })
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <div className="relative inline-flex w-full">
          {trigger ? (
            trigger
          ) : (
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
              {pendientes.length === 0 ? (
                <div className="text-sm text-muted-foreground">No hay inscripciones pendientes.</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>DNI</TableHead>
                      <TableHead>Ciclo</TableHead>
                      <TableHead>Programa</TableHead>
                      <TableHead>Grupo</TableHead>
                      <TableHead>Clase</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendientes.map(item => (
                      <TableRow key={item.id}>
                        <TableCell>{item.nombre}</TableCell>
                        <TableCell>{item.dni}</TableCell>
                        <TableCell>
                          <Select value={item.ciclo} onValueChange={(val) => setInscripciones(prev => prev.map(x => x.id === item.id ? { ...x, ciclo: val } : x))}>
                            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="2025-1">2025-1</SelectItem>
                              <SelectItem value="2025-2">2025-2</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>{item.programa}</TableCell>
                        <TableCell>
                          <Input value={item.grupo || ""} onChange={(e) => setInscripciones(prev => prev.map(x => x.id === item.id ? { ...x, grupo: e.target.value } : x))} className="w-24" />
                        </TableCell>
                        <TableCell>
                          <Input value={item.clase || ""} onChange={(e) => setInscripciones(prev => prev.map(x => x.id === item.id ? { ...x, clase: e.target.value } : x))} className="w-24" />
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Sheet>
                              <SheetTrigger asChild>
                                <Button size="sm" variant="outline">Revisar</Button>
                              </SheetTrigger>
                              <SheetContent side="right" className="w-full sm:max-w-md">
                                <SheetHeader>
                                  <SheetTitle>Inscripción {item.id}</SheetTitle>
                                </SheetHeader>
                                <div className="p-4 space-y-3 text-sm">
                                  <div><strong>Estudiante:</strong> {item.nombre} ({item.dni})</div>
                                  <div><strong>Email:</strong> {item.email}</div>
                                  <div><strong>Programa:</strong> {item.programa}</div>
                                  <div><strong>Ciclo:</strong> {item.ciclo}</div>
                                  <div><strong>Evidencia de pago:</strong> <span className="text-muted-foreground">No disponible en mock</span></div>
                                </div>
                              </SheetContent>
                            </Sheet>
                            <Button size="sm" onClick={() => aprobarInscripcion(item.id, item.email)}>Aprobar</Button>
                            <Button size="sm" variant="destructive" onClick={() => rechazarInscripcion(item.id, item.email)}>Rechazar</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>

            <TabsContent value="pagos" className="mt-4 space-y-4">
              <div>
                <label className="text-sm">Ciclo</label>
                <Select value={cicloFiltroPagos} onValueChange={setCicloFiltroPagos}>
                  <SelectTrigger className="w-40">
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
                    <TableHead>DNI</TableHead>
                    <TableHead>Ciclo</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagosFiltrados.map(p => (
                    <TableRow key={p.id}>
                      <TableCell>{p.fecha}</TableCell>
                      <TableCell>{p.comprobante}</TableCell>
                      <TableCell>{p.nombre}</TableCell>
                      <TableCell>{p.dni}</TableCell>
                      <TableCell>{p.ciclo}</TableCell>
                      <TableCell>S/ {p.monto.toFixed(2)}</TableCell>
                      <TableCell className="capitalize">{p.estado}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => aprobarPago(p.id, p.nombre)}>Aprobar</Button>
                          <Button size="sm" variant="destructive" onClick={() => desaprobarPago(p.id)}>Desaprobar</Button>
                        </div>
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
