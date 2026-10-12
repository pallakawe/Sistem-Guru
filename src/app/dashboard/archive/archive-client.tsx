/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useMemo, useState, useTransition } from "react"
import { Archive, BookOpen, CalendarCheck, FileText, FolderOpen, GraduationCap, Loader2, Users } from "lucide-react"
import { getArchiveData } from "./actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

const SECTIONS = [
  { id: "classes", label: "Kelas & Siswa", icon: Users },
  { id: "journals", label: "Jurnal", icon: BookOpen },
  { id: "attendance", label: "Absensi", icon: CalendarCheck },
  { id: "assessments", label: "Penilaian", icon: GraduationCap },
  { id: "devices", label: "Perangkat", icon: FolderOpen },
]

export default function ArchiveClient({ initialData }: { initialData: any }) {
  const [data, setData] = useState(initialData)
  const [selectedYearId, setSelectedYearId] = useState(initialData.selectedYear?.id || "")
  const [section, setSection] = useState("classes")
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  function changeYear(value: string | null) {
    if (!value) return
    setSelectedYearId(value)
    startTransition(async () => {
      const result = await getArchiveData(value)
      if ("error" in result && result.error) {
        toast({ title: "Gagal membuka arsip", description: result.error, variant: "destructive" })
        return
      }
      setData(result)
    })
  }

  const totals = useMemo(() => ({
    classes: data.classes?.length || 0,
    students: data.students?.length || 0,
    journals: data.journals?.length || 0,
    attendance: data.attendance?.length || 0,
    assessments: data.assessments?.length || 0,
    devices: data.devices?.length || 0,
  }), [data])

  const groupedStudents = useMemo(() => {
    const map = new Map<string, any[]>()
    ;(data.students || []).forEach((student: any) => {
      const key = student.class_id
      const current = map.get(key) || []
      current.push(student)
      map.set(key, current)
    })
    return map
  }, [data.students])

  if (!data.years || data.years.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Arsip Tahun Ajaran</h1>
          <p className="text-muted-foreground">Belum ada tahun ajaran yang tersimpan.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight sm:text-3xl">
            <Archive className="h-7 w-7 text-primary" />
            Arsip Tahun Ajaran
          </h1>
          <p className="text-muted-foreground">
            Lihat kembali data tahun ajaran lama tanpa mengganti tahun ajaran yang sedang aktif.
          </p>
        </div>

        <div className="w-full lg:w-72">
          <Select
            value={selectedYearId}
            onValueChange={changeYear}
            items={(data.years || []).map((year: any) => ({
              value: year.id,
              label: `${year.name} - ${year.semester}`,
            }))}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Pilih Tahun Ajaran" />
            </SelectTrigger>
            <SelectContent>
              {(data.years || []).map((year: any) => (
                <SelectItem key={year.id} value={year.id}>
                  {year.name} - {year.semester}{year.is_active ? " (Aktif)" : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isPending ? (
        <div className="flex min-h-72 items-center justify-center rounded-2xl border bg-card">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <Card>
            <CardContent className="p-4 sm:p-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Arsip yang sedang dilihat</p>
                  <h2 className="text-xl font-bold">
                    {data.selectedYear?.name} · Semester {data.selectedYear?.semester}
                  </h2>
                </div>
                <Badge variant={data.selectedYear?.is_active ? "default" : "secondary"}>
                  {data.selectedYear?.is_active ? "Tahun Ajaran Aktif" : "Arsip"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {[
              ["Kelas", totals.classes],
              ["Siswa", totals.students],
              ["Jurnal", totals.journals],
              ["Hari Absen", totals.attendance],
              ["Penilaian", totals.assessments],
              ["Perangkat", totals.devices],
            ].map(([label, value]) => (
              <Card key={String(label)}>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold">{value}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="w-full overflow-x-auto pb-1">
            <div className="flex min-w-max gap-2">
              {SECTIONS.map((item) => {
                const Icon = item.icon
                return (
                  <Button
                    key={item.id}
                    type="button"
                    variant={section === item.id ? "default" : "outline"}
                    onClick={() => setSection(item.id)}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {item.label}
                  </Button>
                )
              })}
            </div>
          </div>

          {section === "classes" && (
            <div className="grid gap-4 lg:grid-cols-2">
              {(data.classes || []).length === 0 ? (
                <Empty text="Tidak ada kelas pada tahun ajaran ini." />
              ) : data.classes.map((cls: any) => {
                const classStudents = groupedStudents.get(cls.id) || []
                return (
                  <Card key={cls.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <CardTitle>{cls.name}</CardTitle>
                          <p className="mt-1 text-sm text-muted-foreground">
                            Tingkat {cls.grade_level}{cls.homeroom_teacher ? ` · Wali Kelas: ${cls.homeroom_teacher}` : ""}
                          </p>
                        </div>
                        <Badge variant="secondary">{classStudents.length} siswa</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                        {classStudents.map((student: any, index: number) => (
                          <div key={student.id} className="flex items-center gap-3 rounded-xl border p-2.5">
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                              {index + 1}
                            </span>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium">{student.full_name}</p>
                              <p className="text-xs text-muted-foreground">
                                NIS {student.nis || "-"} · NISN {student.nisn || "-"}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

          {section === "journals" && (
            <div className="grid gap-3 sm:grid-cols-2">
              {(data.journals || []).length === 0 ? (
                <Empty text="Tidak ada jurnal pada tahun ajaran ini." />
              ) : data.journals.map((journal: any) => (
                <Card key={journal.id}>
                  <CardContent className="p-4">
                    <h3 className="font-semibold">{journal.topic}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {journal.meetings?.classes?.name || "-"} · {journal.meetings?.subjects?.name || "-"}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge variant="secondary">Pertemuan {journal.meetings?.meeting_number || "-"}</Badge>
                      <Badge variant="outline">{journal.meetings?.date || "-"}</Badge>
                    </div>
                    {journal.learning_objectives && (
                      <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{journal.learning_objectives}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {section === "attendance" && (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {(data.attendance || []).length === 0 ? (
                <Empty text="Tidak ada data absensi pada tahun ajaran ini." />
              ) : data.attendance.map((item: any) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold">{item.classes?.name || "Kelas"}</h3>
                        <p className="text-sm text-muted-foreground">{item.attendance_date}</p>
                      </div>
                      <Badge variant="secondary">{item.total} siswa</Badge>
                    </div>
                    <div className="mt-4 grid grid-cols-4 gap-2 text-center text-xs">
                      <div className="rounded-lg bg-green-50 p-2 dark:bg-green-950/20"><b>{item.counts.H}</b><br/>Hadir</div>
                      <div className="rounded-lg bg-blue-50 p-2 dark:bg-blue-950/20"><b>{item.counts.S}</b><br/>Sakit</div>
                      <div className="rounded-lg bg-amber-50 p-2 dark:bg-amber-950/20"><b>{item.counts.I}</b><br/>Izin</div>
                      <div className="rounded-lg bg-red-50 p-2 dark:bg-red-950/20"><b>{item.counts.A}</b><br/>Alpa</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {section === "assessments" && (
            <div className="grid gap-3 sm:grid-cols-2">
              {(data.assessments || []).length === 0 ? (
                <Empty text="Tidak ada penilaian pada tahun ajaran ini." />
              ) : data.assessments.map((assessment: any) => (
                <Card key={assessment.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold">{assessment.title}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {assessment.classes?.name || "-"} · {assessment.subjects?.name || "-"}
                        </p>
                      </div>
                      <Badge>{assessment.type}</Badge>
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">
                      Bobot {assessment.weight || 0}% · {(assessment.assessment_scores as any[])?.[0]?.count || 0} nilai siswa
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {section === "devices" && (
            <div className="grid gap-3 sm:grid-cols-2">
              {(data.devices || []).length === 0 ? (
                <Empty text="Tidak ada perangkat pembelajaran pada tahun ajaran ini." />
              ) : data.devices.map((device: any) => (
                <Card key={device.id}>
                  <CardContent className="flex items-center gap-3 p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-medium">{device.title}</h3>
                      <p className="truncate text-sm text-muted-foreground">
                        {device.category} · {device.subjects?.name || "Tanpa mapel"}
                      </p>
                    </div>
                    {device.file_url && (
                      <Button variant="outline" size="sm" render={<a href={device.file_url} target="_blank" rel="noopener noreferrer" />}>
                        Buka
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

function Empty({ text }: { text: string }) {
  return (
    <div className="col-span-full rounded-2xl border border-dashed bg-card py-12 text-center text-sm text-muted-foreground">
      {text}
    </div>
  )
}
