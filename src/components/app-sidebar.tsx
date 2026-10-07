'use client'

import * as React from "react"
import Image from "next/image"
import {
  BookOpen,
  CalendarDays,
  FileText,
  FolderOpen,
  GraduationCap,
  LayoutDashboard,
  Library,
  Settings,
  Users,
  CheckSquare,
  LogOut,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Kelas & Siswa",
      url: "/dashboard/classes",
      icon: Users,
    },
    {
      title: "Jadwal",
      url: "/dashboard/schedules",
      icon: CalendarDays,
    },
    {
      title: "Absensi",
      url: "/dashboard/attendance",
      icon: CheckSquare,
    },
    {
      title: "Jurnal Mengajar",
      url: "/dashboard/journals",
      icon: BookOpen,
    },
    {
      title: "Perangkat Pembelajaran",
      url: "/dashboard/learning-devices",
      icon: FolderOpen,
    },
    {
      title: "Bahan Ajar",
      url: "/dashboard/materials",
      icon: Library,
    },
    {
      title: "Penilaian",
      url: "/dashboard/assessments",
      icon: GraduationCap,
    },
    {
      title: "Dokumen",
      url: "/dashboard/documents",
      icon: FileText,
    },
    {
      title: "Pengaturan",
      url: "/dashboard/settings",
      icon: Settings,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const router = useRouter()
  const { setOpenMobile } = useSidebar()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border/80" {...props}>
      <SidebarHeader className="border-b border-sidebar-border/70 p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/dashboard" />}>
                <Image
                  src="/logo-sistem-guru.png"
                  alt="Logo Sistem Guru"
                  width={32}
                  height={32}
                  className="size-9 object-contain drop-shadow-sm transition-transform duration-150 group-hover/menu-button:scale-105"
                />
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-heading font-bold tracking-tight">Sistem Guru</span>
                  <span className="truncate text-[11px] text-muted-foreground">Administrasi Terpadu</span>
                </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="py-2">
        <SidebarMenu className="gap-1 px-2 py-1">
          {data.navMain.map((item) => {
            const isActive = pathname === item.url || pathname.startsWith(`${item.url}/`)
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  isActive={isActive}
                  tooltip={item.title}
                  className="h-10 rounded-xl px-3 font-accent font-medium transition-all duration-150 hover:translate-x-0.5 data-[active=true]:bg-primary/10 data-[active=true]:text-primary data-[active=true]:shadow-sm"
                  render={<Link href={item.url} onClick={() => setOpenMobile(false)} />}
                >
                    <item.icon />
                    <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border/70 p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="h-10 rounded-xl transition-colors hover:bg-destructive/10" onClick={handleLogout} tooltip="Keluar">
              <LogOut className="text-destructive" />
              <span className="text-destructive">Keluar</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
