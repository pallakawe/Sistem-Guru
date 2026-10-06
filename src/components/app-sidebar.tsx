'use client'

import * as React from "react"
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
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <BookOpen className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Sistem Guru</span>
                  <span className="truncate text-xs">Administrasi Terpadu</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu className="px-2 py-2 gap-1">
          {data.navMain.map((item) => {
            const isActive = pathname === item.url || pathname.startsWith(`${item.url}/`)
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                  <Link href={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout} tooltip="Keluar">
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
