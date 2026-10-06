'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { CalendarIcon, CheckCircle2 } from "lucide-react"

export default function AttendancePage() {
  const [date, setDate] = useState<Date>(new Date())
  
  // Dummy student data
  const [students, setStudents] = useState([
    { id: 1, name: "Andi Prasetyo", status: "H" },
    { id: 2, name: "Bunga Lestari", status: "H" },
    { id: 3, name: "Cahyo Utomo", status: "H" },
    { id: 4, name: "Dina Mariana", status: "H" },
  ])

  const setAllPresent = () => {
    setStudents(students.map(s => ({ ...s, status: "H" })))
  }

  const updateStatus = (id: number, status: string) => {
    setStudents(students.map(s => s.id === id ? { ...s, status } : s))
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Absensi Cepat</h1>
        <p className="text-muted-foreground">
          Catat kehadiran siswa dengan mudah dan cepat.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        {/* Selection Area */}
        <Card className="md:col-span-1 h-fit">
          <CardHeader>
            <CardTitle>Pilih Pertemuan</CardTitle>
            <CardDescription>Tentukan detail pertemuan hari ini</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Tanggal</Label>
              <Popover>
                <PopoverTrigger render={
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pilih Tanggal</span>}
                  </Button>
                } />
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(d) => d && setDate(d)}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label>Kelas</Label>
              <Select defaultValue="x-rpl-1">
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Kelas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="x-rpl-1">X RPL 1</SelectItem>
                  <SelectItem value="xi-rpl-2">XI RPL 2</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Mata Pelajaran</Label>
              <Select defaultValue="informatika">
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Mapel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="informatika">Informatika</SelectItem>
                  <SelectItem value="basis-data">Basis Data</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Pertemuan Ke-</Label>
              <Select defaultValue="5">
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Pertemuan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Pertemuan 1</SelectItem>
                  <SelectItem value="5">Pertemuan 5</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button className="w-full mt-4">Tampilkan Daftar Siswa</Button>
          </CardContent>
        </Card>

        {/* Student List */}
        <Card className="md:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Daftar Siswa</CardTitle>
              <CardDescription>X RPL 1 - Informatika</CardDescription>
            </div>
            <Button variant="secondary" onClick={setAllPresent}>
              <CheckCircle2 className="mr-2 h-4 w-4" /> Hadir Semua
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {students.map((student, index) => (
                <div key={student.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3 mb-3 sm:mb-0">
                    <span className="text-muted-foreground w-6">{index + 1}</span>
                    <span className="font-medium">{student.name}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant={student.status === "H" ? "default" : "outline"}
                      className={student.status === "H" ? "bg-green-600 hover:bg-green-700" : ""}
                      onClick={() => updateStatus(student.id, "H")}
                    >Hadir</Button>
                    <Button 
                      size="sm" 
                      variant={student.status === "S" ? "default" : "outline"}
                      className={student.status === "S" ? "bg-blue-600 hover:bg-blue-700" : ""}
                      onClick={() => updateStatus(student.id, "S")}
                    >Sakit</Button>
                    <Button 
                      size="sm" 
                      variant={student.status === "I" ? "default" : "outline"}
                      className={student.status === "I" ? "bg-yellow-600 hover:bg-yellow-700" : ""}
                      onClick={() => updateStatus(student.id, "I")}
                    >Izin</Button>
                    <Button 
                      size="sm" 
                      variant={student.status === "A" ? "default" : "outline"}
                      className={student.status === "A" ? "bg-red-600 hover:bg-red-700" : ""}
                      onClick={() => updateStatus(student.id, "A")}
                    >Alpa</Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <Button size="lg" className="w-full sm:w-auto">Simpan Absensi</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
