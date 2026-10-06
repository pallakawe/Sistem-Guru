import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, BookOpen, GraduationCap, CalendarDays, FileText, Library } from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Selamat Datang, Guru</h1>
        <p className="text-muted-foreground">
          Tahun Ajaran Aktif: 2026/2027
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jumlah Kelas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jumlah Siswa</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">142</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jadwal Hari Ini</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Modul Ajar</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Jadwal Mengajar Hari Ini</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Dummy data */}
              <div className="flex items-center gap-4 rounded-lg border p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold">
                  08:00
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold">X RPL 1</h4>
                  <p className="text-sm text-muted-foreground">Informatika</p>
                </div>
                <div className="text-sm text-muted-foreground">
                  Ruang 101
                </div>
              </div>
              <div className="flex items-center gap-4 rounded-lg border p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold">
                  10:00
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold">XI RPL 2</h4>
                  <p className="text-sm text-muted-foreground">Informatika</p>
                </div>
                <div className="text-sm text-muted-foreground">
                  Ruang 105
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Akses Cepat</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <a href="/dashboard/attendance" className="flex flex-col items-center justify-center gap-2 rounded-lg border p-4 text-center hover:bg-muted">
              <BookOpen className="h-6 w-6 text-primary" />
              <span className="text-sm font-medium">Absensi</span>
            </a>
            <a href="/dashboard/journals" className="flex flex-col items-center justify-center gap-2 rounded-lg border p-4 text-center hover:bg-muted">
              <FileText className="h-6 w-6 text-primary" />
              <span className="text-sm font-medium">Jurnal</span>
            </a>
            <a href="/dashboard/assessments" className="flex flex-col items-center justify-center gap-2 rounded-lg border p-4 text-center hover:bg-muted">
              <GraduationCap className="h-6 w-6 text-primary" />
              <span className="text-sm font-medium">Input Nilai</span>
            </a>
            <a href="/dashboard/materials" className="flex flex-col items-center justify-center gap-2 rounded-lg border p-4 text-center hover:bg-muted">
              <Library className="h-6 w-6 text-primary" />
              <span className="text-sm font-medium">Bahan Ajar</span>
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
