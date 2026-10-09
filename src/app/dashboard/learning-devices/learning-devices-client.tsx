/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useTransition, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, Download, FileText, Search, Trash2, FolderOpen, Loader2, Pencil } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { format, parseISO } from "date-fns"
import { id as idLocale } from "date-fns/locale"
import { createLearningDevice, deleteLearningDevice, updateLearningDevice } from "./actions"
import { useToast } from "@/hooks/use-toast"

const DEVICE_CATEGORIES = ["Modul Ajar", "ATP", "CP", "TP", "KKTP", "Program Tahunan", "Program Semester", "Silabus", "RPP", "Perangkat Evaluasi"]
const FILE_ICON_COLORS: Record<string, string> = {
  ".pdf": "text-red-500", ".docx": "text-blue-500",
  ".xlsx": "text-green-500", ".pptx": "text-orange-500",
}
function getFileIconColor(name: string) { return FILE_ICON_COLORS[name?.substring(name.lastIndexOf('.'))] || "text-gray-500" }

export default function LearningDevicesClient({ initialDevices }: { initialDevices: any[] }) {
  const [devices, setDevices] = useState<any[]>(initialDevices)
  const [searchQuery, setSearchQuery] = useState("")
  const [open, setOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [editingDevice, setEditingDevice] = useState<any | null>(null)
  const [isPending, startTransition] = useTransition()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  function handleUpload(formData: FormData) {
    if (selectedFile) formData.set('file', selectedFile)
    startTransition(async () => {
      const result = await createLearningDevice(formData)
      if (result.error) {
        toast({ title: "Gagal", description: result.error, variant: "destructive" })
      } else {
        toast({ title: "Berhasil!", description: "Perangkat pembelajaran berhasil diunggah." })
        setOpen(false)
        setSelectedFile(null)
        window.location.reload()
      }
    })
  }

  function handleEdit(formData: FormData) {
    if (!editingDevice) return
    startTransition(async () => {
      const result = await updateLearningDevice(editingDevice.id, formData)
      if (result.error) {
        toast({ title: "Gagal", description: result.error, variant: "destructive" })
      } else {
        setEditingDevice(null)
        toast({ title: "Berhasil", description: "Perangkat pembelajaran diperbarui." })
        window.location.reload()
      }
    })
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const result = await deleteLearningDevice(id)
      if (result.error) {
        toast({ title: "Gagal", description: result.error, variant: "destructive" })
      } else {
        setDevices(prev => prev.filter(d => d.id !== id))
        toast({ title: "Dihapus", description: "Perangkat berhasil dihapus." })
      }
    })
  }

  const filtered = (cat?: string) => devices.filter(d =>
    (d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
     d.category.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (!cat || d.category === cat)
  )

  const DeviceList = ({ items }: { items: any[] }) => items.length === 0 ? (
    <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed rounded-lg">
      <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium">Belum ada dokumen</h3>
      <Button variant="outline" className="mt-4" onClick={() => setOpen(true)}>Upload Dokumen</Button>
    </div>
  ) : (
    <div className="grid gap-3">
      {items.map(d => (
        <Card key={d.id} className="transition-shadow hover:shadow-sm">
          <CardContent className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:gap-4 sm:p-4">
            <div className={`flex-shrink-0 ${getFileIconColor(d.file_name || '')}`}>
              <FileText className="h-10 w-10" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium truncate">{d.title}</h4>
              <div className="mt-1 flex flex-wrap items-center gap-1.5 sm:gap-2">
                <Badge variant="secondary" className="text-xs">{d.category}</Badge>
                {d.file_name && <span className="max-w-full truncate text-xs text-muted-foreground">{d.file_name}</span>}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{format(parseISO(d.created_at), "d MMM yyyy", { locale: idLocale })}</p>
            </div>
            <div className="grid w-full grid-cols-[1fr_auto_auto] gap-2 sm:ml-auto sm:flex sm:w-auto sm:shrink-0 sm:gap-2">
              {d.file_url && (
                <Button
                  variant="outline"
                  size="sm"
                  className="justify-center"
                  render={<a href={d.file_url} target="_blank" rel="noopener noreferrer" />}
                >
                  <Download className="mr-1 h-4 w-4" />
                  <span>Buka</span>
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={() => setEditingDevice(d)} title="Edit">
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => handleDelete(d.id)}
                title="Hapus"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Perangkat Pembelajaran</h1>
          <p className="text-muted-foreground">Kelola semua dokumen perangkat pembelajaran Anda.</p>
        </div>
        <Button onClick={() => setOpen(true)}><Upload className="mr-2 h-4 w-4" /> Upload Dokumen</Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Cari dokumen..." className="pl-10" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
      </div>

      <Tabs defaultValue="all">
        <div className="w-full overflow-x-auto pb-1">
          <TabsList className="h-auto min-w-max justify-start gap-1 rounded-xl bg-muted/70 p-1">
            <TabsTrigger
              value="all"
              className="h-9 flex-none rounded-lg px-3 data-active:bg-primary data-active:text-primary-foreground"
            >
              Semua ({devices.length})
            </TabsTrigger>
            {DEVICE_CATEGORIES.map(c => {
              const count = devices.filter(d => d.category === c).length
              return count > 0 ? (
                <TabsTrigger
                  key={c}
                  value={c}
                  className="h-9 flex-none rounded-lg px-3 data-active:bg-primary data-active:text-primary-foreground"
                >
                  {c} ({count})
                </TabsTrigger>
              ) : null
            })}
          </TabsList>
        </div>
        <TabsContent value="all" className="mt-4"><DeviceList items={filtered()} /></TabsContent>
        {DEVICE_CATEGORIES.map(c => (
          <TabsContent key={c} value={c} className="mt-4"><DeviceList items={filtered(c)} /></TabsContent>
        ))}
      </Tabs>

      <Dialog open={!!editingDevice} onOpenChange={(value) => !value && setEditingDevice(null)}>
        <DialogContent className="sm:max-w-[480px]">
          <form key={editingDevice?.id} action={handleEdit}>
            <DialogHeader><DialogTitle>Edit Perangkat Pembelajaran</DialogTitle><DialogDescription>Ubah judul atau kategori tanpa mengunggah ulang file.</DialogDescription></DialogHeader>
            {editingDevice && (
              <div className="grid gap-4 py-4">
                <div className="grid gap-2"><Label>Judul Dokumen</Label><Input name="title" defaultValue={editingDevice.title} required /></div>
                <div className="grid gap-2">
                  <Label>Kategori</Label>
                  <Select name="category" defaultValue={editingDevice.category} items={DEVICE_CATEGORIES.map(x => ({ value: x, label: x }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{DEVICE_CATEGORIES.map(x => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
            )}
            <DialogFooter><Button type="button" variant="outline" onClick={() => setEditingDevice(null)}>Batal</Button><Button type="submit" disabled={isPending}>Simpan</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Upload Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <form action={handleUpload}>
            <DialogHeader>
              <DialogTitle>Upload Perangkat Pembelajaran</DialogTitle>
              <DialogDescription>Unggah dokumen perangkat pembelajaran Anda.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Judul Dokumen</Label>
                <Input id="title" name="title" placeholder="Contoh: Modul Ajar Kelas 4 Semester 1" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Kategori</Label>
                <Select name="category" required>
                  <SelectTrigger id="category"><SelectValue placeholder="Pilih Kategori" /></SelectTrigger>
                  <SelectContent>{DEVICE_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>File</Label>
                <div
                  className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  {selectedFile ? (
                    <p className="text-sm font-medium text-primary">{selectedFile.name}</p>
                  ) : (
                    <>
                      <p className="text-sm text-muted-foreground">Klik untuk pilih file</p>
                      <p className="text-xs text-muted-foreground mt-1">PDF, DOCX, XLSX, PPTX (maks. 50MB)</p>
                    </>
                  )}
                  <input ref={fileInputRef} type="file" className="hidden" onChange={e => setSelectedFile(e.target.files?.[0] || null)} />
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
