import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table } from "@/components/ui/table"
import { toast } from "sonner"

type Programa = { id: string; nombre: string; descripcion?: string; activo: boolean }

export default function Page() {
  const [programas, setProgramas] = useState<Programa[]>([
    { id: "PR-1", nombre: "Programa 1", activo: true },
    { id: "PR-2", nombre: "Programa 2", activo: true },
  ])
  const [nombre, setNombre] = useState("")

  const crear = () => {
    if (!nombre.trim()) return
    const nuevo = { id: `PR-${programas.length + 1}`, nombre, activo: true }
    setProgramas((p) => [...p, nuevo])
    setNombre("")
    toast.success("Programa creado")
  }

  const toggle = (id: string) => {
    setProgramas((p) => p.map((x) => (x.id === id ? { ...x, activo: !x.activo } : x)))
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Programas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input placeholder="Nombre del programa" value={nombre} onChange={(e) => setNombre(e.target.value)} />
            <Button onClick={crear}>Crear</Button>
          </div>
          <div className="overflow-auto">
            <Table>
              <thead>
                <tr>
                  <th className="text-left p-2">ID</th>
                  <th className="text-left p-2">Nombre</th>
                  <th className="text-left p-2">Estado</th>
                  <th className="text-left p-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {programas.map((p) => (
                  <tr key={p.id} className="border-t">
                    <td className="p-2">{p.id}</td>
                    <td className="p-2">{p.nombre}</td>
                    <td className="p-2">{p.activo ? "Activo" : "Inactivo"}</td>
                    <td className="p-2">
                      <Button size="sm" variant="outline" onClick={() => toggle(p.id)}>
                        {p.activo ? "Desactivar" : "Activar"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
