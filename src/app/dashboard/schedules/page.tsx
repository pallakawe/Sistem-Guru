'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Clock, MapPin, BookOpen } from "lucide-react"
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

const DAYS = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"]

const DUMMY_SCHEDULES = [
  { id: 1, day: "Senin", startTime: "08:00", endTime: "09:30", className: "X RPL 1", subject: "Informatika", room: "Ruang 101" },
  { id: 2, day: "Senin", startTime: "10:00", endTime: "11:30", className: "XI RPL 2", subject: "Basis Data", room: "Lab Komputer 1" },
  { id: 3, day: "Selasa", startTime: "07:00", endTime: "08:30", className: "X RPL 1", subject: "Informatika", room: "Ruang 101" },
  { id: 4, day: "Rabu", startTime: "09:00", endTime: "10:30", className: "XII RPL 1", subject: "Pemrograman Web", room: "Lab Komputer 2" },
  { id: 5, day: "Kamis", startTime: "11:00", endTime: "12:30", className: "XI RPL 2", subject: "Basis Data", room: "Lab Komputer 1" },
  { id: 6, day: "Jumat", startTime: "07:30", endTime: "09:00", className: "X RPL 1", subject: "Informatika", room: "Ruang 101" },
]

const SUBJECT_COLORS: Record<string, string> = {
  "Informatika": "bg-blue-100 text-blue-700 border-blue-200",
  "Basis Data": "bg-green-100 text-green-700 border-green-200",
  "Pemrograman Web": "bg-purple-100 text-purple-700 border-purple-200",
}

export default function SchedulesPage() {
  const [schedules] = useState(DUMMY_SCHEDULES)
  const [open, setOpen] = useState(false)

  const today = new Date().toLocaleDateString('id-ID', { weekday: 'long' })
  const todaySchedules = schedules.filter(s => s.day === today)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Jadwal Mengajar</h1>
          <p className="text-muted-foreground">Kelola jadwal mengajar Anda per minggu.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button><Plus className="mr-2 h-4 w-4" /> Tambah Jadwal</Button>} />
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Tambah Jadwal Baru</DialogTitle>
              <DialogDescription>Isi detail jadwal mengajar Anda.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="day">Hari</Label>
                <Select>
                  <SelectTrigger id="day">
                    <SelectValue placeholder="Pilih Hari" />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="startTime">Jam Mulai</Label>
                  <Input id="startTime" type="time" defaultValue="08:00" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="endTime">Jam Selesai</Label>
                  <Input id="endTime" type="time" defaultValue="09:30" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="class">Kelas</Label>
                <Select>
                  <SelectTrigger id="class">
                    <SelectValue placeholder="Pilih Kelas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="x-rpl-1">X RPL 1</SelectItem>
                    <SelectItem value="xi-rpl-2">XI RPL 2</SelectItem>
                    <SelectItem value="xii-rpl-1">XII RPL 1</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="subject">Mata Pelajaran</Label>
                <Select>
                  <SelectTrigger id="subject">
                    <SelectValue placeholder="Pilih Mata Pelajaran" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="informatika">Informatika</SelectItem>
                    <SelectItem value="basis-data">Basis Data</SelectItem>
                    <SelectItem value="pemweb">Pemrograman Web</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="room">Ruangan</Label>
                <Input id="room" placeholder="Contoh: Ruang 101" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
              <Button onClick={() => setOpen(false)}>Simpan Jadwal</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Today's Schedule */}
      {todaySchedules.length > 0 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-primary flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Jadwal Hari Ini — {today}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              {todaySchedules.map(s => (
                <div key={s.id} className="flex items-center justify-between p-3 bg-white dark:bg-card rounded-lg border">
                  <div className="flex items-center gap-4">
                    <div className="text-sm font-mono font-bold text-primary">{s.startTime}<br /><span className="text-muted-foreground font-normal">{s.endTime}</span></div>
                    <div>
                      <p className="font-semibold">{s.className}</p>
                      <p className="text-sm text-muted-foreground">{s.subject}</p>
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
          const daySchedules = schedules.filter(s => s.day === day)
          return (
            <Card key={day} className={today === day ? "border-primary" : ""}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center justify-between">
                  {day}
                  {today === day && <Badge variant="default" className="text-xs">Hari Ini</Badge>}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {daySchedules.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">Tidak ada jadwal</p>
                ) : (
                  <div className="space-y-2">
                    {daySchedules.map(s => (
                      <div key={s.id} className={`p-3 rounded-lg border text-sm ${SUBJECT_COLORS[s.subject] || "bg-gray-100 text-gray-700"}`}>
                        <div className="flex items-center gap-1 font-mono text-xs mb-1 opacity-70">
                          <Clock className="h-3 w-3" />
                          {s.startTime} – {s.endTime}
                        </div>
                        <p className="font-semibold">{s.className}</p>
                        <div className="flex items-center gap-1 mt-1 opacity-70">
                          <BookOpen className="h-3 w-3" />
                          <span>{s.subject}</span>
                        </div>
                        <div className="flex items-center gap-1 opacity-70">
                          <MapPin className="h-3 w-3" />
                          <span>{s.room}</span>
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
