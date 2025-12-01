import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { FileSpreadsheet, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";

const AVAILABLE_COLUMNS = [
  { id: "Codigo", label: "Código" },
  { id: "DNI", label: "DNI" },
  { id: "Alumno", label: "Alumno" },
  { id: "Programa", label: "Programa" },
  { id: "Clase", label: "Clase" },
  { id: "Grupo", label: "Grupo" },
  { id: "Ciclo", label: "Ciclo" },
  { id: "Telefono", label: "Teléfono" },
  { id: "Email", label: "Email" },
  { id: "Direccion", label: "Dirección" },
];

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityType: "ciclo" | "grupo" | "clase";
  entityId: number | null;
  title?: string;
}

export function ExportDialog({
  open,
  onOpenChange,
  entityType,
  entityId,
  title = "Exportar Reporte",
}: ExportDialogProps) {
  const [selectedColumns, setSelectedColumns] = useState<string[]>([
    "Codigo",
    "DNI",
    "Alumno",
    "Programa",
    "Clase",
    "Telefono",
  ]);
  const [loading, setLoading] = useState<"pdf" | "excel" | null>(null);

  const handleColumnToggle = (columnId: string) => {
    setSelectedColumns((prev) =>
      prev.includes(columnId)
        ? prev.filter((id) => id !== columnId)
        : [...prev, columnId]
    );
  };

  const handleExport = async (format: "pdf" | "excel") => {
    if (!entityId) return;
    if (selectedColumns.length === 0) {
      toast.error("Selecciona al menos una columna");
      return;
    }

    setLoading(format);
    try {
      const columnsParam = selectedColumns.join(",");
      const url = `/reports/${entityType}/${entityId}/export?format=${format}&columns=${columnsParam}`;
      
      // We need to download the file. 
      // Since api.get returns JSON by default in our wrapper, we might need a direct fetch or handle blob.
      // Assuming api.get can handle blob or we use window.open for simplicity, 
      // but window.open doesn't allow setting headers easily if needed (auth).
      // Let's use a fetch with the auth token if available.
      
      // For now, let's try constructing the URL with the base API URL.
      // If the API is on the same domain/proxy:
      const fullUrl = `${import.meta.env.VITE_API_URL || "http://localhost:8000/api"}${url}`;
      
      // Using a hidden link to trigger download
      const link = document.createElement('a');
      link.href = fullUrl;
      link.setAttribute('download', `reporte.${format === 'pdf' ? 'pdf' : 'xlsx'}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`Reporte ${format.toUpperCase()} generado`);
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast.error("Error al generar el reporte");
    } finally {
      setLoading(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Selecciona los datos que deseas incluir en el reporte.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            {AVAILABLE_COLUMNS.map((col) => (
              <div key={col.id} className="flex items-center space-x-2">
                <Checkbox
                  id={col.id}
                  checked={selectedColumns.includes(col.id)}
                  onCheckedChange={() => handleColumnToggle(col.id)}
                />
                <Label htmlFor={col.id} className="text-sm font-normal cursor-pointer">
                  {col.label}
                </Label>
              </div>
            ))}
          </div>
        </div>
        <DialogFooter className="flex sm:justify-between gap-2">
          <Button
            variant="outline"
            className="flex-1 gap-2"
            onClick={() => handleExport("excel")}
            disabled={!!loading}
          >
            {loading === "excel" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileSpreadsheet className="h-4 w-4 text-green-600" />
            )}
            Excel
          </Button>
          <Button
            className="flex-1 gap-2"
            onClick={() => handleExport("pdf")}
            disabled={!!loading}
          >
            {loading === "pdf" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileText className="h-4 w-4" />
            )}
            PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
