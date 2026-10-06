'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, BookOpen, Calendar, Eye } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { format } from "date-fns"
import { id as idLocale } from "date-fns/locale"

const DUMMY_JOURNALS = [
  {
    id: 1, meetingNumber: 5, date: new Date("2026-10-06"), className: "X RPL 1",
    subject: "Informatika", topic: "Algoritma Dasar", objectives: "Siswa mampu memahami dan menerapkan algoritma dasar.",
    activities: "1. Pendahuluan (10 menit)\n2. Penjelasan materi algoritma\n3. Latihan soal\n4. Penutup", method: "Ceramah, Diskusi",
    notes: "Siswa cukup antusias", obstacles: "Proyektor bermasalah di awal", followUp: "Akan diulang materi bagian terakhir"
  },
  {
    id: 2, meetingNumber: 4, date: new Date("2026-09-29"), className: "XI RPL 2",
    subject: "Basis Data", topic: "SQL Dasar - SELECT", objectives: "Siswa mampu menggunakan perintah SELECT.",
    activities: "1. Review materi sebelumnya\n2. Demo query SELECT\n3. Praktikum", method: "Demonstrasi, Praktikum",
    notes: "Semua siswa hadir", obstacles: "", followUp: "Lanjut ke INSERT minggu depan"
  },
]

export default function JournalsPage() {
  const [journals] = useState(DUMMY_JOURNALS)
  const [open, setOpen] = useState(false)
  const [viewJournal, setViewJournal] = useState<typeof DUMMY_JOURNALS[0] | null>(null)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Jurnal Mengajar</h1>
          <p className="text-muted-foreground">Dokumentasi kegiatan pembelajaran setiap pertemuan.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button><Plus className="mr-2 h-4 w-4" /> Buat Jurnal</Button>} />
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Jurnal Mengajar Baru</DialogTitle>
              <DialogDescription>Catat kegiatan pembelajaran pertemuan ini.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Kelas</Label>
                  <Select><SelectTrigger><SelectValue placeholder="Pilih Kelas" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="x-rpl-1">X RPL 1</SelectItem>
                      <SelectItem value="xi-rpl-2">XI RPL 2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Mata Pelajaran</Label>
                  <Select><SelectTrigger><SelectValue placeholder="Pilih Mapel" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="informatika">Informatika</SelectItem>
                      <SelectItem value="basis-data">Basis Data</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Pertemuan Ke-</Label>
                  <Input type="number" placeholder="5" min={1} />
                </div>
                <div className="grid gap-2">
                  <Label>Tanggal</Label>
                  <Input type="date" defaultValue={format(new Date(), "yyyy-MM-dd")} />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Materi / Topik</Label>
                <Input placeholder="Contoh: Algoritma Dasar" />
              </div>
              <div className="grid gap-2">
                <Label>Tujuan Pembelajaran</Label>
                <Textarea placeholder="Siswa dapat memahami..." className="min-h-[80px]" />
              </div>
              <div className="grid gap-2">
                <Label>Kegiatan Pembelajaran</Label>
                <Textarea placeholder="1. Pendahuluan...\n2. Kegiatan inti...\n3. Penutup..." className="min-h-[120px]" />
              </div>
              <div className="grid gap-2">
                <Label>Metode Pembelajaran</Label>
                <Input placeholder="Ceramah, Diskusi, Praktikum" />
              </div>
              <div className="grid gap-2">
                <Label>Catatan Umum</Label>
                <Textarea placeholder="Catatan umum..." className="min-h-[60px]" />
              </div>
              <div className="grid gap-2">
                <Label>Kendala / Hambatan</Label>
                <Textarea placeholder="Kendala yang ditemui..." className="min-h-[60px]" />
              </div>
              <div className="grid gap-2">
                <Label>Tindak Lanjut</Label>
                <Textarea placeholder="Rencana tindak lanjut..." className="min-h-[60px]" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
              <Button onClick={() => setOpen(false)}>Simpan Jurnal</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {journals.map(j => (
          <Card key={j.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base">{j.topic}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary">Pertemuan {j.meetingNumber}</Badge>
                    <Badge variant="outline">{j.className}</Badge>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setViewJournal(j)}>
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" />{j.subject}</span>
                <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{format(j.date, "d MMM yyyy", { locale: idLocale })}</span>
              </div>
              <p className="text-sm mt-3 line-clamp-2 text-muted-foreground">{j.objectives}</p>
              {j.method && <div className="mt-2"><Badge variant="outline" className="text-xs">{j.method}</Badge></div>}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* View Journal Dialog */}
      <Dialog open={!!viewJournal} onOpenChange={() => setViewJournal(null)}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Jurnal — {viewJournal?.topic}</DialogTitle>
            <DialogDescription>
              {viewJournal?.className} | {viewJournal?.subject} | Pertemuan {viewJournal?.meetingNumber} |{" "}
              {viewJournal && format(viewJournal.date, "d MMMM yyyy", { locale: idLocale })}
            </DialogDescription>
          </DialogHeader>
          {viewJournal && (
            <div className="space-y-4 py-4">
              <div><p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Tujuan Pembelajaran</p><p className="text-sm">{viewJournal.objectives}</p></div>
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
