import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { toast } from "sonner"

type EstadoCiclo = "abierto" | "cerrado"
type Grupo = { id: string; nombre: string; aforo: number }
type Clase = { id: string; nombre: string; grupoId: string; aforo: number }
type Ciclo = { id: string; nombre: string; estado: EstadoCiclo; grupos: Grupo[]; clases: Clase[] }

const seed: Ciclo[] = [
  {
    id: "2025-1",
    nombre: "2025-1",
    estado: "cerrado",
    grupos: [
      { id: "G-A", nombre: "A", aforo: 60 },
      { id: "G-B", nombre: "B", aforo: 60 },
    ],
    clases: [
      { id: "C-101", nombre: "Intro 101", grupoId: "G-A", aforo: 30 },
      { id: "C-102", nombre: "Mate 102", grupoId: "G-B", aforo: 30 },
    ],
  },
  {
    id: "2025-2",
    nombre: "2025-2",
    estado: "abierto",
    grupos: [
      { id: "G-A2", nombre: "A", aforo: 80 },
      { id: "G-B2", nombre: "B", aforo: 70 },
    ],
    clases: [
      { id: "C-201", nombre: "Intro 201", grupoId: "G-A2", aforo: 40 },
      { id: "C-202", nombre: "Mate 202", grupoId: "G-B2", aforo: 35 },
    ],
  },
]

