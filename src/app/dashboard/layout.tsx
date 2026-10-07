import { AppSidebar } from "@/components/app-sidebar"
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-background">
        <header className="surface-glass sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b border-border/70 px-2.5 sm:h-16 sm:gap-3 sm:px-5">
          <SidebarTrigger className="-ml-1" />
          <div className="h-5 w-px bg-border/80" />
          <div className="min-w-0 flex-1">
            <p className="truncate font-accent text-sm font-semibold text-foreground">Sistem Guru</p>
            <p className="hidden truncate text-xs text-muted-foreground sm:block">Administrasi pembelajaran dalam satu tempat</p>
          </div>
        </header>
        <main className="flex-1 px-2.5 py-3 sm:px-5 sm:py-5 lg:px-8 lg:py-7">
          <div className="mx-auto w-full max-w-[1500px]">
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
