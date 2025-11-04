import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"

type Mark = "P" | "T" | "F"

type Alumno = { nombre: string; dni: string; email: string; estado: string }
const alumnos: Alumno[] = [
  { nombre: "Ana Pérez", dni: "12345678", email: "ana@example.com", estado: "Inscrito" },
  { nombre: "Juan Díaz", dni: "87654321", email: "juan@example.com", estado: "Inscrito" },
]

const fechas = ["2025-10-20", "2025-10-21", "2025-10-22"]

export default function Page() {
  const [marcas, setMarcas] = useState<Record<string, Record<string, Mark>>>({})

  const setMarca = (dni: string, fecha: string, mark: Mark) => {
    setMarcas((prev) => ({
      ...prev,
      [dni]: { ...(prev[dni] || {}), [fecha]: mark },
    }))
  }

  const allPresent = useMemo(() => alumnos.every((a) => marcas[a.dni]?.[fechas[0]] === "P"), [marcas])

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Asistencias</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => alumnos.forEach((a) => setMarca(a.dni, fechas[0], "P"))}>Marcar presente (hoy)</Button>
          <Button size="sm" disabled={allPresent}>Guardar</Button>
        </div>
      </div>

      <div className="overflow-auto border rounded-lg">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="bg-muted/50">
              <th className="text-left p-2">Estudiante</th>
              <th className="text-left p-2">DNI</th>
              <th className="text-left p-2">Email</th>
              <th className="text-left p-2">Estado</th>
              {fechas.map((f) => (
                <th key={f} className="p-2 text-center">{f}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {alumnos.map((a) => (
              <tr key={a.dni} className="border-t">
                <td className="p-2">{a.nombre}</td>
                <td className="p-2">{a.dni}</td>
                <td className="p-2">{a.email}</td>
                <td className="p-2">{a.estado}</td>
                {fechas.map((f) => (
                  <td key={f} className="p-2">
                    <div className="flex items-center justify-center gap-2">
                      <label className="inline-flex items-center gap-1"><Checkbox checked={marcas[a.dni]?.[f] === "P"} onCheckedChange={() => setMarca(a.dni, f, "P")} /> P</label>
                      <label className="inline-flex items-center gap-1"><Checkbox checked={marcas[a.dni]?.[f] === "T"} onCheckedChange={() => setMarca(a.dni, f, "T")} /> T</label>
                      <label className="inline-flex items-center gap-1"><Checkbox checked={marcas[a.dni]?.[f] === "F"} onCheckedChange={() => setMarca(a.dni, f, "F")} /> F</label>
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
