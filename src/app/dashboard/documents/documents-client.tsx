/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useMemo, useRef, useState, useTransition } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Archive,
  BookOpen,
  CalendarCheck,
  Download,
  ExternalLink,
  FileText,
  FolderOpen,
  GraduationCap,
  Library,
  Loader2,
  Pencil,
  Search,
  Trash2,
  Upload,
} from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { format, parseISO } from "date-fns"
import { id as idLocale } from "date-fns/locale"
import { createDocument, deleteDocument, updateDocument } from "./actions"
import { useToast } from "@/hooks/use-toast"

const DOC_CATEGORIES = [
  "Daftar Hadir",
  "Perangkat Pembelajaran",
  "Jurnal Mengajar",
  "Penilaian",
  "Bahan Ajar",
  "Administrasi Guru",
  "Surat",
  "Laporan",
  "Dokumen Lainnya",
]

const PRIMARY_FOLDERS = [
  { category: "Daftar Hadir", icon: CalendarCheck },
  { category: "Perangkat Pembelajaran", icon: FolderOpen },
  { category: "Jurnal Mengajar", icon: BookOpen },
  { category: "Penilaian", icon: GraduationCap },
  { category: "Bahan Ajar", icon: Library },
  { category: "Dokumen Lainnya", icon: Archive },
]

const FILE_COLORS: Record<string, string> = {
  ".pdf": "text-red-500",
  ".doc": "text-blue-500",
  ".docx": "text-blue-500",
  ".xls": "text-green-500",
  ".xlsx": "text-green-500",
  ".ppt": "text-orange-500",
  ".pptx": "text-orange-500",
}

function getExt(name: string) {
  return name ? name.substring(name.lastIndexOf(".")).toLowerCase() : ""
}

