/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useTransition, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Upload, Download, FileText, Search, Trash2, FolderOpen, Loader2, Pencil } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { format, parseISO } from "date-fns"
import { id as idLocale } from "date-fns/locale"
import { createDocument, deleteDocument, updateDocument } from "./actions"
import { useToast } from "@/hooks/use-toast"

const DOC_CATEGORIES = ["Administrasi Guru", "Perangkat Pembelajaran", "Bahan Ajar", "Penilaian", "Surat", "Laporan", "Dokumen Lainnya"]

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
  ".pdf": "text-red-500", ".docx": "text-blue-500",
  ".xlsx": "text-green-500", ".pptx": "text-orange-500",
}

function getExt(name: string) { return name ? name.substring(name.lastIndexOf('.')) : '' }
function getColor(name: string) { return FILE_COLORS[getExt(name)] || "text-gray-500" }

export default function DocumentsClient({ initialDocs }: { initialDocs: any[] }) {
  const [docs, setDocs] = useState<any[]>(initialDocs)
  const [search, setSearch] = useState("")
  const [filterCat, setFilterCat] = useState("all")
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [editingDoc, setEditingDoc] = useState<any | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const filtered = docs.filter(d =>
    (filterCat === "all" || d.category === filterCat) &&
    (d.title.toLowerCase().includes(search.toLowerCase()) || d.category.toLowerCase().includes(search.toLowerCase()))
  )

  function handleUpload(formData: FormData) {
    if (selectedFile) formData.set('file', selectedFile)
    startTransition(async () => {
      const result = await createDocument(formData)
      if (result.error) {
        toast({ title: "Gagal", description: result.error, variant: "destructive" })
      } else {
        toast({ title: "Berhasil!", description: "Dokumen berhasil diunggah." })
        setOpen(false)
        setSelectedFile(null)
        window.location.reload()
      }
    })
  }

  function handleEdit(formData: FormData) {
    if (!editingDoc) return
    startTransition(async () => {
      const result = await updateDocument(editingDoc.id, formData)
      if (result.error) {
        toast({ title: "Gagal", description: result.error, variant: "destructive" })
      } else {
        setEditingDoc(null)
        toast({ title: "Berhasil", description: "Dokumen diperbarui." })
        window.location.reload()
      }
    })
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const result = await deleteDocument(id)
      if (result.error) {
        toast({ title: "Gagal", description: result.error, variant: "destructive" })
      } else {
        setDocs(prev => prev.filter(d => d.id !== id))
        toast({ title: "Dihapus", description: "Dokumen berhasil dihapus." })
      }
    })
  }

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Dokumen</h1>
          <p className="text-muted-foreground">Pusat penyimpanan dokumen administrasi Anda.</p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Upload className="mr-2 h-4 w-4" /> Upload Dokumen
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Cari dokumen..." className="pl-10" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={filterCat} onValueChange={v => setFilterCat(v ?? "all")}>
          <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="Semua Kategori" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Kategori</SelectItem>
            {DOC_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 md:grid-cols-4">
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
              <CardContent className="flex flex-wrap items-start gap-3 p-3 sm:flex-nowrap sm:items-center sm:gap-4 sm:p-4">
                <div className={`flex-shrink-0 ${getColor(d.file_name || '')}`}>
                  <FileText className="h-10 w-10" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium truncate">{d.title}</h4>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5 sm:gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[d.category] || ''}`}>{d.category}</span>
                    {d.file_name && <span className="text-xs text-muted-foreground">{d.file_name}</span>}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{format(parseISO(d.created_at), "d MMMM yyyy", { locale: idLocale })}</p>
                </div>
                <div className="ml-auto flex shrink-0 gap-1 sm:gap-2">
                  {d.file_url && (
                    <Button
                      variant="outline"
                      size="sm"
                      render={<a href={d.file_url} target="_blank" rel="noopener noreferrer" />}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => setEditingDoc(d)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDelete(d.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!editingDoc} onOpenChange={(value) => !value && setEditingDoc(null)}>
        <DialogContent className="sm:max-w-[480px]">
          <form key={editingDoc?.id} action={handleEdit}>
            <DialogHeader><DialogTitle>Edit Dokumen</DialogTitle><DialogDescription>Ubah judul atau kategori tanpa mengunggah ulang file.</DialogDescription></DialogHeader>
            {editingDoc && (
              <div className="grid gap-4 py-4">
                <div className="grid gap-2"><Label>Judul Dokumen</Label><Input name="title" defaultValue={editingDoc.title} required /></div>
                <div className="grid gap-2">
                  <Label>Kategori</Label>
                  <Select name="category" defaultValue={editingDoc.category} items={DOC_CATEGORIES.map(x => ({ value: x, label: x }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{DOC_CATEGORIES.map(x => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
            )}
            <DialogFooter><Button type="button" variant="outline" onClick={() => setEditingDoc(null)}>Batal</Button><Button type="submit" disabled={isPending}>Simpan</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Upload Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <form action={handleUpload}>
            <DialogHeader>
              <DialogTitle>Upload Dokumen</DialogTitle>
              <DialogDescription>Simpan dokumen administrasi Anda di sini.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Judul Dokumen</Label>
                <Input id="title" name="title" placeholder="Contoh: SK Pembagian Tugas" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Kategori</Label>
                <Select name="category" required>
                  <SelectTrigger id="category"><SelectValue placeholder="Pilih Kategori" /></SelectTrigger>
                  <SelectContent>{DOC_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>File</Label>
                <div
                  className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  {selectedFile ? (
                    <p className="text-sm font-medium text-primary">{selectedFile.name}</p>
                  ) : (
                    <>
                      <p className="text-sm text-muted-foreground">Klik untuk pilih file</p>
                      <p className="text-xs text-muted-foreground mt-1">PDF, DOCX, XLSX (maks. 50MB)</p>
                    </>
                  )}
                  <input ref={fileInputRef} type="file" className="hidden" onChange={e => setSelectedFile(e.target.files?.[0] || null)} accept=".pdf,.docx,.xlsx,.pptx,.doc,.xls" />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Batal</Button>
              <Button type="submit" disabled={isPending}>{isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Upload</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
