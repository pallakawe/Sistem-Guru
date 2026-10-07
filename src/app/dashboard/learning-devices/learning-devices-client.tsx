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
import { Upload, Download, FileText, Search, Trash2, FolderOpen, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { format, parseISO } from "date-fns"
import { id as idLocale } from "date-fns/locale"
import { createLearningDevice, deleteLearningDevice } from "./actions"
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
        <Card key={d.id} className="hover:shadow-sm transition-shadow">
          <CardContent className="flex items-center gap-4 p-4">
            <div className={`flex-shrink-0 ${getFileIconColor(d.file_name || '')}`}>
              <FileText className="h-10 w-10" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium truncate">{d.title}</h4>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs">{d.category}</Badge>
                {d.file_name && <span className="text-xs text-muted-foreground">{d.file_name}</span>}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{format(parseISO(d.created_at), "d MMM yyyy", { locale: idLocale })}</p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              {d.file_url && (
                <Button variant="outline" size="sm" asChild>
                  <a href={d.file_url} target="_blank" rel="noopener noreferrer"><Download className="h-4 w-4" /></a>
                </Button>
              )}
              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDelete(d.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Perangkat Pembelajaran</h1>
          <p className="text-muted-foreground">Kelola semua dokumen perangkat pembelajaran Anda.</p>
        </div>
        <Button onClick={() => setOpen(true)}><Upload className="mr-2 h-4 w-4" /> Upload Dokumen</Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Cari dokumen..." className="pl-10" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
      </div>

      <Tabs defaultValue="all">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="all">Semua ({devices.length})</TabsTrigger>
          {DEVICE_CATEGORIES.map(c => {
            const count = devices.filter(d => d.category === c).length
            return count > 0 ? <TabsTrigger key={c} value={c}>{c} ({count})</TabsTrigger> : null
          })}
        </TabsList>
        <TabsContent value="all" className="mt-6"><DeviceList items={filtered()} /></TabsContent>
        {DEVICE_CATEGORIES.map(c => (
          <TabsContent key={c} value={c} className="mt-6"><DeviceList items={filtered(c)} /></TabsContent>
        ))}
      </Tabs>

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
                <Label>File (Opsional)</Label>
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
