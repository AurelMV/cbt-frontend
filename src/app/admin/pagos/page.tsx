import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"
// Bandeja ahora vive en el sidebar; no se muestra aquí

type Estado = "pendiente" | "aprobado" | "rechazado"
type Pago = { id: string; ciclo: string; dni: string; nombre: string; monto: number; fecha: string; banco: string; comprobante: string; estado: Estado }

const DATA: Pago[] = [
  { id: "P-901", ciclo: "2025-2", dni: "12345678", nombre: "Ana Pérez", monto: 150, fecha: "2025-10-20", banco: "BCP", comprobante: "C-1001", estado: "pendiente" },
  { id: "P-902", ciclo: "2025-2", dni: "87654321", nombre: "Juan Díaz", monto: 200, fecha: "2025-10-21", banco: "BBVA", comprobante: "C-1002", estado: "pendiente" },
  { id: "P-800", ciclo: "2025-1", dni: "11223344", nombre: "María López", monto: 180, fecha: "2025-05-21", banco: "Interbank", comprobante: "C-9988", estado: "aprobado" },
]

export default function Page() {
  // Filtrado por ciclo eliminado
  const [q, setQ] = useState("")
  const [rows, setRows] = useState<Pago[]>(DATA)
  const [edit, setEdit] = useState<Pago | null>(null)
  // Bandeja global: manejada por componente reutilizable

  const filtrados = useMemo(() => {
    return rows.filter(r => (!q || [r.nombre, r.dni, r.comprobante].some(f => f.toLowerCase().includes(q.toLowerCase()))))
  }, [rows, q])

  // Acciones de aprobar/rechazar removidas, solo queda edición
  const guardar = () => {
    if (!edit) return
    setRows(prev => prev.map(r => r.id === edit.id ? edit : r))
    toast.success("Pago actualizado")
    setEdit(null)
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Gestión de Pagos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-3">
              <label className="text-sm">Buscar (Nombre, DNI o Comprobante)</label>
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ej. Ana o 12345678 o C-1001" />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Estudiante</TableHead>
                <TableHead>DNI</TableHead>
                <TableHead>Ciclo</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtrados.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{r.id}</TableCell>
                  <TableCell>{r.nombre}</TableCell>
                  <TableCell>{r.dni}</TableCell>
                  <TableCell>{r.ciclo}</TableCell>
                  <TableCell>{r.fecha}</TableCell>
                  <TableCell>S/ {r.monto.toFixed(2)}</TableCell>
                  <TableCell className="capitalize">{r.estado}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Sheet open={edit?.id === r.id} onOpenChange={(open) => setEdit(open ? r : null)}>
                        <SheetTrigger asChild>
                          <Button size="sm" variant="outline">Editar</Button>
                        </SheetTrigger>
                        <SheetContent side="right">
                          <SheetHeader>
                            <SheetTitle>Pago {r.id}</SheetTitle>
                          </SheetHeader>
                          {edit && (
                            <div className="p-4 space-y-3">
                              <div>
                                <label className="text-sm">Comprobante</label>
                                <Input value={edit.comprobante} onChange={(e) => setEdit({ ...edit, comprobante: e.target.value })} />
                              </div>
                              <div>
                                <label className="text-sm">Fecha</label>
                                <Input type="date" value={edit.fecha} onChange={(e) => setEdit({ ...edit, fecha: e.target.value })} />
                              </div>
                              <div>
                                <label className="text-sm">Monto</label>
                                <Input type="number" min={0} step="0.01" value={edit.monto} onChange={(e) => setEdit({ ...edit, monto: Number(e.target.value) })} />
                              </div>
                              <div>
                                <label className="text-sm">Banco</label>
                                <Input value={edit.banco} onChange={(e) => setEdit({ ...edit, banco: e.target.value })} />
                              </div>
                              <div className="flex gap-2 pt-2">
                                <Button onClick={guardar}>Guardar</Button>
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
        </CardContent>
      </Card>
    </div>
  )
}