export default function Page() {
  const [ciclos, setCiclos] = useState<Ciclo[]>(seed)
  const [selectedId, setSelectedId] = useState<string>("")
  const [newOpen, setNewOpen] = useState(false)
  const ciclo = useMemo(() => ciclos.find(c => c.id === selectedId), [ciclos, selectedId])

  const aforoTotal = useMemo(() => {
    if (!ciclo) return 0
    return ciclo.grupos.reduce((acc, g) => acc + g.aforo, 0)
  }, [ciclo])

  function saveCiclo() {
    if (!ciclo) return
    setCiclos(prev => prev.map(c => (c.id === ciclo.id ? { ...ciclo } : c)))
    toast.success("Ciclo actualizado")
  }

  function toggleEstado() {
    if (!ciclo) return
    const nuevo = ciclo.estado === "abierto" ? "cerrado" : "abierto"
    setCiclos(prev => prev.map(c => (c.id === ciclo.id ? { ...c, estado: nuevo } : c)))
    toast.message(nuevo === "cerrado" ? "Ciclo cerrado" : "Ciclo abierto", { description: ciclo.nombre })
  }

  function addGrupo() {
    if (!ciclo) return
    const num = ciclo.grupos.length + 1
    const g: Grupo = { id: `G-${num}`, nombre: String.fromCharCode(64 + num), aforo: 30 }
    setCiclos(prev => prev.map(c => (c.id === ciclo.id ? { ...c, grupos: [...c.grupos, g] } : c)))
  }
  function addClase() {
    if (!ciclo || ciclo.grupos.length === 0) return
    const num = ciclo.clases.length + 1
    const cl: Clase = { id: `C-${ciclo.id}-${num}`, nombre: `Clase ${num}`, grupoId: ciclo.grupos[0].id, aforo: 20 }
    setCiclos(prev => prev.map(c => (c.id === ciclo.id ? { ...c, clases: [...c.clases, cl] } : c)))
  }
  function delGrupo(id: string) {
    if (!ciclo) return
    setCiclos(prev => prev.map(c => (c.id === ciclo.id ? { ...c, grupos: c.grupos.filter(g => g.id !== id), clases: c.clases.filter(cl => cl.grupoId !== id) } : c)))
  }
  function delClase(id: string) {
    if (!ciclo) return
    setCiclos(prev => prev.map(c => (c.id === ciclo.id ? { ...c, clases: c.clases.filter(cl => cl.id !== id) } : c)))
  }

  // Creación de ciclo
  const [nuevoNombre, setNuevoNombre] = useState("")
  const [nuevoGrupos, setNuevoGrupos] = useState<{ nombre: string; aforo: number }[]>([{ nombre: "A", aforo: 60 }])
  const [nuevoClases, setNuevoClases] = useState<{ nombre: string; grupo: string; aforo: number }[]>([])

  function crearCiclo() {
    if (!nuevoNombre) return toast.error("Ingresa el nombre del ciclo")
    const gid = (i: number) => `G-${nuevoNombre}-${i + 1}`
    const grupos: Grupo[] = nuevoGrupos.map((g, i) => ({ id: gid(i), nombre: g.nombre, aforo: g.aforo }))
    const clases: Clase[] = nuevoClases.map((c, i) => ({ id: `C-${nuevoNombre}-${i + 1}`, nombre: c.nombre, grupoId: gid(Math.max(0, nuevoGrupos.findIndex(g => g.nombre === c.grupo))), aforo: c.aforo }))
    const nuevo: Ciclo = { id: nuevoNombre, nombre: nuevoNombre, estado: "abierto", grupos, clases }
    setCiclos(prev => [...prev, nuevo])
    setNewOpen(false)
    setNuevoNombre("")
    setNuevoGrupos([{ nombre: "A", aforo: 60 }])
    setNuevoClases([])
    toast.success("Ciclo creado")
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Ciclos</CardTitle>
            <Sheet open={newOpen} onOpenChange={setNewOpen}>
              <SheetTrigger asChild>
                <Button>Nuevo ciclo</Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:max-w-xl">
                <SheetHeader>
                  <SheetTitle>Crear nuevo ciclo</SheetTitle>
                </SheetHeader>
                <div className="p-4 space-y-4">
                  <div>
                    <label className="text-sm">Nombre del ciclo</label>
                    <Input value={nuevoNombre} onChange={(e) => setNuevoNombre(e.target.value)} placeholder="Ej. 2026-1" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Grupos</span>
                      <Button size="sm" variant="outline" onClick={() => setNuevoGrupos(prev => [...prev, { nombre: String.fromCharCode(65 + prev.length), aforo: 30 }])}>Agregar grupo</Button>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nombre</TableHead>
                          <TableHead>Aforo</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {nuevoGrupos.map((g, i) => (
                          <TableRow key={i}>
                            <TableCell>
                              <Input value={g.nombre} onChange={(e) => setNuevoGrupos(prev => prev.map((x, idx) => idx === i ? { ...x, nombre: e.target.value } : x))} className="w-28" />
                            </TableCell>
                            <TableCell>
                              <Input type="number" min={0} value={g.aforo} onChange={(e) => setNuevoGrupos(prev => prev.map((x, idx) => idx === i ? { ...x, aforo: Number(e.target.value) } : x))} className="w-28" />
                            </TableCell>
                            <TableCell>
                              <Button size="sm" variant="ghost" onClick={() => setNuevoGrupos(prev => prev.filter((_, idx) => idx !== i))}>Eliminar</Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Clases</span>
                      <Button size="sm" variant="outline" onClick={() => setNuevoClases(prev => [...prev, { nombre: `Clase ${prev.length + 1}`, grupo: nuevoGrupos[0]?.nombre || "A", aforo: 20 }])}>Agregar clase</Button>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nombre</TableHead>
                          <TableHead>Grupo</TableHead>
                          <TableHead>Aforo</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {nuevoClases.map((cl, i) => (
                          <TableRow key={i}>
                            <TableCell>
                              <Input value={cl.nombre} onChange={(e) => setNuevoClases(prev => prev.map((x, idx) => idx === i ? { ...x, nombre: e.target.value } : x))} className="w-36" />
                            </TableCell>
                            <TableCell>
                              <Select value={cl.grupo} onValueChange={(v) => setNuevoClases(prev => prev.map((x, idx) => idx === i ? { ...x, grupo: v } : x))}>
                                <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  {nuevoGrupos.map((g, gi) => (
                                    <SelectItem key={gi} value={g.nombre}>{g.nombre}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Input type="number" min={0} value={cl.aforo} onChange={(e) => setNuevoClases(prev => prev.map((x, idx) => idx === i ? { ...x, aforo: Number(e.target.value) } : x))} className="w-28" />
                            </TableCell>
                            <TableCell>
                              <Button size="sm" variant="ghost" onClick={() => setNuevoClases(prev => prev.filter((_, idx) => idx !== i))}>Eliminar</Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="pt-2 flex gap-2">
                    <Button onClick={crearCiclo}>Crear ciclo</Button>
                    <Button variant="outline" onClick={() => setNewOpen(false)}>Cancelar</Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-1 space-y-2">
              <div className="text-sm text-muted-foreground">Listado de ciclos</div>
              <div className="space-y-2">
                {ciclos.map(c => (
                  <button
                    key={c.id}
                    className={`w-full text-left border rounded-md p-3 hover:bg-accent transition ${selectedId === c.id ? "ring-2 ring-primary" : ""}`}
                    onClick={() => setSelectedId(c.id)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{c.nombre}</span>
                      <Badge variant={c.estado === "abierto" ? "default" : "outline"} className="capitalize">{c.estado}</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Grupos: {c.grupos.length} · Clases: {c.clases.length}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="lg:col-span-2">
              {!ciclo ? (
                <div className="text-sm text-muted-foreground border rounded-md p-4">Selecciona un ciclo para editar su información.</div>
              ) : (
                <div className="space-y-4">
                  {/* Header de edición */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Input
                        value={ciclo.nombre}
                        onChange={(e) => setCiclos(prev => prev.map(c => c.id === ciclo.id ? { ...c, nombre: e.target.value } : c))}
                        className="w-40"
                      />
                      <Badge variant={ciclo.estado === "abierto" ? "default" : "outline"} className="capitalize">{ciclo.estado}</Badge>
                      <div className="text-sm text-muted-foreground">Aforo total grupos: {aforoTotal}</div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant={ciclo.estado === "abierto" ? "destructive" : "default"} onClick={toggleEstado}>
                        {ciclo.estado === "abierto" ? "Cerrar ciclo" : "Abrir ciclo"}
                      </Button>
                      <Button onClick={saveCiclo}>Guardar cambios</Button>
                    </div>
                  </div>

                  {/* Grupos */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">Grupos</CardTitle>
                        <Button size="sm" variant="outline" onClick={addGrupo}>Agregar grupo</Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Aforo</TableHead>
                            <TableHead></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {ciclo.grupos.map((g) => (
                            <TableRow key={g.id}>
                              <TableCell>
                                <Input value={g.nombre} onChange={(e) => setCiclos(prev => prev.map(c => c.id === ciclo.id ? { ...c, grupos: c.grupos.map(x => x.id === g.id ? { ...x, nombre: e.target.value } : x) } : c))} className="w-24" />
                              </TableCell>
                              <TableCell>
                                <Input type="number" min={0} value={g.aforo} onChange={(e) => setCiclos(prev => prev.map(c => c.id === ciclo.id ? { ...c, grupos: c.grupos.map(x => x.id === g.id ? { ...x, aforo: Number(e.target.value) } : x) } : c))} className="w-24" />
                              </TableCell>
                              <TableCell>
                                <Button size="sm" variant="ghost" onClick={() => delGrupo(g.id)}>Eliminar</Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>

                  {/* Clases */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">Clases</CardTitle>
                        <Button size="sm" variant="outline" onClick={addClase}>Agregar clase</Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Grupo</TableHead>
                            <TableHead>Aforo</TableHead>
                            <TableHead></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {ciclo.clases.map((cl) => (
                            <TableRow key={cl.id}>
                              <TableCell>
                                <Input value={cl.nombre} onChange={(e) => setCiclos(prev => prev.map(c => c.id === ciclo.id ? { ...c, clases: c.clases.map(x => x.id === cl.id ? { ...x, nombre: e.target.value } : x) } : c))} className="w-40" />
                              </TableCell>
                              <TableCell>
                                <Select value={cl.grupoId} onValueChange={(v) => setCiclos(prev => prev.map(c => c.id === ciclo.id ? { ...c, clases: c.clases.map(x => x.id === cl.id ? { ...x, grupoId: v } : x) } : c))}>
                                  <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                    {ciclo.grupos.map(g => (
                                      <SelectItem key={g.id} value={g.id}>{g.nombre}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell>
                                <Input type="number" min={0} value={cl.aforo} onChange={(e) => setCiclos(prev => prev.map(c => c.id === ciclo.id ? { ...c, clases: c.clases.map(x => x.id === cl.id ? { ...x, aforo: Number(e.target.value) } : x) } : c))} className="w-24" />
                              </TableCell>
                              <TableCell>
                                <Button size="sm" variant="ghost" onClick={() => delClase(cl.id)}>Eliminar</Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
