import { create } from "zustand"
import { persist } from "zustand/middleware"

export type Role = "admin" | "docente" | "user"

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
  updateProfile: (data: Partial<User>) => void
}

export const useAuth = create<State>()(
  persist(
    (set, get) => ({
      user: null,
      async login(email, password) {
        // 1. Login to get token
        const formData = new FormData()
        formData.append("username", email)
        formData.append("password", password)
        
        // We use fetch directly here or api.post but we need form data handling
        // api.post sends JSON by default. Let's use fetch or adjust api.
        // Since api wrapper is simple, let's use fetch for the token endpoint which is special
        
        const { BASE } = await import("@/services/http")
        const res = await fetch(`${BASE}/auth/login`, {
          method: "POST",
          body: formData,
        })
        
        if (!res.ok) throw new Error("Credenciales inválidas")
        
        const tokenData = await res.json()
        const token = tokenData.access_token
        
        // 2. Get User Profile
        const userRes = await fetch(`${BASE}/users/me`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        
        if (!userRes.ok) throw new Error("Error al obtener perfil")
        
        const userData = await userRes.json()
        
        // Map backend roles to frontend role
        // Prioritize admin > docente > user
        const roles = (userData.roles || []).map((r: { name: string }) => r.name)
        let roleName: Role = "user"
        
        if (roles.includes("admin")) {
          roleName = "admin"
        } else if (roles.includes("docente")) {
          roleName = "docente"
        }
        
        const user: User = {
          id: String(userData.id),
          name: userData.username,
          email: userData.email,
          role: roleName,
          token: token,
        }
        
        set({ user })
        return user
      },
      logout() {
        set({ user: null })
      },
      updateProfile(data) {
        const currentUser = get().user
        if (currentUser) {
          set({ user: { ...currentUser, ...data } })
        }
      }
    }),
    { name: "cbt-auth" }
  )
)
