/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format, parseISO } from "date-fns"
import { CheckCircle2, Loader2, Save } from "lucide-react"
import { id as idLocale } from "date-fns/locale"
import { getMeetingStudents, saveAttendance } from "./actions"
import { useToast } from "@/hooks/use-toast"

export default function AttendanceClient({ meetings }: { meetings: any[] }) {
  const [selectedMeetingId, setSelectedMeetingId] = useState<string>("")
  const [attendanceId, setAttendanceId] = useState<string>("")
  const [students, setStudents] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  const selectedMeeting = meetings.find(m => m.id === selectedMeetingId)

  useEffect(() => {
    if (!selectedMeetingId) {
      setStudents([])
      setAttendanceId("")
      return
    }

    async function fetchStudents() {
      setIsLoading(true)
      const res = await getMeetingStudents(selectedMeetingId)
      if (res.error) {
        toast({ title: "Error", description: res.error, variant: "destructive" })
        setIsLoading(false)
        return
      }

      setAttendanceId(res.attendanceId || "")
      
      // Merge students with their existing records or default to 'H'
      const mergedStudents = res.students?.map((s: any) => {
        const existingRecord = res.records?.find((r: any) => r.student_id === s.id)
        return {
          ...s,
          status: existingRecord ? existingRecord.status : "H"
        }
      }) || []

      setStudents(mergedStudents)
      setIsLoading(false)
    }

    fetchStudents()
  }, [selectedMeetingId, toast])

  const setAllPresent = () => {
    setStudents(students.map(s => ({ ...s, status: "H" })))
  }

  const updateStatus = (id: string, status: string) => {
    setStudents(students.map(s => s.id === id ? { ...s, status } : s))
  }

  const handleSave = () => {
    if (!attendanceId) return

    startTransition(async () => {
      const recordsToSave = students.map(s => ({ student_id: s.id, status: s.status }))
      const result = await saveAttendance(attendanceId, recordsToSave)
      
      if (result.error) {
        toast({ title: "Gagal menyimpan absensi", description: result.error, variant: "destructive" })
      } else {
        toast({ title: "Berhasil!", description: "Data absensi telah tersimpan." })
      }
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Absensi Cepat</h1>
        <p className="text-muted-foreground">Catat kehadiran siswa berdasarkan pertemuan yang sudah dibuat di Jurnal.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        {/* Selection Area */}
        <Card className="md:col-span-1 h-fit">
          <CardHeader>
            <CardTitle>Pilih Pertemuan</CardTitle>
            <CardDescription>Tentukan pertemuan dari jurnal Anda</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Pertemuan</Label>
              <Select
                value={selectedMeetingId}
                onValueChange={(value) => setSelectedMeetingId(value ?? "")}
                items={meetings.map(m => ({
                  value: m.id,
                  label: `${m.classes?.name} - ${m.subjects?.name} (Pertemuan ${m.meeting_number}) - ${format(parseISO(m.date), "dd MMM yyyy", { locale: idLocale })}`
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Pertemuan" />
                </SelectTrigger>
                <SelectContent>
                  {meetings.length === 0 ? (
                    <SelectItem value="none" disabled>Belum ada pertemuan di Jurnal</SelectItem>
                  ) : (
                    meetings.map(m => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.classes?.name} - {m.subjects?.name} (Pertemuan {m.meeting_number})
                        {" - "}
                        {format(parseISO(m.date), "dd MMM yyyy", { locale: idLocale })}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            
            {meetings.length === 0 && (
              <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-md">
                Anda belum membuat jurnal/pertemuan sama sekali. Silakan buat Jurnal Mengajar terlebih dahulu.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Student List */}
        <Card className="md:col-span-3">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Daftar Siswa</CardTitle>
              <CardDescription>
                {selectedMeeting ? (
                  `${selectedMeeting.classes?.name} — ${selectedMeeting.subjects?.name}`
                ) : (
                  "Pilih pertemuan di panel samping untuk memuat siswa."
                )}
              </CardDescription>
            </div>
            {students.length > 0 && (
              <Button variant="secondary" onClick={setAllPresent}>
                <CheckCircle2 className="mr-2 h-4 w-4" /> Hadir Semua
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center py-12 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : students.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground border rounded-lg border-dashed">
                {selectedMeetingId ? "Tidak ada data siswa di kelas ini." : "Silakan pilih pertemuan terlebih dahulu."}
              </div>
            ) : (
              <div className="space-y-3">
                {students.map((student, index) => (
                  <div key={student.id} className="flex flex-col xl:flex-row xl:items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors gap-3">
                    <div className="flex items-center gap-3">
                      <span className="text-muted-foreground w-6 text-sm">{index + 1}</span>
                      <span className="font-medium">{student.full_name}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button 
                        size="sm" 
                        variant={student.status === "H" ? "default" : "outline"}
                        className={student.status === "H" ? "bg-green-600 hover:bg-green-700 text-white" : ""}
                        onClick={() => updateStatus(student.id, "H")}
                      >Hadir</Button>
                      <Button 
                        size="sm" 
                        variant={student.status === "S" ? "default" : "outline"}
                        className={student.status === "S" ? "bg-blue-600 hover:bg-blue-700 text-white" : ""}
                        onClick={() => updateStatus(student.id, "S")}
                      >Sakit</Button>
                      <Button 
                        size="sm" 
                        variant={student.status === "I" ? "default" : "outline"}
                        className={student.status === "I" ? "bg-yellow-600 hover:bg-yellow-700 text-white" : ""}
                        onClick={() => updateStatus(student.id, "I")}
                      >Izin</Button>
                      <Button 
                        size="sm" 
                        variant={student.status === "A" ? "default" : "outline"}
                        className={student.status === "A" ? "bg-red-600 hover:bg-red-700 text-white" : ""}
                        onClick={() => updateStatus(student.id, "A")}
                      >Alpa</Button>
                    </div>
                  </div>
                ))}

                <div className="mt-8 flex justify-end pt-4 border-t">
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
