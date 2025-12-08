import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogClose, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { api, BASE } from "@/services/http"
import { IconX } from "@tabler/icons-react"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"

export function PublicityModal() {
  const [open, setOpen] = useState(false)
  const [imageUrl, setImageUrl] = useState<string | null>(null)

  useEffect(() => {
    const checkPublicity = async () => {
      try {
        const res = await api.get<{ imageUrl: string | null }>("/publicity", { silentError: true })
        if (res.imageUrl) {
          setImageUrl(res.imageUrl)
          setOpen(true)
        }
      } catch (error) {
        // Ignore errors
      }
    }

    checkPublicity()
  }, [])

  if (!imageUrl) return null

  // Fix URL: BASE points to /api, but static files are at root /static
  // If BASE ends with /api, we strip it.
  const serverUrl = BASE.endsWith("/api") ? BASE.slice(0, -4) : BASE
  const fullImageUrl = `${serverUrl}${imageUrl}`

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-3xl p-0 overflow-hidden bg-transparent border-none shadow-none">
        <VisuallyHidden>
          <DialogTitle>Anuncio Publicitario</DialogTitle>
          <DialogDescription>Imagen promocional o aviso importante</DialogDescription>
        </VisuallyHidden>
        
        <div className="relative">
          <DialogClose className="absolute right-2 top-2 z-50 rounded-full bg-black/50 p-1 text-white hover:bg-black/70 transition-colors">
            <IconX className="h-6 w-6" />
            <span className="sr-only">Cerrar</span>
          </DialogClose>
          <img
            src={fullImageUrl}
            alt="Anuncio"
            className="w-full h-auto rounded-lg shadow-2xl"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
