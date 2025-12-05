import { lazy, Suspense } from "react"
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom"
import Providers from "./Providers"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth, type Role } from "@/context/auth"
import AdminLayout from "@/app/admin/layout"

const LandingPage = lazy(() => import("@/app/landing/page"))
const LoginPage = lazy(() => import("@/app/login/page"))
const InscripcionPage = lazy(() => import("@/app/inscripcion/page"))
const PagosRegistroPage = lazy(() => import("@/app/pagos/registro/page"))
const AsistenciasDocentePage = lazy(() => import("@/app/asistencias/page"))
const AdminDashboardPage = lazy(() => import("@/app/dashboard/page"))
const AdminInscripciones = lazy(() => import("@/app/admin/inscripciones/page"))
const AdminPagos = lazy(() => import("@/app/admin/pagos/page"))
const AdminProgramas = lazy(() => import("@/app/admin/programas/page"))
const AdminCiclos = lazy(() => import("@/app/admin/ciclos/page"))
const AdminGrupos = lazy(() => import("@/app/admin/grupos/page"))
const AdminAsistencias = lazy(() => import("@/app/admin/asistencias/page"))
const AdminClases = lazy(() => import("@/app/admin/clases/page"))
const AdminAlumnos = lazy(() => import("@/app/admin/alumnos/page"))
const AdminReportes = lazy(() => import("@/app/admin/reportes/page"))
const AdminUsuario = lazy(() => import("@/app/admin/usuario/page"))
const AdminAuditoria = lazy(() => import("@/app/admin/auditoria/page"))
const AdminPublicidad = lazy(() => import("@/app/admin/publicidad/page"))

function Fallback() {
  return <div className="p-6"><Skeleton className="h-8 w-40 mb-4" /><Skeleton className="h-24 w-full" /></div>
}

function RequireRole({ roles, children }: Readonly<{ roles: Role[]; children: React.ReactNode }>) {
  const user = useAuth((s) => s.user)
  if (!user || (roles.length && !roles.includes(user.role))) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}

export function AppRoutes() {
  return (
    <Providers>
      <BrowserRouter>
        <Suspense fallback={<Fallback />}> 
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/inscripcion" element={<InscripcionPage />} />
            <Route path="/pagos/registro" element={<PagosRegistroPage />} />
            <Route path="/asistencias" element={<AsistenciasDocentePage />} />
            <Route path="/admin" element={<RequireRole roles={["admin"]}><AdminLayout /></RequireRole>}>
              <Route index element={<AdminDashboardPage />} />
              <Route path="inscripciones" element={<AdminInscripciones />} />
              <Route path="pagos" element={<AdminPagos />} />
              <Route path="programas" element={<AdminProgramas />} />
              <Route path="ciclos" element={<AdminCiclos />} />
              <Route path="grupos" element={<AdminGrupos />} />
              <Route path="asistencias" element={<AdminAsistencias />} />
              <Route path="clases" element={<AdminClases />} />
              <Route path="alumnos" element={<AdminAlumnos />} />
              <Route path="reportes" element={<AdminReportes />} />
              <Route path="usuario" element={<AdminUsuario />} />
              <Route path="auditoria" element={<AdminAuditoria />} />
              <Route path="publicidad" element={<AdminPublicidad />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </Providers>
  )
}

export default AppRoutes
