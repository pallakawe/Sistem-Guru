'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Clock, MapPin, BookOpen, Loader2 } from "lucide-react"
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
import { createSchedule } from "./actions"

const DAYS = [
  { value: "1", label: "Senin" },
  { value: "2", label: "Selasa" },
  { value: "3", label: "Rabu" },
  { value: "4", label: "Kamis" },
  { value: "5", label: "Jumat" },
  { value: "6", label: "Sabtu" }
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

  const getDayName = (dayValue: number) => {
    return DAYS.find(d => parseInt(d.value) === dayValue)?.label || ""
  }

  const todayIndex = new Date().getDay() // 0 is Sunday, 1 is Monday
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
    setIsLoading(false)
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
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Jadwal Mengajar</h1>
          <p className="text-muted-foreground">Kelola jadwal mengajar Anda per minggu.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Tambah Jadwal</Button>
          </DialogTrigger>
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
                  <Select name="dayOfWeek" required>
                    <SelectTrigger id="dayOfWeek">
                      <SelectValue placeholder="Pilih Hari" />
                    </SelectTrigger>
                    <SelectContent>
                      {DAYS.map(d => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
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
                  <Select name="classId" required>
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
                  <Label htmlFor="subjectId">Mata Pelajaran</Label>
                  <Select name="subjectId" required>
                    <SelectTrigger id="subjectId">
                      <SelectValue placeholder="Pilih Mata Pelajaran" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.length === 0 ? (
                        <SelectItem value="none" disabled>Belum ada Mapel</SelectItem>
                      ) : (
                        subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)
                      )}
                    </SelectContent>
                  </Select>
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
                <div key={s.id} className="flex items-center justify-between p-3 bg-white dark:bg-card rounded-lg border">
                  <div className="flex items-center gap-4">
                    <div className="text-sm font-mono font-bold text-primary">{formatTime(s.start_time)}<br /><span className="text-muted-foreground font-normal">{formatTime(s.end_time)}</span></div>
                    <div>
                      <p className="font-semibold">{s.classes?.name}</p>
                      <p className="text-sm text-muted-foreground">{s.subjects?.name}</p>
                    </div>
                  </div>
                  <Button size="sm">Mulai Pertemuan</Button>
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
                          <span>{s.subjects?.name}</span>
                        </div>
                        {s.room && (
                          <div className="flex items-center gap-1 opacity-70">
                            <MapPin className="h-3 w-3" />
                            <span>{s.room}</span>
                          </div>
                        )}
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
