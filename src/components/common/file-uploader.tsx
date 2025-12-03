import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type FileUploaderProps = {
  accept?: string
  maxSizeMB?: number
  onChange: (file: File | null) => void
  value?: File | null
  label?: string
  id?: string
  className?: string
}

export function FileUploader({ accept = ".pdf,.jpg,.jpeg,.png", maxSizeMB = 5, onChange, value, label = "Seleccionar archivo", id, className }: FileUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)

  const handlePick = () => inputRef.current?.click()
  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0]
    if (!file) {
      onChange(null)
      return
    }
    const validTypes = accept.split(",").map((t) => t.trim().toLowerCase())
    const sizeOK = file.size <= maxSizeMB * 1024 * 1024
    const typeOK = validTypes.some((t) => {
      if (t.startsWith(".")) return file.name.toLowerCase().endsWith(t)
      return file.type.toLowerCase().includes(t.replace("/", ""))
    })
    if (!sizeOK || !typeOK) {
      // Reset input si no es válido
      if (inputRef.current) inputRef.current.value = ""
      onChange(null)
      return
    }
    onChange(file)
  }

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <input
        ref={inputRef}
        id={id}
        type="file"
        className="hidden"
        accept={accept}
        onChange={handleChange}
      />
      <Button type="button" onClick={handlePick}>
        {label}
      </Button>
      <div className="text-sm text-muted-foreground truncate">
        {value ? value.name : `Formatos permitidos: ${accept} · Máx ${maxSizeMB}MB`}
      </div>
    </div>
  )
}

export default FileUploader
