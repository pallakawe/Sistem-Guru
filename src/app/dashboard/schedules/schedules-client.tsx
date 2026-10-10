/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Clock, MapPin, BookOpen, Loader2, Pencil, Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createSchedule, updateSchedule, deleteSchedule } from "./actions"
import { useToast } from "@/hooks/use-toast"

const DAYS = [
  { value: "1", label: "Senin" },
  { value: "2", label: "Selasa" },
  { value: "3", label: "Rabu" },
  { value: "4", label: "Kamis" },
  { value: "5", label: "Jumat" },
  { value: "6", label: "Sabtu" },
  { value: "7", label: "Minggu" }
]

const SUBJECT_COLORS = [
  "bg-blue-100 text-blue-700 border-blue-200",
  "bg-green-100 text-green-700 border-green-200",
  "bg-purple-100 text-purple-700 border-purple-200",
  "bg-orange-100 text-orange-700 border-orange-200",
  "bg-pink-100 text-pink-700 border-pink-200",
]

export default function SchedulesClient({ initialSchedules, classes, subjects }: { 
  initialSchedules: any[], 
  classes: any[], 
  subjects: any[] 
}) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [editingSchedule, setEditingSchedule] = useState<any | null>(null)
  const [scheduleToDelete, setScheduleToDelete] = useState<any | null>(null)
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([])
  const [editSubjectIds, setEditSubjectIds] = useState<string[]>([])
  const { toast } = useToast()

  const getDayName = (dayValue: number) => {
    return DAYS.find(d => parseInt(d.value) === dayValue)?.label || ""
  }

  const jsDay = new Date().getDay() // 0 = Minggu
  const todayIndex = jsDay === 0 ? 7 : jsDay
  const todayLabel = getDayName(todayIndex)

  const todaySchedules = initialSchedules.filter(s => s.day_of_week === todayIndex)

  async function onSubmit(formData: FormData) {
    setIsLoading(true)
    setError("")
    
    const result = await createSchedule(formData)
    
    if (result?.error) {
      setError(result.error)
      setIsLoading(false)
      return
    }

    setOpen(false)
    setSelectedSubjectIds([])
    setIsLoading(false)
  }

  async function onEdit(formData: FormData) {
    if (!editingSchedule) return
    setIsLoading(true)
    const result = await updateSchedule(editingSchedule.id, formData)
    setIsLoading(false)
    if (result?.error) {
      toast({ title: "Gagal", description: result.error, variant: "destructive" })
      return
    }
    setEditingSchedule(null)
    toast({ title: "Berhasil", description: "Jadwal diperbarui." })
    window.location.reload()
  }

  async function onDelete() {
    if (!scheduleToDelete) return
    setIsLoading(true)
    const result = await deleteSchedule(scheduleToDelete.id)
    setIsLoading(false)
    if (result?.error) {
      toast({ title: "Gagal", description: result.error, variant: "destructive" })
      return
    }
    setScheduleToDelete(null)
    toast({ title: "Dihapus", description: "Jadwal berhasil dihapus." })
    window.location.reload()
  }

  const toggleSubject = (id: string, editing = false) => {
    if (editing) {
      setEditSubjectIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])
      return
    }
    setSelectedSubjectIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])
  }

  const scheduleSubjectNames = (schedule: any) => {
    const linked = (schedule.schedule_subjects || [])
      .map((item: any) => item.subjects?.name)
      .filter(Boolean)
    return linked.length > 0 ? linked.join(", ") : schedule.subjects?.name || "Mata Pelajaran"
  }

  const scheduleSubjectIds = (schedule: any) => {
    const linked = (schedule.schedule_subjects || [])
      .map((item: any) => item.subjects?.id)
      .filter(Boolean)
    return linked.length > 0 ? linked : (schedule.subjects?.id ? [schedule.subjects.id] : [])
  }

  const formatTime = (timeString: string) => {
    if (!timeString) return ""
    return timeString.substring(0, 5) // "08:00:00" -> "08:00"
  }

  const getColor = (subjectId: string) => {
    const index = subjects.findIndex(s => s.id === subjectId)
    return SUBJECT_COLORS[index % SUBJECT_COLORS.length] || SUBJECT_COLORS[0]
  }

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Jadwal Mengajar</h1>
          <p className="text-muted-foreground">Kelola jadwal mengajar Anda per minggu.</p>
        </div>
        <Dialog open={open} onOpenChange={(value) => {
          setOpen(value)
          if (!value) setSelectedSubjectIds([])
        }}>
          <DialogTrigger render={<Button><Plus className="mr-2 h-4 w-4" /> Tambah Jadwal</Button>} />
          <DialogContent className="sm:max-w-[425px]">
            <form action={onSubmit}>
              <DialogHeader>
                <DialogTitle>Tambah Jadwal Baru</DialogTitle>
                <DialogDescription>Isi detail jadwal mengajar Anda.</DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
                <div className="grid gap-2">
                  <Label htmlFor="dayOfWeek">Hari</Label>
                  <Select name="dayOfWeek" required items={DAYS}>
                    <SelectTrigger id="dayOfWeek">
                      <SelectValue placeholder="Pilih Hari" />
                    </SelectTrigger>
                    <SelectContent>
                      {DAYS.map(d => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="startTime">Jam Mulai</Label>
                    <Input id="startTime" name="startTime" type="time" defaultValue="08:00" required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="endTime">Jam Selesai</Label>
                    <Input id="endTime" name="endTime" type="time" defaultValue="09:30" required />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="classId">Kelas</Label>
                  <Select name="classId" required items={classes.map(c => ({ value: c.id, label: c.name }))}>
                    <SelectTrigger id="classId">
                      <SelectValue placeholder="Pilih Kelas" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.length === 0 ? (
                        <SelectItem value="none" disabled>Belum ada kelas</SelectItem>
                      ) : (
                        classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Mata Pelajaran</Label>
                  <div className="grid gap-2 rounded-xl border bg-muted/20 p-3 sm:grid-cols-2">
                    {subjects.length === 0 ? (
                      <p className="col-span-full text-sm text-muted-foreground">Belum ada mata pelajaran.</p>
                    ) : (
                      subjects.map((subject) => {
                        const checked = selectedSubjectIds.includes(subject.id)
                        return (
                          <label
                            key={subject.id}
                            className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition ${checked ? "border-primary bg-primary/10" : "bg-background hover:bg-muted/50"}`}
                          >
                            <input
                              type="checkbox"
                              name="subjectIds"
                              value={subject.id}
                              checked={checked}
                              onChange={() => toggleSubject(subject.id)}
                              className="h-4 w-4 accent-yellow-500"
                            />
                            <span className="text-sm font-medium">{subject.name}</span>
                          </label>
                        )
                      })
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">Bisa pilih lebih dari satu mata pelajaran.</p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="room">Ruangan (Opsional)</Label>
                  <Input id="room" name="room" placeholder="Contoh: Ruang 101" />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Batal</Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Simpan Jadwal
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={!!editingSchedule} onOpenChange={(value) => {
        if (!value) {
          setEditingSchedule(null)
          setEditSubjectIds([])
        }
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <form key={editingSchedule?.id} action={onEdit}>
            <DialogHeader>
              <DialogTitle>Edit Jadwal</DialogTitle>
              <DialogDescription>Perbarui detail jadwal mengajar.</DialogDescription>
            </DialogHeader>
            {editingSchedule && (
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Hari</Label>
                  <Select name="dayOfWeek" defaultValue={String(editingSchedule.day_of_week)} items={DAYS}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{DAYS.map(d => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="grid gap-2"><Label>Jam Mulai</Label><Input name="startTime" type="time" defaultValue={formatTime(editingSchedule.start_time)} required /></div>
                  <div className="grid gap-2"><Label>Jam Selesai</Label><Input name="endTime" type="time" defaultValue={formatTime(editingSchedule.end_time)} required /></div>
                </div>
                <div className="grid gap-2">
                  <Label>Kelas</Label>
                  <Select name="classId" defaultValue={editingSchedule.classes?.id} items={classes.map(x => ({ value: x.id, label: x.name }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{classes.map(x => <SelectItem key={x.id} value={x.id}>{x.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Mata Pelajaran</Label>
                  <div className="grid gap-2 rounded-xl border bg-muted/20 p-3 sm:grid-cols-2">
                    {subjects.map((subject) => {
                      const checked = editSubjectIds.includes(subject.id)
                      return (
                        <label
                          key={subject.id}
                          className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition ${checked ? "border-primary bg-primary/10" : "bg-background hover:bg-muted/50"}`}
                        >
                          <input
                            type="checkbox"
                            name="subjectIds"
                            value={subject.id}
                            checked={checked}
                            onChange={() => toggleSubject(subject.id, true)}
                            className="h-4 w-4 accent-yellow-500"
                          />
                          <span className="text-sm font-medium">{subject.name}</span>
                        </label>
                      )
                    })}
                  </div>
                </div>
                <div className="grid gap-2"><Label>Ruangan</Label><Input name="room" defaultValue={editingSchedule.room || ""} /></div>
              </div>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditingSchedule(null)}>Batal</Button>
              <Button type="submit" disabled={isLoading}>{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Simpan</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!scheduleToDelete} onOpenChange={(value) => !value && setScheduleToDelete(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Hapus Jadwal?</DialogTitle><DialogDescription>Jadwal ini akan dihapus permanen.</DialogDescription></DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setScheduleToDelete(null)}>Batal</Button>
            <Button variant="destructive" onClick={onDelete} disabled={isLoading}>{isLoading ? "Menghapus..." : "Hapus"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Today's Schedule */}
      {todaySchedules.length > 0 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-primary flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Jadwal Hari Ini — {todayLabel}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              {todaySchedules.map(s => (
                <div key={s.id} className="flex flex-col items-stretch gap-3 rounded-xl border bg-white p-3 dark:bg-card sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                    <div className="text-sm font-mono font-bold text-primary">{formatTime(s.start_time)}<br /><span className="text-muted-foreground font-normal">{formatTime(s.end_time)}</span></div>
                    <div>
                      <p className="font-semibold">{s.classes?.name}</p>
                      <p className="text-sm text-muted-foreground">{scheduleSubjectNames(s)}</p>
                    </div>
                  </div>
                  <Button size="sm" className="w-full sm:w-auto">Mulai Pertemuan</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Weekly Schedule Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {DAYS.map(day => {
          const daySchedules = initialSchedules.filter(s => s.day_of_week === parseInt(day.value))
          return (
            <Card key={day.value} className={todayLabel === day.label ? "border-primary" : ""}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center justify-between">
                  {day.label}
                  {todayLabel === day.label && <Badge variant="default" className="text-xs">Hari Ini</Badge>}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {daySchedules.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">Tidak ada jadwal</p>
                ) : (
                  <div className="space-y-2">
                    {daySchedules.map(s => (
                      <div key={s.id} className={`p-3 rounded-lg border text-sm ${getColor(s.subjects?.id)}`}>
                        <div className="flex items-center gap-1 font-mono text-xs mb-1 opacity-70">
                          <Clock className="h-3 w-3" />
                          {formatTime(s.start_time)} – {formatTime(s.end_time)}
                        </div>
                        <p className="font-semibold">{s.classes?.name}</p>
                        <div className="flex items-center gap-1 mt-1 opacity-70">
                          <BookOpen className="h-3 w-3" />
                          <span>{scheduleSubjectNames(s)}</span>
                        </div>
                        {s.room && (
                          <div className="flex items-center gap-1 opacity-70">
                            <MapPin className="h-3 w-3" />
                            <span>{s.room}</span>
                          </div>
                        )}
                        <div className="mt-2 flex justify-end gap-1">
                          <Button type="button" variant="ghost" size="icon-sm" onClick={() => { setEditingSchedule(s); setEditSubjectIds(scheduleSubjectIds(s)) }} title="Edit jadwal">
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button type="button" variant="ghost" size="icon-sm" className="text-destructive hover:text-destructive" onClick={() => setScheduleToDelete(s)} title="Hapus jadwal">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
