import { create } from "zustand"
import { persist } from "zustand/middleware"

export type Role = "admin" | "docente"

export type User = {
  id: string
  name: string
  email: string
  role: Role
  token: string
}

type State = {
  user: User | null
  login: (email: string, password: string) => Promise<User>
  logout: () => void
}

// Cuentas de prueba (mock)
const ACCOUNTS: Array<{ email: string; password: string; name: string; role: Role }> = [
  { email: "admin@cbt.edu.pe", password: "Admin123*", name: "Admin CBT", role: "admin" },
  { email: "docente@cbt.edu.pe", password: "Docente123*", name: "Docente CBT", role: "docente" },
]

export const useAuth = create<State>()(
  persist(
    (set) => ({
      user: null,
      async login(email, password) {
        // Simulación de verificación contra ACCOUNTS
        const found = ACCOUNTS.find((a) => a.email.toLowerCase() === email.toLowerCase() && a.password === password)
        await new Promise((r) => setTimeout(r, 400))
        if (!found) {
          throw new Error("Credenciales inválidas")
        }
        const user: User = {
          id: crypto.randomUUID(),
          name: found.name,
          email: found.email,
          role: found.role,
          token: Math.random().toString(36).slice(2),
        }
        set({ user })
        return user
      },
      logout() {
        set({ user: null })
      },
    }),
    { name: "cbt-auth" }
  )
)
