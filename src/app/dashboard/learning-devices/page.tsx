'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Upload, Download, FileText, Search, Trash2, FolderOpen } from "lucide-react"
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

const DEVICE_CATEGORIES = ["Modul Ajar", "ATP", "CP", "TP", "KKTP", "Program Tahunan", "Program Semester", "Silabus", "RPP", "Perangkat Evaluasi"]

const DUMMY_DEVICES = [
  { id: 1, title: "Modul Ajar Informatika X - Semester 1", category: "Modul Ajar", fileName: "ModulAjar_Informatika_X_S1.pdf", uploadedAt: new Date("2026-08-01"), academicYear: "2026/2027" },
  { id: 2, title: "ATP Informatika Fase E", category: "ATP", fileName: "ATP_Informatika_FaseE.docx", uploadedAt: new Date("2026-07-15"), academicYear: "2026/2027" },
  { id: 3, title: "Capaian Pembelajaran Informatika Fase E", category: "CP", fileName: "CP_Informatika_FaseE.pdf", uploadedAt: new Date("2026-07-10"), academicYear: "2026/2027" },
  { id: 4, title: "Program Semester Gasal 2026/2027", category: "Program Semester", fileName: "ProSem_Gasal_2026.xlsx", uploadedAt: new Date("2026-07-20"), academicYear: "2026/2027" },
  { id: 5, title: "KKTP Informatika Kelas X", category: "KKTP", fileName: "KKTP_Informatika_X.pdf", uploadedAt: new Date("2026-08-05"), academicYear: "2026/2027" },
]

const FILE_ICON_COLORS: Record<string, string> = {
  ".pdf": "text-red-500",
  ".docx": "text-blue-500",
  ".xlsx": "text-green-500",
  ".pptx": "text-orange-500",
}

function getFileExt(name: string) {
  return name.substring(name.lastIndexOf('.'))
}

function getFileIconColor(name: string) {
  return FILE_ICON_COLORS[getFileExt(name)] || "text-gray-500"
}

export default function LearningDevicesPage() {
  const [devices] = useState(DUMMY_DEVICES)
  const [searchQuery, setSearchQuery] = useState("")
  const [open, setOpen] = useState(false)

  const filtered = devices.filter(d =>
    d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Perangkat Pembelajaran</h1>
          <p className="text-muted-foreground">Kelola semua dokumen perangkat pembelajaran Anda.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button><Upload className="mr-2 h-4 w-4" /> Upload Dokumen</Button>} />
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle>Upload Perangkat Pembelajaran</DialogTitle>
              <DialogDescription>Unggah dokumen perangkat pembelajaran Anda.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Judul Dokumen</Label>
                <Input placeholder="Contoh: Modul Ajar Informatika X" />
              </div>
              <div className="grid gap-2">
                <Label>Kategori</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Pilih Kategori" /></SelectTrigger>
                  <SelectContent>
                    {DEVICE_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Tahun Ajaran</Label>
                <Select defaultValue="2026/2027">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2026/2027">2026/2027</SelectItem>
                    <SelectItem value="2025/2026">2025/2026</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>File</Label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Klik atau drag & drop file di sini</p>
                  <p className="text-xs text-muted-foreground mt-1">PDF, DOCX, XLSX, PPTX (maks. 50MB)</p>
                  <Input type="file" className="hidden" />
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

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Cari dokumen..."
          className="pl-10"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">Semua</TabsTrigger>
          {DEVICE_CATEGORIES.map(c => (
            <TabsTrigger key={c} value={c} className="hidden md:flex">{c}</TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="all" className="mt-6">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed rounded-lg">
              <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">Belum ada perangkat pembelajaran</h3>
              <p className="text-sm text-muted-foreground mb-4">Upload dokumen pertama Anda.</p>
              <Button variant="outline" onClick={() => setOpen(true)}>Upload Dokumen</Button>
            </div>
          ) : (
            <div className="grid gap-3">
              {filtered.map(d => (
                <Card key={d.id} className="hover:shadow-sm transition-shadow">
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className={`flex-shrink-0 ${getFileIconColor(d.fileName)}`}>
                      <FileText className="h-10 w-10" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{d.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">{d.category}</Badge>
                        <span className="text-xs text-muted-foreground">{d.fileName}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Diupload {format(d.uploadedAt, "d MMM yyyy", { locale: idLocale })} · {d.academicYear}
                      </p>
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
        </TabsContent>
      </Tabs>
    </div>
  )
}
