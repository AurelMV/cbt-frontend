import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const logs = [
  { ts: "2025-10-21 10:20", actor: "admin@cbt.edu.pe", action: "Aprobó inscripción I-001" },
  { ts: "2025-10-21 11:05", actor: "admin@cbt.edu.pe", action: "Validó pago P-901" },
]

export default function Page() {
  return (
    <div className="p-4 md:p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Auditoría (acciones)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {logs.map((l, i) => (
            <div key={i} className="text-sm">
              <span className="text-muted-foreground">{l.ts}</span> · <strong>{l.actor}</strong> — {l.action}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
