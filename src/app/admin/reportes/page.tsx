import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function Page() {
  const [tipo, setTipo] = useState("")
  const [ciclo, setCiclo] = useState("")

  const exportar = () => {
    const blob = new Blob([`Reporte ${tipo} - ciclo ${ciclo}`], { type: "application/pdf" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `reporte-${tipo || "general"}.pdf`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Información y Reportes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-sm">Tipo</label>
              <Select value={tipo} onValueChange={setTipo}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inscripciones">Inscripciones</SelectItem>
                  <SelectItem value="pagos">Pagos</SelectItem>
                  <SelectItem value="asistencias">Asistencias</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm">Ciclo</label>
              <Input placeholder="2025-2" value={ciclo} onChange={(e) => setCiclo(e.target.value)} />
            </div>
            <div className="flex items-end">
              <Button onClick={exportar}>Exportar PDF</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
