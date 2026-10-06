'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, School, BookOpen, Save, Camera } from "lucide-react"

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pengaturan</h1>
        <p className="text-muted-foreground">Kelola profil dan preferensi akun Anda.</p>
      </div>

      {/* Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><User className="h-5 w-5" /> Profil Guru</CardTitle>
          <CardDescription>Informasi dasar akun Anda.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarImage src="" alt="Foto Profil" />
                <AvatarFallback className="text-xl bg-primary/10 text-primary font-bold">BS</AvatarFallback>
              </Avatar>
              <Button size="icon" variant="secondary" className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full">
                <Camera className="h-3.5 w-3.5" />
              </Button>
            </div>
            <div>
              <h3 className="font-semibold">Budi Santoso, S.Pd</h3>
              <p className="text-sm text-muted-foreground">budi@smkcontoh.sch.id</p>
            </div>
          </div>

          <Separator />

          <div className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="fullName">Nama Lengkap</Label>
                <Input id="fullName" defaultValue="Budi Santoso, S.Pd" />
              </div>

            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="nip">NIP</Label>
                <Input id="nip" placeholder="19800101 200501 1 001" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="nuptk">NUPTK</Label>
                <Input id="nuptk" placeholder="1234567890123456" />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Nomor HP</Label>
              <Input id="phone" type="tel" placeholder="08123456789" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="subject">Mata Pelajaran Utama</Label>
              <Input id="subject" defaultValue="Informatika" placeholder="Contoh: Matematika, Fisika" />
            </div>
          </div>

          <Button className="w-full sm:w-auto"><Save className="mr-2 h-4 w-4" /> Simpan Profil</Button>
        </CardContent>
      </Card>

      {/* School Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><School className="h-5 w-5" /> Data Sekolah</CardTitle>
          <CardDescription>Informasi sekolah tempat Anda mengajar.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label>Nama Sekolah</Label>
            <Input defaultValue="SMK Contoh Negeri 1" />
          </div>
          <div className="grid gap-2">
            <Label>Alamat Sekolah</Label>
            <Input placeholder="Jl. Contoh No. 1, Kota" />
          </div>
          <Button className="w-full sm:w-auto"><Save className="mr-2 h-4 w-4" /> Simpan</Button>
        </CardContent>
      </Card>

      {/* Academic Year Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5" /> Tahun Ajaran</CardTitle>
          <CardDescription>Atur tahun ajaran yang sedang aktif.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
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
              <Label>Semester</Label>
              <Select defaultValue="Ganjil">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ganjil">Ganjil</SelectItem>
                  <SelectItem value="Genap">Genap</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button className="w-full sm:w-auto"><Save className="mr-2 h-4 w-4" /> Simpan</Button>
        </CardContent>
      </Card>
    </div>
  )
}
