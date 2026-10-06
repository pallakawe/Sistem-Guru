/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, BookOpen, Calendar, Eye, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { format, parseISO } from "date-fns"
import { id as idLocale } from "date-fns/locale"
import { createJournal } from "./actions"

export default function JournalsClient({ initialJournals, classes, subjects }: { 
  initialJournals: any[], 
  classes: any[], 
  subjects: any[] 
}) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [viewJournal, setViewJournal] = useState<any | null>(null)

  async function onSubmit(formData: FormData) {
    setIsLoading(true)
    setError("")
    
    const result = await createJournal(formData)
    
    if (result?.error) {
      setError(result.error)
      setIsLoading(false)
      return
    }

    setOpen(false)
    setIsLoading(false)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Jurnal Mengajar</h1>
          <p className="text-muted-foreground">Dokumentasi kegiatan pembelajaran setiap pertemuan.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button><Plus className="mr-2 h-4 w-4" /> Buat Jurnal</Button>} />
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <form action={onSubmit}>
              <DialogHeader>
                <DialogTitle>Jurnal Mengajar Baru</DialogTitle>
                <DialogDescription>Catat kegiatan pembelajaran pertemuan ini.</DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="classId">Kelas</Label>
                    <Select name="classId" required>
                      <SelectTrigger id="classId"><SelectValue placeholder="Pilih Kelas" /></SelectTrigger>
                      <SelectContent>
                        {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="subjectId">Mata Pelajaran</Label>
                    <Select name="subjectId" required>
                      <SelectTrigger id="subjectId"><SelectValue placeholder="Pilih Mapel" /></SelectTrigger>
                      <SelectContent>
                        {subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="meetingNumber">Pertemuan Ke-</Label>
                    <Input id="meetingNumber" name="meetingNumber" type="number" placeholder="5" min={1} required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="date">Tanggal</Label>
                    <Input id="date" name="date" type="date" defaultValue={format(new Date(), "yyyy-MM-dd")} required />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="topic">Materi / Topik</Label>
                  <Input id="topic" name="topic" placeholder="Contoh: Algoritma Dasar" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="objectives">Tujuan Pembelajaran</Label>
                  <Textarea id="objectives" name="objectives" placeholder="Siswa dapat memahami..." className="min-h-[80px]" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="activities">Kegiatan Pembelajaran</Label>
                  <Textarea id="activities" name="activities" placeholder="1. Pendahuluan...\n2. Kegiatan inti...\n3. Penutup..." className="min-h-[120px]" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="method">Metode Pembelajaran</Label>
                  <Input id="method" name="method" placeholder="Ceramah, Diskusi, Praktikum" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="notes">Catatan Umum</Label>
                  <Textarea id="notes" name="notes" placeholder="Catatan umum..." className="min-h-[60px]" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="obstacles">Kendala / Hambatan</Label>
                  <Textarea id="obstacles" name="obstacles" placeholder="Kendala yang ditemui..." className="min-h-[60px]" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="followUp">Tindak Lanjut</Label>
                  <Textarea id="followUp" name="followUp" placeholder="Rencana tindak lanjut..." className="min-h-[60px]" />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Batal</Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Simpan Jurnal
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {initialJournals.length === 0 ? (
          <p className="text-muted-foreground">Belum ada jurnal mengajar.</p>
        ) : (
          initialJournals.map(j => (
            <Card key={j.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{j.topic}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary">Pertemuan {j.meetings?.meeting_number}</Badge>
                      <Badge variant="outline">{j.meetings?.classes?.name}</Badge>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setViewJournal(j)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" />{j.meetings?.subjects?.name}</span>
                  <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{format(parseISO(j.meetings?.date), "d MMM yyyy", { locale: idLocale })}</span>
                </div>
                <p className="text-sm mt-3 line-clamp-2 text-muted-foreground">{j.learning_objectives}</p>
                {j.method && <div className="mt-2"><Badge variant="outline" className="text-xs">{j.method}</Badge></div>}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* View Journal Dialog */}
      <Dialog open={!!viewJournal} onOpenChange={(open) => !open && setViewJournal(null)}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Jurnal — {viewJournal?.topic}</DialogTitle>
            <DialogDescription>
              {viewJournal?.meetings?.classes?.name} | {viewJournal?.meetings?.subjects?.name} | Pertemuan {viewJournal?.meetings?.meeting_number} |{" "}
              {viewJournal && format(parseISO(viewJournal.meetings?.date), "d MMMM yyyy", { locale: idLocale })}
            </DialogDescription>
          </DialogHeader>
          {viewJournal && (
            <div className="space-y-4 py-4">
              <div><p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Tujuan Pembelajaran</p><p className="text-sm">{viewJournal.learning_objectives}</p></div>
              <div><p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Kegiatan Pembelajaran</p><p className="text-sm whitespace-pre-line">{viewJournal.activities}</p></div>
              <div><p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Metode</p><p className="text-sm">{viewJournal.method}</p></div>
              {viewJournal.notes && <div><p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Catatan</p><p className="text-sm">{viewJournal.notes}</p></div>}
              {viewJournal.obstacles && <div><p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Kendala</p><p className="text-sm">{viewJournal.obstacles}</p></div>}
              {viewJournal.followUp && <div><p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Tindak Lanjut</p><p className="text-sm">{viewJournal.followUp}</p></div>}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
