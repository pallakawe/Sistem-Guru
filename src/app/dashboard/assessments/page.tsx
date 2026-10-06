'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Plus, GraduationCap, ChevronRight } from "lucide-react"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"

const ASSESSMENT_TYPES = ["Tugas", "Kuis", "Asesmen Formatif", "Asesmen Sumatif", "Proyek", "Praktik", "UTS/STS", "UAS/SAS"]

const DUMMY_ASSESSMENTS = [
  { id: 1, title: "Tugas 1 - Flowchart", type: "Tugas", className: "X RPL 1", subject: "Informatika", weight: 15, createdAt: "2026-09-10" },
  { id: 2, title: "Kuis 1 - Algoritma", type: "Kuis", className: "X RPL 1", subject: "Informatika", weight: 10, createdAt: "2026-09-20" },
  { id: 3, title: "UTS Ganjil", type: "UTS/STS", className: "X RPL 1", subject: "Informatika", weight: 30, createdAt: "2026-10-01" },
  { id: 4, title: "Proyek Akhir Semester", type: "Proyek", className: "X RPL 1", subject: "Informatika", weight: 25, createdAt: "2026-10-05" },
]

const DUMMY_STUDENTS = [
  { id: 1, name: "Andi Prasetyo", scores: { 1: 85, 2: 90, 3: 78, 4: null } },
  { id: 2, name: "Bunga Lestari", scores: { 1: 92, 2: 88, 3: 85, 4: null } },
  { id: 3, name: "Cahyo Utomo", scores: { 1: 75, 2: 70, 3: 72, 4: null } },
  { id: 4, name: "Dina Mariana", scores: { 1: 88, 2: 95, 3: 90, 4: null } },
  { id: 5, name: "Eko Santoso", scores: { 1: 60, 2: 65, 3: 58, 4: null } },
]

function calcFinal(scores: Record<number, number | null>, assessments: typeof DUMMY_ASSESSMENTS) {
  let total = 0, totalWeight = 0
  for (const a of assessments) {
    const s = scores[a.id]
    if (s !== null && s !== undefined) {
      total += s * (a.weight / 100)
      totalWeight += a.weight
    }
  }
  if (totalWeight === 0) return "-"
  return ((total / totalWeight) * 100).toFixed(0)
}

const TYPE_BADGE: Record<string, string> = {
  "Tugas": "bg-blue-100 text-blue-700",
  "Kuis": "bg-green-100 text-green-700",
  "UTS/STS": "bg-orange-100 text-orange-700",
  "Proyek": "bg-purple-100 text-purple-700",
}

export default function AssessmentsPage() {
  const [assessments] = useState(DUMMY_ASSESSMENTS)
  const [students] = useState(DUMMY_STUDENTS)
  const [open, setOpen] = useState(false)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Penilaian</h1>
          <p className="text-muted-foreground">Kelola komponen penilaian dan input nilai siswa.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Buat Komponen Nilai</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle>Buat Komponen Penilaian</DialogTitle>
              <DialogDescription>Tambahkan komponen nilai baru (Tugas, Kuis, UTS, dll).</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Judul</Label>
                <Input placeholder="Contoh: Tugas 1 - Flowchart" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Jenis Penilaian</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Pilih Jenis" /></SelectTrigger>
                    <SelectContent>
                      {ASSESSMENT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Bobot (%)</Label>
                  <Input type="number" placeholder="20" min={1} max={100} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Kelas</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Pilih Kelas" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="x-rpl-1">X RPL 1</SelectItem>
                      <SelectItem value="xi-rpl-2">XI RPL 2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Mata Pelajaran</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Pilih Mapel" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="informatika">Informatika</SelectItem>
                      <SelectItem value="basis-data">Basis Data</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
              <Button onClick={() => setOpen(false)}>Simpan</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="scores">
        <TabsList>
          <TabsTrigger value="scores">Rekap Nilai</TabsTrigger>
          <TabsTrigger value="components">Komponen Penilaian</TabsTrigger>
        </TabsList>

        <TabsContent value="scores" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Rekap Nilai — X RPL 1 | Informatika</CardTitle>
              <CardDescription>
                Total bobot:{" "}
                {assessments.reduce((s, a) => s + a.weight, 0)}%
                {" "}— Bobot dapat dikonfigurasi per komponen.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="sticky left-0 bg-background w-40">Nama Siswa</TableHead>
                      {assessments.map(a => (
                        <TableHead key={a.id} className="text-center min-w-[100px]">
                          <div className="text-xs font-medium">{a.title}</div>
                          <div className="text-xs text-muted-foreground">Bobot {a.weight}%</div>
                        </TableHead>
                      ))}
                      <TableHead className="text-center min-w-[100px] bg-primary/5">Nilai Akhir</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map(s => {
                      const final = calcFinal(s.scores, assessments)
                      const finalNum = final === "-" ? null : Number(final)
                      return (
                        <TableRow key={s.id}>
                          <TableCell className="sticky left-0 bg-background font-medium">{s.name}</TableCell>
                          {assessments.map(a => (
                            <TableCell key={a.id} className="text-center">
                              {s.scores[a.id] !== null && s.scores[a.id] !== undefined ? (
                                <Input
                                  type="number"
                                  className="w-16 text-center mx-auto h-8"
                                  defaultValue={s.scores[a.id]!}
                                  min={0}
                                  max={100}
                                />
                              ) : (
                                <Input
                                  type="number"
                                  className="w-16 text-center mx-auto h-8 border-dashed"
                                  placeholder="—"
                                  min={0}
                                  max={100}
                                />
                              )}
                            </TableCell>
                          ))}
                          <TableCell className="text-center font-bold bg-primary/5">
                            <Badge
                              className={
                                finalNum === null ? "" :
                                finalNum >= 75 ? "bg-green-100 text-green-700 hover:bg-green-100" :
                                "bg-red-100 text-red-700 hover:bg-red-100"
                              }
                              variant="secondary"
                            >
                              {final}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-4 flex justify-end">
                <Button>Simpan Semua Nilai</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="components" className="mt-6">
          {assessments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed rounded-lg">
              <GraduationCap className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">Belum ada komponen penilaian</h3>
              <p className="text-sm text-muted-foreground mb-4">Buat komponen penilaian seperti Tugas, Kuis, atau UTS.</p>
              <Button variant="outline" onClick={() => setOpen(true)}>Buat Komponen Nilai</Button>
            </div>
          ) : (
            <div className="grid gap-3">
              {assessments.map(a => (
                <Card key={a.id} className="hover:shadow-sm transition-shadow">
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      <div className={`text-sm px-2 py-1 rounded-md font-medium ${TYPE_BADGE[a.type] || "bg-gray-100 text-gray-700"}`}>
                        {a.type}
                      </div>
                      <div>
                        <h4 className="font-medium">{a.title}</h4>
                        <p className="text-sm text-muted-foreground">{a.className} · {a.subject} · Bobot: {a.weight}%</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">Input Nilai <ChevronRight className="ml-1 h-4 w-4" /></Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
