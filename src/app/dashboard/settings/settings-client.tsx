/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { User, School, BookOpen, Save, Loader2 } from "lucide-react"
import { saveProfile, saveSchool, saveAcademicYear } from "./actions"
import { useToast } from "@/hooks/use-toast"

const ACADEMIC_YEARS = ["2024/2025", "2025/2026", "2026/2027", "2027/2028"]
const SEMESTERS = ["Ganjil", "Genap"]

export default function SettingsClient({ profile, school, academicYears, userEmail }: {
  profile: any, school: any, academicYears: any[], userEmail: string
}) {
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  const initials = (profile.full_name || userEmail || "?").split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase()
  const activeYear = academicYears.find((y: any) => y.is_active)

  function handleSaveProfile(formData: FormData) {
    startTransition(async () => {
      const result = await saveProfile(formData)
      if (result.error) toast({ title: "Gagal", description: result.error, variant: "destructive" })
      else toast({ title: "Berhasil!", description: "Profil berhasil disimpan." })
    })
  }

  function handleSaveSchool(formData: FormData) {
    if (school?.id) formData.set('schoolId', school.id)
    startTransition(async () => {
      const result = await saveSchool(formData)
      if (result.error) toast({ title: "Gagal", description: result.error, variant: "destructive" })
      else toast({ title: "Berhasil!", description: "Data sekolah berhasil disimpan." })
    })
  }

  function handleSaveAcademicYear(formData: FormData) {
    startTransition(async () => {
      const result = await saveAcademicYear(formData)
      if (result.error) toast({ title: "Gagal", description: result.error, variant: "destructive" })
      else toast({ title: "Berhasil!", description: "Tahun ajaran aktif telah diperbarui." })
    })
  }

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
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="text-xl bg-primary/10 text-primary font-bold">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{profile.full_name || "—"}</h3>
              <p className="text-sm text-muted-foreground">{userEmail}</p>
            </div>
          </div>

          <Separator />

          <form action={handleSaveProfile}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="fullName">Nama Lengkap</Label>
                <Input id="fullName" name="fullName" defaultValue={profile.full_name || ""} placeholder="Nama lengkap Anda" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="nip">NIP</Label>
                  <Input id="nip" name="nip" defaultValue={profile.nip || ""} placeholder="19800101 200501 1 001" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="nuptk">NUPTK</Label>
                  <Input id="nuptk" name="nuptk" defaultValue={profile.nuptk || ""} placeholder="1234567890123456" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Nomor HP</Label>
                <Input id="phone" name="phone" type="tel" defaultValue={profile.phone || ""} placeholder="08123456789" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="subjectSpecialty">Mata Pelajaran Utama</Label>
                <Input id="subjectSpecialty" name="subjectSpecialty" defaultValue={profile.subject_specialty || ""} placeholder="Contoh: Matematika, IPA" />
              </div>
            </div>
            <Button className="w-full sm:w-auto mt-4" type="submit" disabled={isPending}>
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Simpan Profil
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* School Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><School className="h-5 w-5" /> Data Sekolah</CardTitle>
          <CardDescription>Informasi sekolah tempat Anda mengajar.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form action={handleSaveSchool}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="schoolName">Nama Sekolah</Label>
                <Input id="schoolName" name="schoolName" defaultValue={school?.name || ""} placeholder="SD Negeri 01 Contoh" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="schoolAddress">Alamat Sekolah</Label>
                <Input id="schoolAddress" name="schoolAddress" defaultValue={school?.address || ""} placeholder="Jl. Pendidikan No. 1, Kota" />
              </div>
            </div>
            <Button className="w-full sm:w-auto mt-4" type="submit" disabled={isPending}>
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Simpan
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Academic Year Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5" /> Tahun Ajaran</CardTitle>
          <CardDescription>
            Atur tahun ajaran yang sedang aktif.
            {activeYear && <span className="ml-2 text-primary font-medium">Aktif: {activeYear.name} {activeYear.semester}</span>}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {academicYears.length > 0 && (
            <form action={handleSaveAcademicYear}>
              <div className="grid gap-2">
                <Label>Pilih Tahun Ajaran yang Aktif</Label>
                <Select name="academicYearId" defaultValue={activeYear?.id || ""}>
                  <SelectTrigger><SelectValue placeholder="Pilih Tahun Ajaran" /></SelectTrigger>
                  <SelectContent>
                    {academicYears.map((y: any) => (
                      <SelectItem key={y.id} value={y.id}>{y.name} - {y.semester}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full sm:w-auto mt-4" type="submit" disabled={isPending}>
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Aktifkan
              </Button>
            </form>
          )}

          <Separator />
          <p className="text-sm font-medium">Buat Tahun Ajaran Baru</p>
          <form action={handleSaveAcademicYear}>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Tahun Ajaran</Label>
                <Select name="yearName" defaultValue="2026/2027">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{ACADEMIC_YEARS.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Semester</Label>
                <Select name="semester" defaultValue="Ganjil">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{SEMESTERS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <Button className="w-full sm:w-auto mt-4" type="submit" variant="outline" disabled={isPending}>
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Simpan & Aktifkan
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
