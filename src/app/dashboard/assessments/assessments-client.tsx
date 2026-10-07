/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, GraduationCap, ChevronLeft, Loader2, Save } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { createAssessment, getAssessmentScores, saveScores } from "./actions"
import { useToast } from "@/hooks/use-toast"

const ASSESSMENT_TYPES = ["Tugas", "Kuis", "Asesmen Formatif", "Asesmen Sumatif", "Proyek", "Praktik", "UTS/STS", "UAS/SAS"]

const TYPE_BADGE: Record<string, string> = {
  "Tugas": "bg-blue-100 text-blue-700", "Kuis": "bg-green-100 text-green-700",
  "UTS/STS": "bg-orange-100 text-orange-700", "Proyek": "bg-purple-100 text-purple-700",
  "Asesmen Sumatif": "bg-red-100 text-red-700", "Asesmen Formatif": "bg-teal-100 text-teal-700",
}

export default function AssessmentsClient({ assessments: initialAssessments, classes, subjects }: {
  assessments: any[], classes: any[], subjects: any[]
}) {
  const [assessments, setAssessments] = useState<any[]>(initialAssessments)
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [selectedAssessment, setSelectedAssessment] = useState<any | null>(null)
  const [students, setStudents] = useState<any[]>([])
  const [localScores, setLocalScores] = useState<Record<string, string>>({})
  const [loadingScores, setLoadingScores] = useState(false)
  const { toast } = useToast()

  async function handleViewScores(assessment: any) {
    setLoadingScores(true)
    setSelectedAssessment(assessment)
    const res = await getAssessmentScores(assessment.id)
    if (res.error) {
      toast({ title: "Error", description: res.error, variant: "destructive" })
      setLoadingScores(false)
      return
    }
    setStudents(res.students || [])
    const scoreMap: Record<string, string> = {}
    res.scores?.forEach((s: any) => { scoreMap[s.student_id] = String(s.score) })
    setLocalScores(scoreMap)
    setLoadingScores(false)
  }

  function handleAddAssessment(formData: FormData) {
    startTransition(async () => {
      const result = await createAssessment(formData)
      if (result.error) {
        toast({ title: "Gagal", description: result.error, variant: "destructive" })
      } else {
        toast({ title: "Berhasil!", description: "Komponen penilaian ditambahkan." })
        setOpen(false)
        window.location.reload()
      }
    })
  }

  function handleSaveScores() {
    if (!selectedAssessment) return
    const scores = students.map(s => ({
      student_id: s.id,
      score: parseFloat(localScores[s.id] || '0') || 0
    }))
    startTransition(async () => {
      const result = await saveScores(selectedAssessment.id, scores)
      if (result.error) {
        toast({ title: "Gagal menyimpan", description: result.error, variant: "destructive" })
      } else {
        toast({ title: "Berhasil!", description: "Nilai siswa berhasil disimpan." })
      }
    })
  }

  if (selectedAssessment) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <Button variant="ghost" size="sm" className="-ml-2 mb-2" onClick={() => setSelectedAssessment(null)}>
            <ChevronLeft className="h-4 w-4 mr-1" /> Kembali ke Daftar Komponen
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Input Nilai: {selectedAssessment.title}</h1>
          <p className="text-muted-foreground">{selectedAssessment.classes?.name} · {selectedAssessment.subjects?.name} · Bobot {selectedAssessment.weight}%</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            {loadingScores ? (
              <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>
            ) : students.length === 0 ? (
              <p className="text-center py-12 text-muted-foreground">Belum ada siswa di kelas ini.</p>
            ) : (
              <>
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>No</TableHead>
                        <TableHead>Nama Siswa</TableHead>
                        <TableHead className="text-center w-32">Nilai (0-100)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students.map((s, i) => (
                        <TableRow key={s.id}>
                          <TableCell>{i + 1}</TableCell>
                          <TableCell className="font-medium">{s.full_name}</TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              className="w-24 text-center mx-auto h-8"
                              value={localScores[s.id] ?? ''}
                              onChange={e => setLocalScores(prev => ({ ...prev, [s.id]: e.target.value }))}
                              min={0} max={100}
                              placeholder="—"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="flex justify-end mt-6">
                  <Button onClick={handleSaveScores} disabled={isPending}>
                    {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Simpan Semua Nilai
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Penilaian</h1>
          <p className="text-muted-foreground">Kelola komponen penilaian dan input nilai siswa.</p>
        </div>
        <Button onClick={() => setOpen(true)}><Plus className="mr-2 h-4 w-4" /> Buat Komponen Nilai</Button>
      </div>

      <Tabs defaultValue="components">
        <TabsList>
          <TabsTrigger value="components">Komponen Penilaian</TabsTrigger>
        </TabsList>

        <TabsContent value="components" className="mt-6">
          {assessments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed rounded-lg">
              <GraduationCap className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">Belum ada komponen penilaian</h3>
              <p className="text-sm text-muted-foreground mb-4">Buat komponen penilaian seperti Tugas, Kuis, atau UTS.</p>
              <Button onClick={() => setOpen(true)}>Buat Komponen Nilai</Button>
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
                        <p className="text-sm text-muted-foreground">
                          {a.classes?.name} · {a.subjects?.name}
                          {a.weight ? ` · Bobot: ${a.weight}%` : ''}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleViewScores(a)}>
                      Input Nilai
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Add Assessment Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <form action={handleAddAssessment}>
            <DialogHeader>
              <DialogTitle>Buat Komponen Penilaian</DialogTitle>
              <DialogDescription>Tambahkan komponen nilai baru (Tugas, Kuis, UTS, dll).</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Judul</Label>
                <Input id="title" name="title" placeholder="Contoh: Tugas 1 - Flowchart" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="type">Jenis Penilaian</Label>
                  <Select name="type" required>
                    <SelectTrigger id="type"><SelectValue placeholder="Pilih Jenis" /></SelectTrigger>
                    <SelectContent>{ASSESSMENT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="weight">Bobot (%)</Label>
                  <Input id="weight" name="weight" type="number" placeholder="20" min={1} max={100} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="classId">Kelas</Label>
                  <Select name="classId" required>
                    <SelectTrigger id="classId"><SelectValue placeholder="Pilih Kelas" /></SelectTrigger>
                    <SelectContent>{classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="subjectId">Mata Pelajaran</Label>
                  <Select name="subjectId" required>
                    <SelectTrigger id="subjectId"><SelectValue placeholder="Pilih Mapel" /></SelectTrigger>
                    <SelectContent>{subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Batal</Button>
              <Button type="submit" disabled={isPending}>{isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Simpan</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
