'use client'

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Activity, BookOpenCheck, ChartNoAxesColumnIncreasing } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type AttendancePoint = {
  day: string
  H: number
  S: number
  I: number
  A: number
}

type ScoreBucket = {
  range: string
  count: number
}

type RecentActivity = {
  id: string
  type: string
  title: string
  detail: string
  createdAt: string
}

export function DashboardStats({
  attendance,
  journalCount,
  scoreDistribution,
  recentActivities,
}: {
  attendance: AttendancePoint[]
  journalCount: number
  scoreDistribution: ScoreBucket[]
  recentActivities: RecentActivity[]
}) {
  const totalAttendance = attendance.reduce(
    (sum, item) => sum + item.H + item.S + item.I + item.A,
    0
  )
  const totalScores = scoreDistribution.reduce((sum, item) => sum + item.count, 0)

  return (
    <section className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="min-w-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jurnal Tahun Ajaran Ini</CardTitle>
            <BookOpenCheck className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{journalCount}</div>
            <p className="mt-1 text-xs text-muted-foreground">Jurnal mengajar yang sudah tersimpan</p>
          </CardContent>
        </Card>

        <Card className="min-w-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rekaman Kehadiran Minggu Ini</CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAttendance}</div>
            <p className="mt-1 text-xs text-muted-foreground">Total status kehadiran yang tercatat</p>
          </CardContent>
        </Card>

        <Card className="min-w-0 sm:col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nilai Terekam</CardTitle>
            <ChartNoAxesColumnIncreasing className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalScores}</div>
            <p className="mt-1 text-xs text-muted-foreground">Nilai siswa pada tahun ajaran aktif</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="min-w-0">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Kehadiran Minggu Ini</CardTitle>
            <p className="text-xs text-muted-foreground">Hadir, sakit, izin, dan alpa per hari</p>
          </CardHeader>
          <CardContent>
            {totalAttendance === 0 ? (
              <div className="flex h-64 items-center justify-center rounded-xl border border-dashed text-sm text-muted-foreground">
                Belum ada absensi minggu ini.
              </div>
            ) : (
              <div className="h-64 w-full sm:h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={attendance} margin={{ top: 8, right: 4, left: -24, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                    <XAxis dataKey="day" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      cursor={{ opacity: 0.08 }}
                      contentStyle={{ borderRadius: 12, border: "1px solid var(--border)" }}
                    />
                    <Bar dataKey="H" name="Hadir" stackId="attendance" fill="#22c55e" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="S" name="Sakit" stackId="attendance" fill="#3b82f6" />
                    <Bar dataKey="I" name="Izin" stackId="attendance" fill="#f59e0b" />
                    <Bar dataKey="A" name="Alpa" stackId="attendance" fill="#ef4444" radius={[5, 5, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
              <span><i className="mr-1 inline-block h-2.5 w-2.5 rounded-full bg-green-500" />Hadir</span>
              <span><i className="mr-1 inline-block h-2.5 w-2.5 rounded-full bg-blue-500" />Sakit</span>
              <span><i className="mr-1 inline-block h-2.5 w-2.5 rounded-full bg-amber-500" />Izin</span>
              <span><i className="mr-1 inline-block h-2.5 w-2.5 rounded-full bg-red-500" />Alpa</span>
            </div>
          </CardContent>
        </Card>

        <Card className="min-w-0">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Distribusi Nilai</CardTitle>
            <p className="text-xs text-muted-foreground">Sebaran seluruh nilai pada tahun ajaran aktif</p>
          </CardHeader>
          <CardContent>
            {totalScores === 0 ? (
              <div className="flex h-64 items-center justify-center rounded-xl border border-dashed text-sm text-muted-foreground">
                Belum ada nilai yang tersimpan.
              </div>
            ) : (
              <div className="h-64 w-full sm:h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={scoreDistribution} margin={{ top: 8, right: 4, left: -24, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                    <XAxis dataKey="range" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      cursor={{ opacity: 0.08 }}
                      contentStyle={{ borderRadius: 12, border: "1px solid var(--border)" }}
                      formatter={(value) => [value, "Jumlah siswa"]}
                    />
                    <Bar dataKey="count" name="Jumlah siswa" fill="#facc15" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Aktivitas Terakhir</CardTitle>
          <p className="text-xs text-muted-foreground">Perubahan terbaru dari data pembelajaran Anda</p>
        </CardHeader>
        <CardContent>
          {recentActivities.length === 0 ? (
            <div className="rounded-xl border border-dashed py-10 text-center text-sm text-muted-foreground">
              Belum ada aktivitas terbaru.
            </div>
          ) : (
            <div className="divide-y">
              {recentActivities.map((item) => (
                <div key={item.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-primary" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{item.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{item.type} · {item.detail}</p>
                  </div>
                  <time className="shrink-0 text-[11px] text-muted-foreground">
                    {new Intl.DateTimeFormat("id-ID", {
                      day: "2-digit",
                      month: "short",
                    }).format(new Date(item.createdAt))}
                  </time>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  )
}
