import { IconInbox, type Icon } from "@tabler/icons-react"
import { Link } from "react-router-dom"

// Removed unused Button import
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { BandejaButton } from "@/components/admin/bandeja"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: Icon
  }[]
}) {
  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <BandejaButton
              trigger={
                <SidebarMenuButton
                  className="justify-start bg-[#7A1D1D] text-white hover:bg-[#6B1919] active:bg-[#6B1919] shadow-sm rounded-lg h-10"
                >
                  <IconInbox />
                  <span className="text-[15px] font-medium">Bandeja</span>
                </SidebarMenuButton>
              }
              label="Bandeja"
            />
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild tooltip={item.title}>
                <Link to={item.url}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
