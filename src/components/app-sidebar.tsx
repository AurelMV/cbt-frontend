import * as React from "react"
import {
  IconDashboard,
  IconDatabase,
  IconInnerShadowTop,
  IconReport,
  IconClipboardList,
  IconCash,
  IconBook,
  IconCalendarMonth,
  IconCheckupList,
  IconFileAnalytics,
  IconUserEdit,
  IconHistory
} from "@tabler/icons-react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    { title: "Dashboard", url: "/admin", icon: IconDashboard },
    { title: "Inscripciones", url: "/admin/inscripciones", icon: IconClipboardList },
    { title: "Pagos", url: "/admin/pagos", icon: IconCash },
    { title: "Programas", url: "/admin/programas", icon: IconBook },
    { title: "Ciclos", url: "/admin/ciclos", icon: IconCalendarMonth },
    { title: "Asistencias", url: "/admin/asistencias", icon: IconCheckupList },
    { title: "Reportes", url: "/admin/reportes", icon: IconFileAnalytics },
    { title: "Usuario", url: "/admin/usuario", icon: IconUserEdit },
    { title: "Auditoría", url: "/admin/auditoria", icon: IconHistory },
  ],
  navSecondary: [
    // Limpiado: sin atajos sin funcionalidad
  ],
  documents: [
    { name: "Base de datos", url: "/admin", icon: IconDatabase },
    { name: "Reportes", url: "/admin/reportes", icon: IconReport },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <a href="#">
                <IconInnerShadowTop className="size-5!" />
                <span className="text-base font-semibold">Acme Inc.</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
