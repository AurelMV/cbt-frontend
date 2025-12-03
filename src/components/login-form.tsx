import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { useAuth } from "@/context/auth"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const login = useAuth((s) => s.login)

  const onSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const email = (form.get("email") as string) ?? ""
    const password = (form.get("password") as string) ?? ""
    setLoading(true)
    void (async () => {
      try {
        const user = await login(email, password)
        toast.success("Bienvenido", { description: `${user.name} (${user.role})` })
        if (user.role === "admin") navigate("/admin")
        else navigate("/asistencias")
      } catch {
        toast.error("Credenciales inválidas")
      } finally {
        setLoading(false)
      }
    })()
  }
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Iniciar sesión</CardTitle>
          <CardDescription>
            Ingrese su correo electrónico para acceder a su cuenta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Correo electrónico</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  name="email"
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Contraseña</FieldLabel>
                  <button
                    type="button"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline text-left"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
                <Input id="password" type="password" required name="password" />
              </Field>
              <Field>
                <Button type="submit" disabled={loading} className="w-full">{loading ? "Ingresando…" : "Ingresar"}</Button>
                <FieldDescription className="text-center">
                  ¿No tienes una cuenta? <button type="button" className="underline underline-offset-4">Regístrate</button>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
