import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

type Cycle = {
  id: string
  name: string
  status: "abierto" | "cerrado"
  dates: string[] // ISO yyyy-mm-dd
  minPct: number // porcentaje mínimo de asistencia requerido
}

type Student = {
  id: string
  dni: string
  name: string
  group: string
  state: "regular" | "DPI"
}

// attendance[studentId][date] = true (asistió) | false (faltó)
type Attendance = Record<string, Record<string, boolean>>

// Mock de ciclos, estudiantes y asistencias
const CYCLES: Cycle[] = [
  { id: "2025-1", name: "2025-1", status: "cerrado", dates: ["2025-03-01", "2025-03-08", "2025-03-15", "2025-03-22", "2025-03-29"], minPct: 75 },
  { id: "2025-2", name: "2025-2", status: "abierto", dates: ["2025-10-01", "2025-10-08", "2025-10-15", "2025-10-22", "2025-10-29"], minPct: 80 },
]

const STUDENTS_BY_CYCLE: Record<string, Student[]> = {
  "2025-1": [
    { id: "S-100", dni: "12345678", name: "Ana Pérez", group: "A", state: "regular" },
    { id: "S-101", dni: "87654321", name: "Juan Díaz", group: "B", state: "regular" },
  ],
  "2025-2": [
    { id: "S-200", dni: "11223344", name: "María López", group: "A", state: "regular" },
    { id: "S-201", dni: "55667788", name: "Luis Vega", group: "A", state: "regular" },
    { id: "S-202", dni: "99887766", name: "Carla Soto", group: "B", state: "regular" },
  ],
}

const ATT_BY_CYCLE: Record<string, Attendance> = {
  "2025-1": {
    "S-100": { "2025-03-01": true, "2025-03-08": true, "2025-03-15": false, "2025-03-22": true, "2025-03-29": true },
    "S-101": { "2025-03-01": false, "2025-03-08": false, "2025-03-15": true, "2025-03-22": false, "2025-03-29": true },
  },
  "2025-2": {
    "S-200": { "2025-10-01": true, "2025-10-08": false, "2025-10-15": true, "2025-10-22": false, "2025-10-29": false },
    "S-201": { "2025-10-01": true, "2025-10-08": true, "2025-10-15": true, "2025-10-22": true, "2025-10-29": true },
    "S-202": { "2025-10-01": false, "2025-10-08": false, "2025-10-15": false, "2025-10-22": true, "2025-10-29": true },
  },
}