function getColor(name: string) {
  return FILE_COLORS[getExt(name)] || "text-muted-foreground"
}

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

  const filtered = useMemo(() => docs.filter((doc) => {
    const searchValue = search.toLowerCase()
    return (
      (filterCat === "all" || doc.category === filterCat) &&
      (
        doc.title?.toLowerCase().includes(searchValue) ||
        doc.category?.toLowerCase().includes(searchValue) ||
        doc.description?.toLowerCase().includes(searchValue) ||
        doc.source?.toLowerCase().includes(searchValue)
      )
    )
  }), [docs, filterCat, search])

  function handleUpload(formData: FormData) {
    if (selectedFile) formData.set("file", selectedFile)

    startTransition(async () => {
      const result = await createDocument(formData)
      if (result.error) {
        toast({ title: "Gagal", description: result.error, variant: "destructive" })
        return
      }

      toast({ title: "Berhasil!", description: "Dokumen tambahan berhasil diunggah." })
      setOpen(false)
      setSelectedFile(null)
      window.location.reload()
    })
  }

  function handleEdit(formData: FormData) {
    if (!editingDoc) return

    startTransition(async () => {
      const result = await updateDocument(editingDoc.id, formData)
      if (result.error) {
        toast({ title: "Gagal", description: result.error, variant: "destructive" })
        return
      }

      setEditingDoc(null)
      toast({ title: "Berhasil", description: "Dokumen diperbarui." })
      window.location.reload()
    })
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const result = await deleteDocument(id)
      if (result.error) {
        toast({ title: "Gagal", description: result.error, variant: "destructive" })
        return
      }

      setDocs((current) => current.filter((item) => item.id !== id))
      toast({ title: "Dihapus", description: "Dokumen berhasil dihapus." })
    })
  }

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Dokumen Administrasi</h1>
          <p className="text-muted-foreground">
            Pusat arsip otomatis untuk absensi, perangkat pembelajaran, jurnal, penilaian, bahan ajar, dan dokumen tambahan.
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Upload className="mr-2 h-4 w-4" /> Upload Dokumen Lain
        </Button>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex gap-3 p-4 text-sm">
          <Archive className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <p>
            Arsip dari menu lain tampil otomatis di sini dan tetap dikelola dari menu asalnya. Tidak perlu upload file yang sama dua kali.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        {PRIMARY_FOLDERS.map(({ category, icon: Icon }) => {
          const count = docs.filter((doc) => doc.category === category).length
          return (
            <button
              key={category}
              type="button"
              onClick={() => setFilterCat(filterCat === category ? "all" : category)}
              className={[
                "rounded-2xl border bg-card p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md",
                filterCat === category ? "border-primary ring-2 ring-primary/10" : "",
              ].join(" ")}
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <p className="text-sm font-semibold leading-tight">{category}</p>
              <p className="mt-1 text-xs text-muted-foreground">{count} arsip</p>
            </button>
          )
        })}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari arsip..."
            className="pl-10"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <Select
          value={filterCat}
          onValueChange={(value) => setFilterCat(value ?? "all")}
          items={[{ value: "all", label: "Semua Kategori" }, ...DOC_CATEGORIES.map((category) => ({ value: category, label: category }))]}
        >
          <SelectTrigger className="w-full sm:w-60">
            <SelectValue placeholder="Semua Kategori" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Kategori</SelectItem>
            {DOC_CATEGORIES.map((category) => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed py-16">
          <FolderOpen className="mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="text-lg font-medium">Belum ada arsip</h3>
          <p className="mt-1 text-center text-sm text-muted-foreground">
            Data dari menu administrasi akan otomatis muncul di sini.
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((doc) => (
            <Card key={doc.id} className="transition-shadow hover:shadow-sm">
              <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted ${getColor(doc.file_name || "")}`}>
                  <FileText className="h-6 w-6" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-medium">{doc.title}</h4>
                    <Badge variant={doc.readonly ? "secondary" : "outline"}>
                      {doc.source || "Manual"}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {doc.description || doc.file_name || doc.category}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {doc.created_at
                      ? format(parseISO(String(doc.created_at).slice(0, 10)), "d MMMM yyyy", { locale: idLocale })
                      : "—"}
                    {" · "}{doc.category}
                  </p>
                </div>

                <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:justify-end">
                  {doc.file_url && (
                    <Button
                      variant="outline"
                      size="sm"
                      render={<a href={doc.file_url} target="_blank" rel="noopener noreferrer" />}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      File
                    </Button>
                  )}

                  {doc.source_url && (
                    <Button
                      variant="outline"
                      size="sm"
                      render={<Link href={doc.source_url} />}
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Buka Sumber
                    </Button>
                  )}

                  {!doc.readonly && (
                    <>
                      <Button variant="ghost" size="icon-sm" onClick={() => setEditingDoc(doc)} title="Edit">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(doc.id)}
                        title="Hapus"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!editingDoc} onOpenChange={(value) => !value && setEditingDoc(null)}>
        <DialogContent className="sm:max-w-[480px]">
          <form key={editingDoc?.id} action={handleEdit}>
            <DialogHeader>
              <DialogTitle>Edit Dokumen Tambahan</DialogTitle>
              <DialogDescription>Ubah judul atau kategori dokumen yang diunggah langsung.</DialogDescription>
            </DialogHeader>
            {editingDoc && (
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Judul Dokumen</Label>
                  <Input name="title" defaultValue={editingDoc.title} required />
                </div>
                <div className="grid gap-2">
                  <Label>Kategori</Label>
                  <Select name="category" defaultValue={editingDoc.category} items={DOC_CATEGORIES.map((category) => ({ value: category, label: category }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {DOC_CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditingDoc(null)}>Batal</Button>
              <Button type="submit" disabled={isPending}>Simpan</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <form action={handleUpload}>
            <DialogHeader>
              <DialogTitle>Upload Dokumen Lain</DialogTitle>
              <DialogDescription>
                Gunakan ini hanya untuk dokumen yang belum tersedia otomatis dari menu administrasi lain.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Judul Dokumen</Label>
                <Input id="title" name="title" placeholder="Contoh: SK Pembagian Tugas" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Kategori</Label>
                <Select name="category" defaultValue="Dokumen Lainnya" required>
                  <SelectTrigger id="category"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DOC_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>File</Label>
                <div
                  className="cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors hover:bg-muted/50"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                  {selectedFile ? (
                    <p className="text-sm font-medium text-primary">{selectedFile.name}</p>
                  ) : (
                    <>
                      <p className="text-sm text-muted-foreground">Klik untuk pilih file</p>
                      <p className="mt-1 text-xs text-muted-foreground">PDF, DOCX, XLSX, PPTX (maks. 50MB)</p>
                    </>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={(event) => setSelectedFile(event.target.files?.[0] || null)}
                    accept=".pdf,.docx,.xlsx,.pptx,.doc,.xls,.ppt"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Batal</Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Upload
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
