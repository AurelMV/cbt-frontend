import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"
// Bandeja ahora vive en el sidebar; no se muestra aquí

type Estado = "pendiente" | "aprobado" | "rechazado"
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
  estado: Estado
  acceso: Acceso
}

const DATA: Inscrito[] = [
  { id: "I-001", ciclo: "2025-2", nombre: "Ana Pérez", dni: "12345678", email: "ana@example.com", programa: "Programa 1", grupo: "A", estado: "pendiente", acceso: "habilitado" },
  { id: "I-002", ciclo: "2025-2", nombre: "Juan Díaz", dni: "87654321", email: "juan@example.com", programa: "Programa 2", grupo: "B", estado: "aprobado", acceso: "habilitado" },
  { id: "I-010", ciclo: "2025-1", nombre: "María López", dni: "11223344", email: "maria@example.com", programa: "Programa 1", grupo: "A", estado: "rechazado", acceso: "bloqueado" },
]

export default function Page() {
  // Comenzar sin ciclo seleccionado; pedir selección antes de mostrar la tabla
  const [ciclo, setCiclo] = useState("")
  // Usar un valor no vacío para evitar error de Radix Select cuando hay un <SelectItem value="">
  const [estado, setEstado] = useState<string>("all")
  const [grupo, setGrupo] = useState("")
  const [q, setQ] = useState("")
  const [rows, setRows] = useState<Inscrito[]>(DATA)
  const [edit, setEdit] = useState<Inscrito | null>(null)

  const filtrados = useMemo(() => {
    return rows.filter(r => (
      (!ciclo || r.ciclo === ciclo) &&
      (estado === "all" || r.estado === estado) &&
      (!grupo || (r.grupo || "").toLowerCase().includes(grupo.toLowerCase())) &&
      (!q || [r.nombre, r.dni].some(f => f.toLowerCase().includes(q.toLowerCase())))
    ))
  }, [rows, ciclo, estado, grupo, q])

  const guardarEdicion = () => {
    if (!edit) return
    setRows(prev => prev.map(r => r.id === edit.id ? edit : r))
    toast.success("Estudiante actualizado")
    setEdit(null)
  }

  // Acciones de estado/accso removidas según requerimiento; solo queda "Editar"

  return (
    <div className="p-4 md:p-6 space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Gestión de Inscripciones</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Selección de ciclo (obligatoria antes de ver la tabla) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-sm">Ciclo</label>
              <Select value={ciclo} onValueChange={setCiclo}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un ciclo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2025-1">2025-1</SelectItem>
                  <SelectItem value="2025-2">2025-2</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Filtros adicionales visibles solo cuando hay ciclo */}
          {ciclo && (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <div>
                <label className="text-sm">Estado</label>
                <Select value={estado} onValueChange={setEstado}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="pendiente">Pendiente</SelectItem>
                    <SelectItem value="aprobado">Aprobado</SelectItem>
                    <SelectItem value="rechazado">Rechazado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm">Grupo</label>
                <Input value={grupo} onChange={(e) => setGrupo(e.target.value)} placeholder="A/B/C…" />
              </div>
              <div className="md:col-span-3 md:col-start-3">
                <label className="text-sm">Buscar (Nombre o DNI)</label>
                <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ej. Ana o 12345678" />
              </div>
            </div>
          )}

          {/* Tabla visible solo cuando hay ciclo seleccionado; si no, mostrar indicación */}
          {!ciclo ? (
            <div className="text-sm text-muted-foreground p-3 border rounded-md">
              Selecciona un ciclo para ver las inscripciones.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>DNI</TableHead>
                  <TableHead>Programa</TableHead>
                  <TableHead>Grupo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acceso</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtrados.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{r.nombre}</TableCell>
                    <TableCell>{r.dni}</TableCell>
                    <TableCell>{r.programa}</TableCell>
                    <TableCell>{r.grupo || "-"}</TableCell>
                    <TableCell className="capitalize">{r.estado}</TableCell>
                    <TableCell className="capitalize">{r.acceso}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Sheet open={edit?.id === r.id} onOpenChange={(open) => setEdit(open ? r : null)}>
                          <SheetTrigger asChild>
                            <Button size="sm" variant="outline">Editar</Button>
                          </SheetTrigger>
                          <SheetContent side="right">
                            <SheetHeader>
                              <SheetTitle>Editar estudiante</SheetTitle>
                            </SheetHeader>
                            {edit && (
                              <div className="p-4 space-y-3">
                                <div>
                                  <label className="text-sm">Nombre</label>
                                  <Input value={edit.nombre} onChange={(e) => setEdit({ ...edit, nombre: e.target.value })} />
                                </div>
                                <div>
                                  <label className="text-sm">Email</label>
                                  <Input type="email" value={edit.email} onChange={(e) => setEdit({ ...edit, email: e.target.value })} />
                                </div>
                                <div>
                                  <label className="text-sm">Grupo</label>
                                  <Input value={edit.grupo || ""} onChange={(e) => setEdit({ ...edit, grupo: e.target.value })} />
                                </div>
                                <div className="flex gap-2 pt-2">
                                  <Button onClick={guardarEdicion}>Guardar</Button>
                                  <Button variant="outline" onClick={() => setEdit(null)}>Cancelar</Button>
                                </div>
                              </div>
                            )}
                          </SheetContent>
                        </Sheet>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
