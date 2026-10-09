import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, BookOpen, GraduationCap, CalendarDays, FileText, Library } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { DashboardStats } from "./dashboard-stats"

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

  const localNow = new Date(Date.now() + 8 * 60 * 60 * 1000)
  const localDay = localNow.getUTCDay() || 7
  const weekStart = new Date(localNow)
  weekStart.setUTCDate(localNow.getUTCDate() - localDay + 1)
  const weekEnd = new Date(weekStart)
  weekEnd.setUTCDate(weekStart.getUTCDate() + 6)
  const dateKey = (date: Date) => date.toISOString().slice(0, 10)

  const journalCountQuery = supabase
    .from("teaching_journals")
    .select("id, meetings!inner(academic_year_id)", { count: "exact", head: true })
    .eq("teacher_id", teacherId)

  const dailyAttendanceWeekQuery = supabase
    .from("daily_attendance")
    .select("id, attendance_date")
    .eq("teacher_id", teacherId)
    .gte("attendance_date", dateKey(weekStart))
    .lte("attendance_date", dateKey(weekEnd))
    .order("attendance_date")

  const assessmentIdsQuery = supabase
    .from("assessments")
    .select("id")
    .eq("teacher_id", teacherId)

  if (activeYearId) {
    journalCountQuery.eq("meetings.academic_year_id", activeYearId)
    dailyAttendanceWeekQuery.eq("academic_year_id", activeYearId)
    assessmentIdsQuery.eq("academic_year_id", activeYearId)
  }

  const recentJournalsQuery = supabase
    .from("teaching_journals")
    .select("id, topic, created_at, meetings(classes(name))")
    .eq("teacher_id", teacherId)
    .order("created_at", { ascending: false })
    .limit(4)

  const recentAssessmentsQuery = supabase
    .from("assessments")
    .select("id, title, created_at, classes(name)")
    .eq("teacher_id", teacherId)
    .order("created_at", { ascending: false })
    .limit(4)

  const recentDocumentsQuery = supabase
    .from("documents")
    .select("id, title, created_at")
    .eq("teacher_id", teacherId)
    .order("created_at", { ascending: false })
    .limit(4)

  const recentMaterialsQuery = supabase
    .from("learning_materials")
    .select("id, title, created_at, classes(name)")
    .eq("teacher_id", teacherId)
    .order("created_at", { ascending: false })
    .limit(4)

  const [
    classesRes,
    devicesRes,
    schedulesRes,
    journalCountRes,
    weekAttendanceRes,
    assessmentIdsRes,
    recentJournalsRes,
    recentAssessmentsRes,
    recentDocumentsRes,
    recentMaterialsRes,
  ] = await Promise.all([
    classesQuery,
    devicesQuery,
    scheduleQuery,
    journalCountQuery,
    dailyAttendanceWeekQuery,
    assessmentIdsQuery,
    recentJournalsQuery,
    recentAssessmentsQuery,
    recentDocumentsQuery,
    recentMaterialsQuery,
  ])

  const weekAttendance = weekAttendanceRes.data || []
  const attendanceToDate = new Map<string, string>()
  weekAttendance.forEach((attendance: any) => {
    attendanceToDate.set(attendance.id, attendance.attendance_date)
  })
  const attendanceIds = Array.from(attendanceToDate.keys())
  const assessmentIds = (assessmentIdsRes.data || []).map((item: any) => item.id)

  const [attendanceRecordsRes, scoresRes] = await Promise.all([
    attendanceIds.length
      ? supabase.from("daily_attendance_records").select("daily_attendance_id, status").in("daily_attendance_id", attendanceIds)
      : Promise.resolve({ data: [] as any[] }),
    assessmentIds.length
      ? supabase.from("assessment_scores").select("score").in("assessment_id", assessmentIds)
      : Promise.resolve({ data: [] as any[] }),
  ])

  const classes = classesRes.data || []
  const classCount = classes.length
  const studentCount = classes.reduce((sum, item: any) => sum + ((item.students as any[])?.[0]?.count || 0), 0)
  const schedules = schedulesRes.data || []
  const teacherName = profile?.full_name || "Guru"

  const dayLabels = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"]
  const attendanceStats = dayLabels.map((day, index) => {
    const date = new Date(weekStart)
    date.setUTCDate(weekStart.getUTCDate() + index)
    const key = dateKey(date)
    const result = { day, H: 0, S: 0, I: 0, A: 0 }
    ;(attendanceRecordsRes.data || []).forEach((record: any) => {
      if (attendanceToDate.get(record.daily_attendance_id) === key && record.status in result) {
        result[record.status as "H" | "S" | "I" | "A"] += 1
      }
    })
    return result
  })

  const scoreBuckets = [
    { range: "<60", count: 0 },
    { range: "60–69", count: 0 },
    { range: "70–79", count: 0 },
    { range: "80–89", count: 0 },
    { range: "90–100", count: 0 },
  ]
  ;(scoresRes.data || []).forEach((item: any) => {
    const score = Number(item.score)
    if (!Number.isFinite(score)) return
    if (score < 60) scoreBuckets[0].count += 1
    else if (score < 70) scoreBuckets[1].count += 1
    else if (score < 80) scoreBuckets[2].count += 1
    else if (score < 90) scoreBuckets[3].count += 1
    else scoreBuckets[4].count += 1
  })

  const recentActivities = [
    ...(recentJournalsRes.data || []).map((item: any) => ({
      id: `journal-${item.id}`,
      type: "Jurnal",
      title: item.topic || "Jurnal mengajar",
      detail: item.meetings?.classes?.name || "Kegiatan pembelajaran",
      createdAt: item.created_at,
    })),
    ...(recentAssessmentsRes.data || []).map((item: any) => ({
      id: `assessment-${item.id}`,
      type: "Penilaian",
      title: item.title || "Komponen penilaian",
      detail: item.classes?.name || "Penilaian kelas",
      createdAt: item.created_at,
    })),
    ...(recentDocumentsRes.data || []).map((item: any) => ({
      id: `document-${item.id}`,
      type: "Dokumen",
      title: item.title || "Dokumen",
      detail: "Dokumen administrasi",
      createdAt: item.created_at,
    })),
    ...(recentMaterialsRes.data || []).map((item: any) => ({
      id: `material-${item.id}`,
      type: "Bahan Ajar",
      title: item.title || "Bahan ajar",
      detail: item.classes?.name || "Materi pembelajaran",
      createdAt: item.created_at,
    })),
  ]
    .filter((item) => item.createdAt)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6)

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Selamat Datang, {teacherName}</h1>
        <p className="text-muted-foreground">
          {activeYear
            ? `Tahun Ajaran Aktif: ${activeYear.name} - ${activeYear.semester}`
            : "Tahun ajaran aktif belum diatur."}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="min-w-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jumlah Kelas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{classCount}</div></CardContent>
        </Card>

        <Card className="min-w-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jumlah Siswa</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{studentCount}</div></CardContent>
        </Card>

        <Card className="min-w-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jadwal Hari Ini</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{schedules.length}</div></CardContent>
        </Card>

        <Card className="min-w-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Perangkat Pembelajaran</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{devicesRes.count || 0}</div></CardContent>
        </Card>
      </div>

      <DashboardStats
        attendance={attendanceStats}
        journalCount={journalCountRes.count || 0}
        scoreDistribution={scoreBuckets}
        recentActivities={recentActivities}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="min-w-0 md:col-span-2 lg:col-span-4">
          <CardHeader><CardTitle>Jadwal Mengajar Hari Ini</CardTitle></CardHeader>
          <CardContent>
            {schedules.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">Tidak ada jadwal mengajar hari ini.</p>
            ) : (
              <div className="space-y-4">
                {schedules.map((schedule: any) => (
                  <div key={schedule.id} className="flex flex-col items-start gap-3 rounded-xl border p-3 sm:flex-row sm:items-center sm:gap-4 sm:p-4">
                    <div className="flex min-w-16 items-center justify-center rounded-lg bg-primary/10 px-2 py-3 font-bold text-primary">
                      {String(schedule.start_time).slice(0, 5)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold">{schedule.classes?.name || "Kelas"}</h4>
                      <p className="text-sm text-muted-foreground">{schedule.subjects?.name || "Mata Pelajaran"}</p>
                    </div>
                    <div className="text-xs text-muted-foreground sm:text-sm">{schedule.room || "—"}</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="min-w-0 md:col-span-2 lg:col-span-3">
          <CardHeader><CardTitle>Akses Cepat</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-2 sm:gap-4">
            <Link href="/dashboard/attendance" className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-xl border p-3 text-center transition-colors hover:bg-muted sm:p-4">
              <BookOpen className="h-6 w-6 text-primary" /><span className="text-sm font-medium">Absensi</span>
            </Link>
            <Link href="/dashboard/journals" className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-xl border p-3 text-center transition-colors hover:bg-muted sm:p-4">
              <FileText className="h-6 w-6 text-primary" /><span className="text-sm font-medium">Jurnal</span>
            </Link>
            <Link href="/dashboard/assessments" className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-xl border p-3 text-center transition-colors hover:bg-muted sm:p-4">
              <GraduationCap className="h-6 w-6 text-primary" /><span className="text-sm font-medium">Input Nilai</span>
            </Link>
            <Link href="/dashboard/materials" className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-xl border p-3 text-center transition-colors hover:bg-muted sm:p-4">
              <Library className="h-6 w-6 text-primary" /><span className="text-sm font-medium">Bahan Ajar</span>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