export default function Page() {
  const [selectedCycleId, setSelectedCycleId] = useState<string>("")
  const [cycles, setCycles] = useState<Cycle[]>(CYCLES)
  const [attendance, setAttendance] = useState<Record<string, Attendance>>(ATT_BY_CYCLE)
  const [filterOnlyUnderMin, setFilterOnlyUnderMin] = useState(false)
  const [filterRecurrent, setFilterRecurrent] = useState(false)
  const selected = useMemo(() => cycles.find(c => c.id === selectedCycleId), [cycles, selectedCycleId])
  const students = useMemo(() => (selected ? STUDENTS_BY_CYCLE[selected.id] : []), [selected])
  const dates = selected?.dates ?? []

  function computeStats(studentId: string) {
    const att = attendance[selectedCycleId]?.[studentId] || {}
    const total = dates.length
    const attended = dates.reduce((acc, d) => acc + (att[d] ? 1 : 0), 0)
    const pct = total ? Math.round((attended / total) * 100) : 0
    const consecAbs = longestConsecutiveAbsences(att)
    const recurrent = consecAbs >= 3 // regla: 3 inasistencias seguidas = recurrente
    const underMin = selected ? pct < selected.minPct : false
    return { attended, total, pct, recurrent, underMin }
  }

  function longestConsecutiveAbsences(att: Record<string, boolean>) {
    // Calcular en orden de fechas
    let max = 0
    let curr = 0
    for (const d of dates) {
      const v = att[d]
      if (v === false) {
        curr += 1
        if (curr > max) max = curr
      } else {
        curr = 0
      }
    }
    return max
  }

  function toggleAttendance(studentId: string, date: string, value: boolean) {
    setAttendance(prev => ({
      ...prev,
      [selectedCycleId]: {
        ...prev[selectedCycleId],
        [studentId]: { ...prev[selectedCycleId]?.[studentId], [date]: value },
      },
    }))
  }

  function markAll(date: string, value: boolean) {
    if (!selected) return
    setAttendance(prev => ({
      ...prev,
      [selected.id]: Object.fromEntries(
        students.map(s => [s.id, { ...prev[selected.id]?.[s.id], [date]: value }])
      ),
    }))
    toast.success(value ? "Todos presentes" : "Todos ausentes", { description: `Fecha ${date}` })
  }

  function applyDPIToUnderMin() {
    if (!selected) return
  const changed: Student[] = []
    STUDENTS_BY_CYCLE[selected.id] = STUDENTS_BY_CYCLE[selected.id].map(s => {
      const st = computeStats(s.id)
      if (st.underMin) {
        changed.push(s)
        return { ...s, state: "DPI" }
      }
      return s
    })
    setCycles([...cycles]) // trigger rerender
    toast.error(`DPI aplicado a ${changed.length} estudiante(s)`, { description: "Acceso a exámenes restringido" })
  }

  function setStudentState(studentId: string, newState: Student["state"]) {
    if (!selected) return
    STUDENTS_BY_CYCLE[selected.id] = STUDENTS_BY_CYCLE[selected.id].map(s => s.id === studentId ? { ...s, state: newState } : s)
    toast.message("Estado actualizado", { description: `${studentId} → ${newState}` })
  }

  function saveMinPct() {
    if (!selected) return
    toast.success("Límite mínimo guardado", { description: `${selected.minPct}%` })
  }

  const visibleStudents = students.filter(s => {
    const stats = computeStats(s.id)
    if (filterOnlyUnderMin && !stats.underMin) return false
    if (filterRecurrent && !stats.recurrent) return false
    return true
  })

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Lista de ciclos */}
      <Card>
        <CardHeader>
          <CardTitle>Ciclos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {cycles.map(c => (
              <button
                key={c.id}
                className={`text-left border rounded-md p-3 hover:bg-accent transition ${selectedCycleId === c.id ? "ring-2 ring-primary" : ""}`}
                onClick={() => setSelectedCycleId(c.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="font-medium">{c.name}</div>
                  <Badge variant={c.status === "abierto" ? "default" : "outline"} className="capitalize">
                    {c.status}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground mt-1">Sesiones: {c.dates.length}</div>
                <div className="text-xs text-muted-foreground">Mínimo asistencia: {c.minPct}%</div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Hoja de cálculo por ciclo */}
      {selected && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <CardTitle>Asistencias – {selected.name} <span className="text-sm text-muted-foreground">({selected.status})</span></CardTitle>
              <div className="flex items-end gap-2">
                <div>
                  <label className="text-xs">Mínimo asistencia (%)</label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={selected.minPct}
                      onChange={(e) => setCycles(prev => prev.map(c => c.id === selected.id ? { ...c, minPct: Number(e.target.value) } : c))}
                      className="w-24"
                    />
                    <Button size="sm" onClick={saveMinPct}>Guardar</Button>
                  </div>
                </div>
                <div>
                  <label className="text-xs">Ver</label>
                  <div className="flex gap-2">
                    <Button size="sm" variant={filterOnlyUnderMin ? "default" : "outline"} onClick={() => setFilterOnlyUnderMin(v => !v)}>Bajo mínimo</Button>
                    <Button size="sm" variant={filterRecurrent ? "default" : "outline"} onClick={() => setFilterRecurrent(v => !v)}>Recurrentes</Button>
                  </div>
                </div>
                <div>
                  <label className="text-xs">Acciones</label>
                  <div className="flex gap-2">
                    <Select onValueChange={(date) => markAll(date, true)}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Marcar todos PRESENTES" />
                      </SelectTrigger>
                      <SelectContent>
                        {dates.map(d => (
                          <SelectItem key={d} value={d}>{d}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select onValueChange={(date) => markAll(date, false)}>
                      <SelectTrigger className="w-44">
                        <SelectValue placeholder="Marcar todos AUSENTES" />
                      </SelectTrigger>
                      <SelectContent>
                        {dates.map(d => (
                          <SelectItem key={d} value={d}>{d}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button variant="destructive" size="sm" onClick={applyDPIToUnderMin}>Aplicar DPI a bajo mínimo</Button>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="w-full overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Estudiante</TableHead>
                    <TableHead>DNI</TableHead>
                    <TableHead>Grupo</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>%</TableHead>
                    <TableHead>Flag</TableHead>
                    {dates.map(d => (
                      <TableHead key={d} className="min-w-24 text-center">{d.slice(5)}</TableHead>
                    ))}
                    <TableHead>Acción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleStudents.map((s) => {
                    const att = attendance[selected.id]?.[s.id] || {}
                    const stats = computeStats(s.id)
                    return (
                      <TableRow key={s.id} className={`${stats.underMin ? "bg-amber-50" : ""}`}>
                        <TableCell>{s.name}</TableCell>
                        <TableCell>{s.dni}</TableCell>
                        <TableCell>{s.group}</TableCell>
                        <TableCell>
                          <Badge variant={s.state === "DPI" ? "destructive" : "outline"}>{s.state}</Badge>
                        </TableCell>
                        <TableCell>{stats.pct}%</TableCell>
                        <TableCell>
                          {stats.recurrent && <Badge variant="default">Recurrente</Badge>}
                          {stats.underMin && <Badge variant="destructive" className="ml-1">Bajo mínimo</Badge>}
                        </TableCell>
                        {dates.map(d => (
                          <TableCell key={d} className="text-center">
                            <Checkbox
                              checked={!!att[d]}
                              onCheckedChange={(v) => toggleAttendance(s.id, d, Boolean(v))}
                              aria-label={`Asistencia ${s.name} ${d}`}
                            />
                          </TableCell>
                        ))}
                        <TableCell>
                          <div className="flex gap-2">
                            {s.state === "DPI" ? (
                              <Button size="sm" variant="outline" onClick={() => setStudentState(s.id, "regular")}>Quitar DPI</Button>
                            ) : (
                              <Button size="sm" variant="secondary" onClick={() => setStudentState(s.id, "DPI")}>Marcar DPI</Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
