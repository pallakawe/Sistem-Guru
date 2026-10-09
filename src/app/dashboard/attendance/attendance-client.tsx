/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useEffect, useMemo, useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle2, Loader2, Save, FileSpreadsheet, FileDown, CalendarDays, ChevronLeft, ChevronRight } from "lucide-react"
import { getDailyAttendance, getMonthlyAttendanceSummary, saveDailyAttendance } from "./actions"
import { useToast } from "@/hooks/use-toast"
import { exportRowsToExcel, exportRowsToPdf } from "@/lib/export-data"

const STATUS_LABELS: Record<string, string> = {
  H: "Hadir",
  S: "Sakit",
  I: "Izin",
  A: "Alpa",
}

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
}

function dateKey(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
}

export default function AttendanceClient({ classes }: { classes: any[] }) {
  const now = new Date()
  const [selectedClassId, setSelectedClassId] = useState(classes[0]?.id || "")
  const [selectedMonth, setSelectedMonth] = useState(monthKey(now))
  const [selectedDate, setSelectedDate] = useState("")
  const [students, setStudents] = useState<any[]>([])
  const [monthDays, setMonthDays] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  const selectedClass = classes.find((item) => item.id === selectedClassId)
  const [year, month] = selectedMonth.split("-").map(Number)
  const daysInMonth = new Date(year, month, 0).getDate()
  const firstDay = new Date(year, month - 1, 1).getDay()
  const mondayOffset = firstDay === 0 ? 6 : firstDay - 1

  const summaryMap = useMemo(
    () => new Map(monthDays.map((item) => [item.date, item])),
    [monthDays]
  )

  async function refreshMonthSummary() {
    if (!selectedClassId || !selectedMonth) {
      setMonthDays([])
      return
    }

    const result = await getMonthlyAttendanceSummary(selectedClassId, selectedMonth)
    if (result.error) {
      toast({ title: "Gagal memuat rekap", description: result.error, variant: "destructive" })
      return
    }
    setMonthDays(result.days || [])
  }

  useEffect(() => {
    setSelectedDate("")
    setStudents([])
    refreshMonthSummary()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClassId, selectedMonth])

  async function selectDate(date: string) {
    if (!selectedClassId) return
    setSelectedDate(date)
    setIsLoading(true)

    const result = await getDailyAttendance(selectedClassId, date)
    if (result.error) {
      toast({ title: "Gagal memuat absensi", description: result.error, variant: "destructive" })
      setStudents([])
      setIsLoading(false)
      return
    }

    const merged = (result.students || []).map((student: any) => {
      const record = (result.records || []).find((item: any) => item.student_id === student.id)
      return {
        ...student,
        status: record?.status || "H",
        notes: record?.notes || "",
      }
    })

    setStudents(merged)
    setIsLoading(false)
  }

  function moveMonth(offset: number) {
    const current = new Date(year, month - 1 + offset, 1)
    setSelectedMonth(monthKey(current))
  }

  function updateStatus(studentId: string, status: string) {
    setStudents((current) =>
      current.map((student) => student.id === studentId ? { ...student, status } : student)
    )
  }

  function setAllPresent() {
    setStudents((current) => current.map((student) => ({ ...student, status: "H" })))
  }

  function handleSave() {
    if (!selectedClassId || !selectedDate || students.length === 0) return

    startTransition(async () => {
      const result = await saveDailyAttendance(
        selectedClassId,
        selectedDate,
        students.map((student) => ({
          student_id: student.id,
          status: student.status,
          notes: student.notes || "",
        }))
      )

      if (result.error) {
        toast({ title: "Gagal menyimpan absensi", description: result.error, variant: "destructive" })
        return
      }

      toast({ title: "Berhasil!", description: "Absensi harian berhasil disimpan." })
      await refreshMonthSummary()
    })
  }

  const selectedSummary = summaryMap.get(selectedDate)
  const totals = students.reduce(
    (result, student) => {
      result[student.status as "H" | "S" | "I" | "A"] += 1
      return result
    },
    { H: 0, S: 0, I: 0, A: 0 }
  )

  const attendanceExport = {
    title: selectedClass ? `Daftar Hadir - ${selectedClass.name}` : "Daftar Hadir",
    fileName: selectedClass && selectedDate ? `absensi-${selectedClass.name}-${selectedDate}` : "absensi",
    subtitle: selectedDate
      ? new Intl.DateTimeFormat("id-ID", { dateStyle: "full" }).format(new Date(selectedDate + "T00:00:00"))
      : undefined,
    headers: ["No", "No. Absen", "Nama Siswa", "Status"],
    rows: students.map((student, index) => [
      index + 1,
      student.student_number || "-",
      student.full_name,
      STATUS_LABELS[student.status] || student.status,
    ]),
  }

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Absensi Siswa</h1>
        <p className="text-muted-foreground">
          Absensi harian berdasarkan kelas dan tanggal. Tidak lagi bergantung pada Jurnal Mengajar.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pilih Kelas & Bulan</CardTitle>
              <CardDescription>Pilih kelas lalu klik tanggal pada kalender.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label>Kelas</Label>
                <Select
                  value={selectedClassId}
                  onValueChange={(value) => setSelectedClassId(value ?? "")}
                  items={classes.map((item) => ({ value: item.id, label: item.name }))}
                >
                  <SelectTrigger><SelectValue placeholder="Pilih Kelas" /></SelectTrigger>
                  <SelectContent>
                    {classes.map((item) => (
                      <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Bulan</Label>
                <Input
                  type="month"
                  value={selectedMonth}
                  onChange={(event) => setSelectedMonth(event.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-2">
                <Button type="button" variant="outline" size="icon-sm" onClick={() => moveMonth(-1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="text-center">
                  <CardTitle className="text-base">
                    {new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" }).format(new Date(year, month - 1, 1))}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">Klik tanggal untuk mengisi absensi</p>
                </div>
                <Button type="button" variant="outline" size="icon-sm" onClick={() => moveMonth(1)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground">
                {["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"].map((day) => (
                  <div key={day} className="py-1">{day}</div>
                ))}
              </div>
              <div className="mt-1 grid grid-cols-7 gap-1">
                {Array.from({ length: mondayOffset }).map((_, index) => (
                  <div key={`empty-${index}`} />
                ))}
                {Array.from({ length: daysInMonth }).map((_, index) => {
                  const day = index + 1
                  const key = dateKey(year, month, day)
                  const saved = summaryMap.get(key)
                  const active = key === selectedDate
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => selectDate(key)}
                      disabled={!selectedClassId}
                      className={[
                        "relative aspect-square rounded-xl border text-sm transition",
                        active ? "border-primary bg-primary text-primary-foreground shadow-sm" : "bg-card hover:border-primary/50 hover:bg-primary/5",
                        saved ? "font-semibold" : "",
                      ].join(" ")}
                    >
                      {day}
                      {saved && !active && (
                        <span className="absolute bottom-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-green-500" />
                      )}
                    </button>
                  )
                })}
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                Tanggal yang sudah memiliki data absensi
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="min-w-0">
          <CardHeader className="gap-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-primary" />
                  Daftar Hadir
                </CardTitle>
                <CardDescription className="mt-1">
                  {selectedDate && selectedClass
                    ? `${selectedClass.name} · ${new Intl.DateTimeFormat("id-ID", { dateStyle: "full" }).format(new Date(selectedDate + "T00:00:00"))}`
                    : "Pilih kelas dan tanggal terlebih dahulu."}
                </CardDescription>
              </div>

              {students.length > 0 && (
                <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:justify-end">
                  <Button variant="outline" onClick={() => exportRowsToExcel(attendanceExport)}>
                    <FileSpreadsheet className="mr-2 h-4 w-4" /> Excel
                  </Button>
                  <Button variant="outline" onClick={() => exportRowsToPdf(attendanceExport)}>
                    <FileDown className="mr-2 h-4 w-4" /> PDF
                  </Button>
                  <Button variant="secondary" className="col-span-2 sm:col-span-1" onClick={setAllPresent}>
                    <CheckCircle2 className="mr-2 h-4 w-4" /> Hadir Semua
                  </Button>
                </div>
              )}
            </div>

            {students.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                <div className="rounded-xl bg-green-50 p-2 text-center dark:bg-green-950/20">
                  <p className="text-lg font-bold text-green-700 dark:text-green-400">{totals.H}</p>
                  <p className="text-[11px] text-muted-foreground">Hadir</p>
                </div>
                <div className="rounded-xl bg-blue-50 p-2 text-center dark:bg-blue-950/20">
                  <p className="text-lg font-bold text-blue-700 dark:text-blue-400">{totals.S}</p>
                  <p className="text-[11px] text-muted-foreground">Sakit</p>
                </div>
                <div className="rounded-xl bg-amber-50 p-2 text-center dark:bg-amber-950/20">
                  <p className="text-lg font-bold text-amber-700 dark:text-amber-400">{totals.I}</p>
                  <p className="text-[11px] text-muted-foreground">Izin</p>
                </div>
                <div className="rounded-xl bg-red-50 p-2 text-center dark:bg-red-950/20">
                  <p className="text-lg font-bold text-red-700 dark:text-red-400">{totals.A}</p>
                  <p className="text-[11px] text-muted-foreground">Alpa</p>
                </div>
              </div>
            )}
          </CardHeader>

          <CardContent>
            {classes.length === 0 ? (
              <div className="rounded-xl border border-dashed py-12 text-center text-sm text-muted-foreground">
                Belum ada kelas pada tahun ajaran aktif.
              </div>
            ) : isLoading ? (
              <div className="flex items-center justify-center py-14 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : !selectedDate ? (
              <div className="rounded-xl border border-dashed py-14 text-center text-sm text-muted-foreground">
                Klik tanggal pada kalender untuk menampilkan daftar siswa.
              </div>
            ) : students.length === 0 ? (
              <div className="rounded-xl border border-dashed py-14 text-center text-sm text-muted-foreground">
                Tidak ada siswa aktif di kelas ini.
              </div>
            ) : (
              <div className="space-y-3">
                {students.map((student, index) => (
                  <div
                    key={student.id}
                    className="flex flex-col gap-3 rounded-xl border p-3 transition-colors hover:bg-muted/40 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                        {student.student_number || index + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-medium">{student.full_name}</p>
                        <p className="text-xs text-muted-foreground">No. Absen {student.student_number || index + 1}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                      {[
                        ["H", "Hadir", "bg-green-600 hover:bg-green-700 text-white"],
                        ["S", "Sakit", "bg-blue-600 hover:bg-blue-700 text-white"],
                        ["I", "Izin", "bg-amber-500 hover:bg-amber-600 text-white"],
                        ["A", "Alpa", "bg-red-600 hover:bg-red-700 text-white"],
                      ].map(([value, label, activeClass]) => (
                        <Button
                          key={value}
                          type="button"
                          size="sm"
                          variant={student.status === value ? "default" : "outline"}
                          className={student.status === value ? activeClass : ""}
                          onClick={() => updateStatus(student.id, value)}
                        >
                          {label}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="sticky bottom-0 flex justify-end border-t bg-background/95 pt-4 backdrop-blur">
                  <Button size="lg" className="w-full sm:w-auto" onClick={handleSave} disabled={isPending}>
                    {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Simpan Absensi
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
