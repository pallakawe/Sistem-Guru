'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, BookOpen, CheckSquare, FileText, GraduationCap, PenTool } from "lucide-react"
import Link from "next/link"
import AttendancePage from "../../attendance/page"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function MeetingPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/schedules">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pertemuan 5 - X RPL 1</h1>
          <p className="text-muted-foreground">
            Informatika | 6 Oktober 2026 | 08:00 - 09:30
          </p>
        </div>
      </div>

      <Tabs defaultValue="attendance" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-auto rounded-xl p-1 bg-muted/50 border">
          <TabsTrigger value="attendance" className="py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg">
            <CheckSquare className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Absensi</span>
          </TabsTrigger>
          <TabsTrigger value="journal" className="py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg">
            <PenTool className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Jurnal</span>
          </TabsTrigger>
          <TabsTrigger value="materials" className="py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg">
            <BookOpen className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Materi</span>
          </TabsTrigger>
          <TabsTrigger value="assessment" className="py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg">
            <GraduationCap className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Penilaian</span>
          </TabsTrigger>
          <TabsTrigger value="notes" className="py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg">
            <FileText className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Catatan</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="attendance" className="mt-6">
          {/* We reuse the attendance logic, but simplified here for demo */}
          <Card>
            <CardHeader>
              <CardTitle>Absensi Pertemuan</CardTitle>
              <CardDescription>Catat kehadiran siswa khusus untuk pertemuan ini.</CardDescription>
            </CardHeader>
            <CardContent>
              <AttendancePage />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="journal" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Jurnal Mengajar</CardTitle>
              <CardDescription>Catat kegiatan pembelajaran yang telah dilaksanakan.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Materi Pokok</Label>
                <Input placeholder="Contoh: Algoritma Dasar" defaultValue="Algoritma Dasar" />
              </div>
              <div className="space-y-2">
                <Label>Tujuan Pembelajaran</Label>
                <Textarea placeholder="Siswa dapat memahami..." className="min-h-[100px]" />
              </div>
              <div className="space-y-2">
                <Label>Kegiatan Pembelajaran</Label>
                <Textarea placeholder="1. Pendahuluan... 2. Inti..." className="min-h-[150px]" />
              </div>
              <Button>Simpan Jurnal</Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="materials" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Bahan Ajar</CardTitle>
              <CardDescription>Materi yang digunakan pada pertemuan ini.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-lg bg-muted/20">
                <BookOpen className="h-10 w-10 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Belum ada bahan ajar</h3>
                <p className="text-sm text-muted-foreground mb-4">Tambahkan file PDF, PPT, atau link materi.</p>
                <Button variant="outline">Upload Materi</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assessment" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Penilaian Harian</CardTitle>
              <CardDescription>Input nilai tugas atau kuis pada pertemuan ini.</CardDescription>
            </CardHeader>
            <CardContent>
               <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-lg bg-muted/20">
                <GraduationCap className="h-10 w-10 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Belum ada komponen penilaian</h3>
                <p className="text-sm text-muted-foreground mb-4">Buat tugas atau kuis baru untuk pertemuan ini.</p>
                <Button variant="outline">Buat Penilaian</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Catatan Khusus</CardTitle>
              <CardDescription>Catatan kendala atau tindak lanjut.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Kendala / Masalah</Label>
                <Textarea placeholder="Kendala yang terjadi di kelas..." />
              </div>
              <div className="space-y-2">
                <Label>Tindak Lanjut</Label>
                <Textarea placeholder="Rencana tindak lanjut..." />
              </div>
              <Button>Simpan Catatan</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
