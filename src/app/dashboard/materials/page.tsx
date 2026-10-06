'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Upload, Download, FileText, Search, Trash2, Link, Library } from "lucide-react"
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

const DUMMY_MATERIALS = [
  {
    id: 1, title: "Pengantar Algoritma dan Pemrograman", description: "Materi pembuka tentang konsep dasar algoritma dan pemrograman komputer.",
    subject: "Informatika", className: "X RPL 1", topic: "Algoritma Dasar", fileType: "PDF",
    fileName: "Pengantar_Algoritma.pdf", meetingNumber: 1, uploadedAt: new Date("2026-09-01"),
  },
  {
    id: 2, title: "Slide Presentasi SQL Dasar", description: "Presentasi PowerPoint untuk materi SQL SELECT, INSERT, UPDATE, DELETE.",
    subject: "Basis Data", className: "XI RPL 2", topic: "SQL Dasar", fileType: "PPTX",
    fileName: "SQL_Dasar.pptx", meetingNumber: 4, uploadedAt: new Date("2026-09-20"),
  },
  {
    id: 3, title: "Video Tutorial HTML CSS", description: "Link video tutorial pembuatan halaman web menggunakan HTML dan CSS.",
    subject: "Pemrograman Web", className: "XII RPL 1", topic: "HTML & CSS", fileType: "Link",
    fileName: "https://youtube.com/...", meetingNumber: 2, uploadedAt: new Date("2026-09-25"),
  },
]

const FILE_TYPE_COLORS: Record<string, string> = {
  PDF: "text-red-500",
  PPTX: "text-orange-500",
  DOCX: "text-blue-500",
  XLSX: "text-green-500",
  Link: "text-purple-500",
  Video: "text-pink-500",
}

export default function MaterialsPage() {
  const [materials] = useState(DUMMY_MATERIALS)
  const [searchQuery, setSearchQuery] = useState("")
  const [open, setOpen] = useState(false)
  const [fileType, setFileType] = useState("PDF")

  const filtered = materials.filter(m =>
    m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.topic.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bahan Ajar</h1>
          <p className="text-muted-foreground">Kelola semua bahan ajar dan materi pembelajaran.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button><Plus className="mr-2 h-4 w-4" /> Tambah Bahan Ajar</Button>} />
          <DialogContent className="sm:max-w-[520px] max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Tambah Bahan Ajar Baru</DialogTitle>
              <DialogDescription>Upload file atau tambahkan link materi pembelajaran.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Judul Bahan Ajar</Label>
                <Input placeholder="Contoh: Pengantar Algoritma" />
              </div>
              <div className="grid gap-2">
                <Label>Deskripsi</Label>
                <Textarea placeholder="Deskripsi singkat materi..." className="min-h-[70px]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Mata Pelajaran</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Pilih Mapel" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="informatika">Informatika</SelectItem>
                      <SelectItem value="basis-data">Basis Data</SelectItem>
                      <SelectItem value="pemweb">Pemrograman Web</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Kelas</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Pilih Kelas" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="x-rpl-1">X RPL 1</SelectItem>
                      <SelectItem value="xi-rpl-2">XI RPL 2</SelectItem>
                      <SelectItem value="xii-rpl-1">XII RPL 1</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Materi / Topik</Label>
                  <Input placeholder="Contoh: Algoritma Dasar" />
                </div>
                <div className="grid gap-2">
                  <Label>Pertemuan Ke-</Label>
                  <Input type="number" placeholder="1" min={1} />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Tipe File</Label>
                <Select defaultValue="PDF" onValueChange={(v) => setFileType(v ?? "PDF")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PDF">PDF</SelectItem>
                    <SelectItem value="PPTX">PowerPoint (PPTX)</SelectItem>
                    <SelectItem value="DOCX">Word (DOCX)</SelectItem>
                    <SelectItem value="XLSX">Excel (XLSX)</SelectItem>
                    <SelectItem value="Link">Link / URL</SelectItem>
                    <SelectItem value="Video">Video</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {fileType === "Link" ? (
                <div className="grid gap-2">
                  <Label>URL / Link</Label>
                  <Input placeholder="https://..." type="url" />
                </div>
              ) : (
                <div className="grid gap-2">
                  <Label>File</Label>
                  <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Klik untuk memilih file</p>
                    <p className="text-xs text-muted-foreground mt-1">Maks. 50MB</p>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
              <Button onClick={() => setOpen(false)}>Simpan</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Cari bahan ajar, mata pelajaran, atau topik..."
          className="pl-10"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed rounded-lg">
          <Library className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">Belum ada bahan ajar</h3>
          <p className="text-sm text-muted-foreground mb-4">Tambahkan bahan ajar atau link materi pertama Anda.</p>
          <Button variant="outline" onClick={() => setOpen(true)}>Tambah Bahan Ajar</Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map(m => (
            <Card key={m.id} className="hover:shadow-md transition-shadow flex flex-col">
              <CardHeader className="pb-2">
                <div className="flex items-start gap-3">
                  <div className={`flex-shrink-0 mt-0.5 ${FILE_TYPE_COLORS[m.fileType]}`}>
                    {m.fileType === "Link" ? <Link className="h-8 w-8" /> : <FileText className="h-8 w-8" />}
                  </div>
                  <div>
                    <CardTitle className="text-sm leading-snug">{m.title}</CardTitle>
                    <Badge variant="secondary" className="text-xs mt-1">{m.fileType}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 space-y-3">
                <p className="text-xs text-muted-foreground line-clamp-2">{m.description}</p>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="outline" className="text-xs">{m.subject}</Badge>
                  <Badge variant="outline" className="text-xs">{m.className}</Badge>
                  <Badge variant="outline" className="text-xs">Pertemuan {m.meetingNumber}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">Topik: {m.topic}</p>
                <p className="text-xs text-muted-foreground">{format(m.uploadedAt, "d MMM yyyy", { locale: idLocale })}</p>
              </CardContent>
              <div className="flex gap-2 px-6 pb-4">
                <Button variant="outline" size="sm" className="flex-1">
                  <Download className="mr-1 h-3 w-3" />Download
                </Button>
                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive px-2">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
