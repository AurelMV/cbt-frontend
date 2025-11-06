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

  const onSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const email = String(form.get("email") || "")
    const password = String(form.get("password") || "")
    setLoading(true)
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
  }
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
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
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input id="password" type="password" required name="password" />
              </Field>
              <Field>
                <Button type="submit" disabled={loading}>{loading ? "Ingresando…" : "Login"}</Button>
                <Button variant="outline" type="button" disabled={loading}>
                  Login with Google
                </Button>
                <FieldDescription className="text-center">
                  Don&apos;t have an account? <a href="#">Sign up</a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
