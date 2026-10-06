'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Upload, Download, FileText, Search, Trash2, FolderOpen } from "lucide-react"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import { format } from "date-fns"
import { id as idLocale } from "date-fns/locale"

const DOC_CATEGORIES = ["Administrasi Guru", "Perangkat Pembelajaran", "Bahan Ajar", "Penilaian", "Surat", "Laporan", "Dokumen Lainnya"]

const DUMMY_DOCS = [
  { id: 1, title: "SK Pembagian Tugas 2026/2027", category: "Administrasi Guru", fileName: "SK_Pembagian_Tugas.pdf", uploadedAt: new Date("2026-07-01") },
  { id: 2, title: "Surat Keterangan Aktif Mengajar", category: "Surat", fileName: "SKA_Mengajar.pdf", uploadedAt: new Date("2026-08-15") },
  { id: 3, title: "Laporan Kinerja Semester 1", category: "Laporan", fileName: "LKS1_2026.docx", uploadedAt: new Date("2026-09-01") },
  { id: 4, title: "Rekap Nilai Semester Gasal X RPL 1", category: "Penilaian", fileName: "Rekap_Nilai_XRPL1.xlsx", uploadedAt: new Date("2026-09-30") },
]

const CATEGORY_COLORS: Record<string, string> = {
  "Administrasi Guru": "bg-blue-100 text-blue-700",
  "Surat": "bg-yellow-100 text-yellow-700",
  "Laporan": "bg-green-100 text-green-700",
  "Penilaian": "bg-purple-100 text-purple-700",
  "Perangkat Pembelajaran": "bg-orange-100 text-orange-700",
  "Bahan Ajar": "bg-pink-100 text-pink-700",
  "Dokumen Lainnya": "bg-gray-100 text-gray-700",
}

const FILE_COLORS: Record<string, string> = {
  ".pdf": "text-red-500",
  ".docx": "text-blue-500",
  ".xlsx": "text-green-500",
  ".pptx": "text-orange-500",
}

function getExt(name: string) { return name.substring(name.lastIndexOf('.')) }
function getColor(name: string) { return FILE_COLORS[getExt(name)] || "text-gray-500" }

export default function DocumentsPage() {
  const [docs] = useState(DUMMY_DOCS)
  const [search, setSearch] = useState("")
  const [filterCat, setFilterCat] = useState("all")
  const [open, setOpen] = useState(false)

  const filtered = docs.filter(d =>
    (filterCat === "all" || d.category === filterCat) &&
    (d.title.toLowerCase().includes(search.toLowerCase()) || d.category.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dokumen</h1>
          <p className="text-muted-foreground">Pusat penyimpanan dokumen administrasi Anda.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Upload className="mr-2 h-4 w-4" /> Upload Dokumen</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle>Upload Dokumen</DialogTitle>
              <DialogDescription>Simpan dokumen administrasi Anda di sini.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Judul Dokumen</Label>
                <Input placeholder="Contoh: SK Pembagian Tugas" />
              </div>
              <div className="grid gap-2">
                <Label>Kategori</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Pilih Kategori" /></SelectTrigger>
                  <SelectContent>
                    {DOC_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>File</Label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-muted/50 cursor-pointer transition-colors">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Klik atau seret file ke sini</p>
                  <p className="text-xs text-muted-foreground mt-1">PDF, DOCX, XLSX (maks. 50MB)</p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
              <Button onClick={() => setOpen(false)}>Upload</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Cari dokumen..." className="pl-10" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={filterCat} onValueChange={setFilterCat}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Semua Kategori" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Kategori</SelectItem>
            {DOC_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Category cards summary */}
      <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
        {DOC_CATEGORIES.slice(0, 4).map(cat => {
          const count = docs.filter(d => d.category === cat).length
          return (
            <Card key={cat} className="hover:shadow-sm cursor-pointer transition-shadow" onClick={() => setFilterCat(cat)}>
              <CardContent className="flex items-center gap-3 p-4">
                <FolderOpen className="h-8 w-8 text-primary flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">{cat}</p>
                  <p className="font-bold text-lg">{count}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed rounded-lg">
          <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">Belum ada dokumen</h3>
          <p className="text-sm text-muted-foreground mb-4">Upload dokumen administrasi Anda di sini.</p>
          <Button variant="outline" onClick={() => setOpen(true)}>Upload Dokumen</Button>
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map(d => (
            <Card key={d.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="flex items-center gap-4 p-4">
                <div className={`flex-shrink-0 ${getColor(d.fileName)}`}>
                  <FileText className="h-10 w-10" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium truncate">{d.title}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[d.category]}`}>{d.category}</span>
                    <span className="text-xs text-muted-foreground">{d.fileName}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{format(d.uploadedAt, "d MMMM yyyy", { locale: idLocale })}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button variant="outline" size="sm"><Download className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
