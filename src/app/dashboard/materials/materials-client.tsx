/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useMemo, useRef, useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Download, FileText, Link as LinkIcon, Loader2, Plus, Search, Trash2, Upload } from "lucide-react"
import { createMaterial, deleteMaterial } from "./actions"
import { useToast } from "@/hooks/use-toast"
import { format, parseISO } from "date-fns"
import { id as idLocale } from "date-fns/locale"

const FILE_TYPES = ["PDF", "PPTX", "DOCX", "XLSX", "Link", "Video"]

export default function MaterialsClient({
  initialMaterials,
  classes,
  subjects,
  meetings,
}: {
  initialMaterials: any[]
  classes: any[]
  subjects: any[]
  meetings: any[]
}) {
  const [materials, setMaterials] = useState<any[]>(initialMaterials)
  const [search, setSearch] = useState("")
  const [open, setOpen] = useState(false)
  const [fileType, setFileType] = useState("PDF")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isPending, startTransition] = useTransition()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return materials.filter((m) =>
      m.title?.toLowerCase().includes(q) ||
      m.topic?.toLowerCase().includes(q) ||
      m.subjects?.name?.toLowerCase().includes(q) ||
      m.classes?.name?.toLowerCase().includes(q)
    )
  }, [materials, search])

  function handleCreate(formData: FormData) {
    if (selectedFile) formData.set('file', selectedFile)

    startTransition(async () => {
      const result = await createMaterial(formData)
      if (result.error) {
        toast({ title: "Gagal", description: result.error, variant: "destructive" })
        return
      }

      toast({ title: "Berhasil!", description: "Bahan ajar berhasil ditambahkan." })
      setOpen(false)
      setSelectedFile(null)
      window.location.reload()
    })
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const result = await deleteMaterial(id)
      if (result.error) {
        toast({ title: "Gagal", description: result.error, variant: "destructive" })
        return
      }

      setMaterials((prev) => prev.filter((item) => item.id !== id))
      toast({ title: "Dihapus", description: "Bahan ajar berhasil dihapus." })
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bahan Ajar</h1>
          <p className="text-muted-foreground">Kelola file, link, dan materi pembelajaran dari Supabase.</p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Tambah Bahan Ajar
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari judul, mata pelajaran, kelas, atau topik..."
          className="pl-10"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed py-16">
          <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="text-lg font-medium">Belum ada bahan ajar</h3>
          <p className="mb-4 text-sm text-muted-foreground">Tambahkan materi pertama Anda.</p>
          <Button variant="outline" onClick={() => setOpen(true)}>Tambah Bahan Ajar</Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((m) => (
            <Card key={m.id} className="flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  {m.file_type === "Link" || m.file_type === "Video"
                    ? <LinkIcon className="h-7 w-7 shrink-0 text-primary" />
                    : <FileText className="h-7 w-7 shrink-0 text-primary" />}
                  <div className="min-w-0">
                    <CardTitle className="text-base leading-snug">{m.title}</CardTitle>
                    <Badge variant="secondary" className="mt-2">{m.file_type || "Materi"}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-3">
                {m.description && <p className="text-sm text-muted-foreground">{m.description}</p>}
                <div className="flex flex-wrap gap-1">
                  {m.subjects?.name && <Badge variant="outline">{m.subjects.name}</Badge>}
                  {m.classes?.name && <Badge variant="outline">{m.classes.name}</Badge>}
                  {m.meetings?.meeting_number && <Badge variant="outline">Pertemuan {m.meetings.meeting_number}</Badge>}
                </div>
                {m.topic && <p className="text-xs text-muted-foreground">Topik: {m.topic}</p>}
                <p className="text-xs text-muted-foreground">
                  {format(parseISO(m.created_at), "d MMM yyyy", { locale: idLocale })}
                </p>
                <div className="mt-auto flex gap-2 pt-2">
                  {m.file_url && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      render={<a href={m.file_url} target="_blank" rel="noopener noreferrer" />}
                    >
                      <Download className="mr-1 h-4 w-4" />
                      Buka
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDelete(m.id)}
                    disabled={isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[560px]">
          <form action={handleCreate}>
            <DialogHeader>
              <DialogTitle>Tambah Bahan Ajar</DialogTitle>
              <DialogDescription>Simpan file atau tautan materi ke akun guru Anda.</DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="material-title">Judul</Label>
                <Input id="material-title" name="title" required placeholder="Contoh: Pecahan Senilai" />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="material-description">Deskripsi</Label>
                <Textarea id="material-description" name="description" placeholder="Deskripsi singkat materi..." />
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label>Mata Pelajaran</Label>
                  <Select name="subject_id" required items={subjects.map(subject => ({ value: subject.id, label: subject.name }))}>
                    <SelectTrigger><SelectValue placeholder="Pilih mapel" /></SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>{subject.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label>Kelas</Label>
                  <Select name="class_id" items={classes.map(item => ({ value: item.id, label: item.name }))}>
                    <SelectTrigger><SelectValue placeholder="Opsional" /></SelectTrigger>
                    <SelectContent>
                      {classes.map((item) => (
                        <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="material-topic">Topik</Label>
                <Input id="material-topic" name="topic" placeholder="Contoh: Pecahan dan Desimal" />
              </div>

              <div className="grid gap-2">
                <Label>Pertemuan</Label>
                <Select
                  name="meeting_id"
                  items={meetings.map(meeting => ({
                    value: meeting.id,
                    label: `${meeting.classes?.name} · ${meeting.subjects?.name} · Pertemuan ${meeting.meeting_number}`
                  }))}
                >
                  <SelectTrigger><SelectValue placeholder="Opsional" /></SelectTrigger>
                  <SelectContent>
                    {meetings.map((meeting) => (
                      <SelectItem key={meeting.id} value={meeting.id}>
                        {meeting.classes?.name} · {meeting.subjects?.name} · Pertemuan {meeting.meeting_number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Tipe Materi</Label>
                <Select
                  name="file_type"
                  value={fileType}
                  onValueChange={(value) => setFileType(value ?? "PDF")}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {FILE_TYPES.map((type) => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {fileType === "Link" || fileType === "Video" ? (
                <div className="grid gap-2">
                  <Label htmlFor="material-url">URL</Label>
                  <Input id="material-url" name="url" type="url" placeholder="https://..." required />
                </div>
              ) : (
                <div className="grid gap-2">
                  <Label>File</Label>
                  <div
                    className="cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors hover:bg-muted/50"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                    <p className="text-sm font-medium">
                      {selectedFile ? selectedFile.name : "Klik untuk memilih file"}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">PDF, PPTX, DOCX, XLSX</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      accept=".pdf,.ppt,.pptx,.doc,.docx,.xls,.xlsx"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    />
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Batal</Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
