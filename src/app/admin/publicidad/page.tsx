import { useState, useEffect } from "react"
import { toast } from "sonner"
import { IconUpload, IconTrash } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { api, BASE } from "@/services/http"

export default function AdminPublicidadPage() {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchPublicity()
  }, [])

  const fetchPublicity = async () => {
    try {
      const res = await api.get<{ imageUrl: string | null }>("/publicity")
      setImageUrl(res.imageUrl)
    } catch (error) {
      console.error("Error fetching publicity:", error)
    }
  }

  // Fix URL: BASE points to /api, but static files are at root /static
  const serverUrl = BASE.endsWith("/api") ? BASE.slice(0, -4) : BASE

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append("file", file)

    setLoading(true)
    try {
      // We use fetch directly for FormData upload as our api wrapper is JSON focused
      const token = JSON.parse(localStorage.getItem("cbt-auth") || "{}")?.state?.user?.token
      
      const res = await fetch(`${BASE}/publicity`, {
        method: "POST",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      })

      if (!res.ok) throw new Error("Error al subir imagen")
      
      const data = await res.json()
      setImageUrl(data.imageUrl)
      toast.success("Publicidad actualizada")
    } catch (error) {
      toast.error("Error al subir la imagen")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("¿Estás seguro de eliminar la publicidad actual?")) return

    setLoading(true)
    try {
      await api.delete("/publicity")
      setImageUrl(null)
      toast.success("Publicidad eliminada")
    } catch (error) {
      toast.error("Error al eliminar")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Gestión de Publicidad</h1>
      </div>
      
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Banner Publicitario</CardTitle>
          <CardDescription>
            Sube una imagen que se mostrará como ventana emergente (popup) en la página de inicio.
            Solo se permite una imagen activa a la vez.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {imageUrl ? (
            <div className="space-y-4">
              <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-muted">
                <img 
                  src={`${serverUrl}${imageUrl}`} 
                  alt="Publicidad actual" 
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="flex justify-end">
                <Button variant="destructive" onClick={handleDelete} disabled={loading}>
                  <IconTrash className="mr-2 h-4 w-4" />
                  Eliminar Publicidad
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <IconUpload className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">No hay publicidad activa</h3>
              <p className="mb-4 mt-2 text-sm text-muted-foreground">
                Sube una imagen para activar el banner publicitario.
              </p>
              <div className="relative">
                <Button disabled={loading}>
                  {loading ? "Subiendo..." : "Seleccionar Imagen"}
                </Button>
                <input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 cursor-pointer opacity-0"
                  onChange={handleUpload}
                  disabled={loading}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
