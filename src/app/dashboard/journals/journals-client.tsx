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
import { Plus, BookOpen, Calendar, Eye, Loader2, Pencil, Trash2, FileSpreadsheet, FileDown } from "lucide-react"
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
import { createJournal, updateJournal, deleteJournal } from "./actions"
import { useToast } from "@/hooks/use-toast"
import { exportRowsToExcel, exportRowsToPdf } from "@/lib/export-data"

export default function JournalsClient({ initialJournals, classes, subjects }: { 
  initialJournals: any[], 
  classes: any[], 
  subjects: any[] 
}) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [viewJournal, setViewJournal] = useState<any | null>(null)
  const [editingJournal, setEditingJournal] = useState<any | null>(null)
  const [journalToDelete, setJournalToDelete] = useState<any | null>(null)
  const { toast } = useToast()

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

  async function onEdit(formData: FormData) {
    if (!editingJournal) return
    setIsLoading(true)
    const result = await updateJournal(editingJournal.id, formData)
    setIsLoading(false)
    if (result?.error) {
      toast({ title: "Gagal", description: result.error, variant: "destructive" })
      return
    }
    setEditingJournal(null)
    toast({ title: "Berhasil", description: "Jurnal diperbarui." })
    window.location.reload()
  }

  async function onDelete() {
    if (!journalToDelete) return
    setIsLoading(true)
    const result = await deleteJournal(journalToDelete.id)
    setIsLoading(false)
    if (result?.error) {
      toast({ title: "Gagal", description: result.error, variant: "destructive" })
      return
    }
    setJournalToDelete(null)
    toast({ title: "Dihapus", description: "Jurnal, pertemuan, dan absensi terkait telah dihapus." })
    window.location.reload()
  }

  const journalExport = {
    title: "Jurnal Mengajar",
    fileName: "jurnal-mengajar",
    subtitle: `Total jurnal: ${initialJournals.length}`,
    headers: ["No", "Tanggal", "Kelas", "Mata Pelajaran", "Pertemuan", "Topik", "Metode", "Kendala", "Tindak Lanjut"],
    rows: initialJournals.map((journal, index) => [
      index + 1,
      journal.meetings?.date
        ? format(parseISO(journal.meetings.date), "dd/MM/yyyy")
        : "-",
      journal.meetings?.classes?.name || "-",
      journal.meetings?.subjects?.name || "-",
      journal.meetings?.meeting_number || "-",
      journal.topic || "-",
      journal.method || "-",
      journal.obstacles || "-",
      journal.follow_up || "-",
    ]),
  }

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Jurnal Mengajar</h1>
          <p className="text-muted-foreground">Dokumentasi kegiatan pembelajaran setiap pertemuan.</p>
        </div>
        <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:justify-end">
          {initialJournals.length > 0 && (
            <>
              <Button variant="outline" onClick={() => exportRowsToExcel(journalExport)}>
                <FileSpreadsheet className="mr-2 h-4 w-4" /> Excel
              </Button>
              <Button variant="outline" onClick={() => exportRowsToPdf(journalExport)}>
                <FileDown className="mr-2 h-4 w-4" /> PDF
              </Button>
            </>
          )}
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
                
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="classId">Kelas</Label>
                    <Select name="classId" required items={classes.map(c => ({ value: c.id, label: c.name }))}>
                      <SelectTrigger id="classId"><SelectValue placeholder="Pilih Kelas" /></SelectTrigger>
                      <SelectContent>
                        {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="subjectId">Mata Pelajaran</Label>
                    <Select name="subjectId" required items={subjects.map(s => ({ value: s.id, label: s.name }))}>
                      <SelectTrigger id="subjectId"><SelectValue placeholder="Pilih Mapel" /></SelectTrigger>
                      <SelectContent>
                        {subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
      </div>

      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
        {initialJournals.length === 0 ? (
          <p className="text-muted-foreground">Belum ada jurnal mengajar.</p>
        ) : (
          initialJournals.map(j => (
            <Card key={j.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-base">{j.topic}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary">Pertemuan {j.meetings?.meeting_number}</Badge>
                      <Badge variant="outline">{j.meetings?.classes?.name}</Badge>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => setViewJournal(j)}><Eye className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => setEditingJournal(j)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => setJournalToDelete(j)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
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

      <Dialog open={!!editingJournal} onOpenChange={(value) => !value && setEditingJournal(null)}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <form key={editingJournal?.id} action={onEdit}>
            <DialogHeader><DialogTitle>Edit Jurnal</DialogTitle><DialogDescription>Perbarui jurnal dan data pertemuan.</DialogDescription></DialogHeader>
            {editingJournal && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="grid gap-2"><Label>Kelas</Label>
                    <Select name="classId" defaultValue={editingJournal.meetings?.classes?.id} items={classes.map(x => ({ value: x.id, label: x.name }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{classes.map(x => <SelectItem key={x.id} value={x.id}>{x.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2"><Label>Mata Pelajaran</Label>
                    <Select name="subjectId" defaultValue={editingJournal.meetings?.subjects?.id} items={subjects.map(x => ({ value: x.id, label: x.name }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{subjects.map(x => <SelectItem key={x.id} value={x.id}>{x.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="grid gap-2"><Label>Pertemuan Ke-</Label><Input name="meetingNumber" type="number" min={1} defaultValue={editingJournal.meetings?.meeting_number} required /></div>
                  <div className="grid gap-2"><Label>Tanggal</Label><Input name="date" type="date" defaultValue={editingJournal.meetings?.date} required /></div>
                </div>
                <div className="grid gap-2"><Label>Materi / Topik</Label><Input name="topic" defaultValue={editingJournal.topic} required /></div>
                <div className="grid gap-2"><Label>Tujuan Pembelajaran</Label><Textarea name="objectives" defaultValue={editingJournal.learning_objectives || ""} /></div>
                <div className="grid gap-2"><Label>Kegiatan Pembelajaran</Label><Textarea name="activities" defaultValue={editingJournal.activities || ""} /></div>
                <div className="grid gap-2"><Label>Metode</Label><Input name="method" defaultValue={editingJournal.method || ""} /></div>
                <div className="grid gap-2"><Label>Catatan</Label><Textarea name="notes" defaultValue={editingJournal.notes || ""} /></div>
                <div className="grid gap-2"><Label>Kendala</Label><Textarea name="obstacles" defaultValue={editingJournal.obstacles || ""} /></div>
                <div className="grid gap-2"><Label>Tindak Lanjut</Label><Textarea name="followUp" defaultValue={editingJournal.follow_up || ""} /></div>
              </div>
            )}
            <DialogFooter><Button type="button" variant="outline" onClick={() => setEditingJournal(null)}>Batal</Button><Button type="submit" disabled={isLoading}>Simpan</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!journalToDelete} onOpenChange={(value) => !value && setJournalToDelete(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Hapus Jurnal?</DialogTitle><DialogDescription>Pertemuan dan absensi terkait ikut dihapus. Bahan ajar tetap tersimpan tetapi tidak lagi terhubung ke pertemuan ini.</DialogDescription></DialogHeader>
          <DialogFooter><Button variant="outline" onClick={() => setJournalToDelete(null)}>Batal</Button><Button variant="destructive" onClick={onDelete} disabled={isLoading}>Hapus</Button></DialogFooter>
        </DialogContent>
      </Dialog>

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
