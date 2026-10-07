import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, BookOpen, GraduationCap, CalendarDays, FileText, Library } from "lucide-react"
import { createClient } from "@/lib/supabase/server"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()

  const teacherId = userData?.user?.id
  if (!teacherId) return null

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, active_academic_year_id")
    .eq("id", teacherId)
    .single()

  const activeYearId = profile?.active_academic_year_id || null
  const { data: activeYear } = activeYearId
    ? await supabase.from("academic_years").select("name, semester").eq("id", activeYearId).maybeSingle()
    : { data: null }

  const classesQuery = supabase
    .from("classes")
    .select("id, students(count)")
    .eq("teacher_id", teacherId)

  const devicesQuery = supabase
    .from("learning_devices")
    .select("id", { count: "exact", head: true })
    .eq("teacher_id", teacherId)

  if (activeYearId) {
    classesQuery.eq("academic_year_id", activeYearId)
    devicesQuery.eq("academic_year_id", activeYearId)
  }

  const jsDay = new Date().getDay()
  const dayOfWeek = jsDay === 0 ? 7 : jsDay

  const scheduleQuery = supabase
    .from("schedules")
    .select("id, start_time, end_time, room, classes(name), subjects(name)")
    .eq("teacher_id", teacherId)
    .eq("day_of_week", dayOfWeek)
    .order("start_time")

  if (activeYearId) scheduleQuery.eq("academic_year_id", activeYearId)

  const [classesRes, devicesRes, schedulesRes] = await Promise.all([
    classesQuery,
    devicesQuery,
    scheduleQuery,
  ])

  const classes = classesRes.data || []
  const classCount = classes.length
  const studentCount = classes.reduce((sum, item: any) => sum + ((item.students as any[])?.[0]?.count || 0), 0)
  const schedules = schedulesRes.data || []
  const teacherName = profile?.full_name || "Guru"

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Selamat Datang, {teacherName}</h1>
        <p className="text-muted-foreground">
          {activeYear
            ? `Tahun Ajaran Aktif: ${activeYear.name} - ${activeYear.semester}`
            : "Tahun ajaran aktif belum diatur."}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jumlah Kelas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{classCount}</div></CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jumlah Siswa</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{studentCount}</div></CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jadwal Hari Ini</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{schedules.length}</div></CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Perangkat Pembelajaran</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{devicesRes.count || 0}</div></CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader><CardTitle>Jadwal Mengajar Hari Ini</CardTitle></CardHeader>
          <CardContent>
            {schedules.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">Tidak ada jadwal mengajar hari ini.</p>
            ) : (
              <div className="space-y-4">
                {schedules.map((schedule: any) => (
                  <div key={schedule.id} className="flex items-center gap-4 rounded-lg border p-4">
                    <div className="flex min-w-16 items-center justify-center rounded-lg bg-primary/10 px-2 py-3 font-bold text-primary">
                      {String(schedule.start_time).slice(0, 5)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{schedule.classes?.name || "Kelas"}</h4>
                      <p className="text-sm text-muted-foreground">{schedule.subjects?.name || "Mata Pelajaran"}</p>
                    </div>
                    <div className="text-sm text-muted-foreground">{schedule.room || "—"}</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader><CardTitle>Akses Cepat</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <Link href="/dashboard/attendance" className="flex flex-col items-center justify-center gap-2 rounded-lg border p-4 text-center hover:bg-muted">
              <BookOpen className="h-6 w-6 text-primary" /><span className="text-sm font-medium">Absensi</span>
            </Link>
            <Link href="/dashboard/journals" className="flex flex-col items-center justify-center gap-2 rounded-lg border p-4 text-center hover:bg-muted">
              <FileText className="h-6 w-6 text-primary" /><span className="text-sm font-medium">Jurnal</span>
            </Link>
            <Link href="/dashboard/assessments" className="flex flex-col items-center justify-center gap-2 rounded-lg border p-4 text-center hover:bg-muted">
              <GraduationCap className="h-6 w-6 text-primary" /><span className="text-sm font-medium">Input Nilai</span>
            </Link>
            <Link href="/dashboard/materials" className="flex flex-col items-center justify-center gap-2 rounded-lg border p-4 text-center hover:bg-muted">
              <Library className="h-6 w-6 text-primary" /><span className="text-sm font-medium">Bahan Ajar</span>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
