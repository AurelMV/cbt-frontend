import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { useAuth } from "@/context/auth"
import { api } from "@/services/http"

const schema = z.object({
  username: z.string().min(3, "Mínimo 3 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface EditProfileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditProfileDialog({ open, onOpenChange }: EditProfileDialogProps) {
  const { user, updateProfile } = useAuth()
  const [loading, setLoading] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      username: user?.name || "",
      email: user?.email || "",
      password: "",
    },
  })

  const onSubmit = async (data: FormValues) => {
    setLoading(true)
    try {
      const payload: any = {
        username: data.username,
        email: data.email,
      }
      if (data.password && data.password.trim() !== "") {
        payload.password = data.password
      }

      const updatedUser = await api.put<any>("/users/me", payload)
      
      updateProfile({
        name: updatedUser.username,
        email: updatedUser.email,
      })
      
      toast.success("Perfil actualizado correctamente")
      onOpenChange(false)
    } catch (error) {
      console.error(error)
      // toast.error handled by api wrapper
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Perfil</DialogTitle>
          <DialogDescription>
            Actualiza tu información personal aquí.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          <Field>
            <FieldLabel>Nombre de Usuario</FieldLabel>
            <FieldContent>
              <Input {...form.register("username")} />
              <FieldError errors={[form.formState.errors.username]} />
            </FieldContent>
          </Field>
          
          <Field>
            <FieldLabel>Email</FieldLabel>
            <FieldContent>
              <Input {...form.register("email")} type="email" />
              <FieldError errors={[form.formState.errors.email]} />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel>Nueva Contraseña (Opcional)</FieldLabel>
            <FieldContent>
              <Input {...form.register("password")} type="password" placeholder="Dejar en blanco para mantener la actual" />
              <FieldError errors={[form.formState.errors.password]} />
            </FieldContent>
          </Field>

          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar Cambios
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
