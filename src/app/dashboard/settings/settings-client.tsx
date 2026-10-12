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
import { User, School, BookOpen, Save, Loader2, Plus, Trash2 } from "lucide-react"
import { saveProfile, saveSchool, saveAcademicYear, addSubject, deleteSubject } from "./actions"
import { useToast } from "@/hooks/use-toast"

const ACADEMIC_YEARS = ["2024/2025", "2025/2026", "2026/2027", "2027/2028"]
const SEMESTERS = ["Ganjil", "Genap"]

export default function SettingsClient({ profile, school, academicYears, subjects: initialSubjects, userEmail }: {
  profile: any, school: any, academicYears: any[], subjects: any[], userEmail: string
}) {
  const [isPending, startTransition] = useTransition()
  const [subjects, setSubjects] = useState<any[]>(initialSubjects || [])
  const { toast } = useToast()

  const initials = (profile.full_name || userEmail || "?").split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase()
  const activeYear = academicYears.find((y: any) => y.is_active)
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState(activeYear?.id || "")
  const selectedAcademicYear = academicYears.find((y: any) => y.id === selectedAcademicYearId)

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

  function handleAddSubject(formData: FormData) {
    startTransition(async () => {
      const result = await addSubject(formData)
      if (result.error) {
        toast({ title: "Gagal menambah mapel", description: result.error, variant: "destructive" })
        return
      }

      toast({ title: "Berhasil!", description: "Mata pelajaran berhasil ditambahkan." })
      window.location.reload()
    })
  }

  function handleDeleteSubject(subjectId: string) {
    startTransition(async () => {
      const result = await deleteSubject(subjectId)
      if (result.error) {
        toast({ title: "Tidak dapat menghapus mapel", description: result.error, variant: "destructive" })
        return
      }

      setSubjects(prev => prev.filter(subject => subject.id !== subjectId))
      toast({ title: "Dihapus", description: "Mata pelajaran berhasil dihapus." })
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
    <div className="flex max-w-4xl flex-col gap-4 sm:gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Pengaturan</h1>
        <p className="text-muted-foreground">Kelola profil dan preferensi akun Anda.</p>
      </div>

      {/* Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><User className="h-5 w-5" /> Profil Guru</CardTitle>
          <CardDescription>Informasi dasar akun Anda.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="text-xl bg-primary/10 text-primary font-bold">{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h3 className="truncate font-semibold">{profile.full_name || "—"}</h3>
              <p className="truncate text-sm text-muted-foreground">{userEmail}</p>
            </div>
          </div>

          <Separator />

          <form action={handleSaveProfile}>
            <div className="grid gap-6">
              <section className="grid gap-4">
                <div>
                  <h3 className="font-semibold">Data Pribadi</h3>
                  <p className="text-sm text-muted-foreground">Identitas dan informasi dasar guru.</p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="fullName">Nama Lengkap</Label>
                  <Input id="fullName" name="fullName" defaultValue={profile.full_name || ""} placeholder="Nama lengkap Anda" />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="birthPlace">Tempat Lahir</Label>
                    <Input id="birthPlace" name="birthPlace" defaultValue={profile.birth_place || ""} placeholder="Contoh: Palu" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="birthDate">Tanggal Lahir</Label>
                    <Input id="birthDate" name="birthDate" type="date" defaultValue={profile.birth_date || ""} />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="gender">Jenis Kelamin</Label>
                    <Select name="gender" defaultValue={profile.gender || ""}>
                      <SelectTrigger><SelectValue placeholder="Pilih jenis kelamin" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="L">Laki-laki</SelectItem>
                        <SelectItem value="P">Perempuan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="religion">Agama</Label>
                    <Input id="religion" name="religion" defaultValue={profile.religion || ""} placeholder="Contoh: Islam" />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="maritalStatus">Status</Label>
                    <Select name="maritalStatus" defaultValue={profile.marital_status || ""}>
                      <SelectTrigger><SelectValue placeholder="Pilih status" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Belum Menikah">Belum Menikah</SelectItem>
                        <SelectItem value="Menikah">Menikah</SelectItem>
                        <SelectItem value="Cerai">Cerai</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="position">Posisi / Jabatan</Label>
                    <Input id="position" name="position" defaultValue={profile.position || ""} placeholder="Contoh: Guru Kelas" />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="address">Alamat Lengkap</Label>
                  <Input id="address" name="address" defaultValue={profile.address || ""} placeholder="Alamat tempat tinggal" />
                </div>
              </section>

              <Separator />

              <section className="grid gap-4">
                <div>
                  <h3 className="font-semibold">Identitas Kepegawaian</h3>
                  <p className="text-sm text-muted-foreground">Data administrasi guru.</p>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                  <Label htmlFor="subjectSpecialty">Bidang / Mata Pelajaran Utama</Label>
                  <Input id="subjectSpecialty" name="subjectSpecialty" defaultValue={profile.subject_specialty || ""} placeholder="Contoh: Matematika" />
                </div>
              </section>

              <Separator />

              <section className="grid gap-4">
                <div>
                  <h3 className="font-semibold">Kontak</h3>
                  <p className="text-sm text-muted-foreground">Informasi yang dapat digunakan untuk menghubungi guru.</p>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Nomor HP</Label>
                    <Input id="phone" name="phone" type="tel" defaultValue={profile.phone || ""} placeholder="08123456789" />
                  </div>
                  <div className="grid gap-2">
                    <Label>Email</Label>
                    <Input value={userEmail} disabled />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="socialMedia">Media Sosial</Label>
                  <Input id="socialMedia" name="socialMedia" defaultValue={profile.social_media || ""} placeholder="@username atau link profil" />
                </div>
              </section>

              <Separator />

              <section className="grid gap-4">
                <div>
                  <h3 className="font-semibold">Pendidikan Terakhir</h3>
                  <p className="text-sm text-muted-foreground">Riwayat pendidikan terakhir guru.</p>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="educationLevel">Jenjang</Label>
                    <Input id="educationLevel" name="educationLevel" defaultValue={profile.education_level || ""} placeholder="Contoh: S1" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="graduationYear">Tahun Lulus</Label>
                    <Input id="graduationYear" name="graduationYear" type="number" min="1950" max="2100" defaultValue={profile.graduation_year || ""} placeholder="2020" />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="educationInstitution">Institusi</Label>
                  <Input id="educationInstitution" name="educationInstitution" defaultValue={profile.education_institution || ""} placeholder="Nama universitas / institusi" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="educationMajor">Jurusan</Label>
                  <Input id="educationMajor" name="educationMajor" defaultValue={profile.education_major || ""} placeholder="Contoh: Pendidikan Guru Sekolah Dasar" />
                </div>
              </section>

              <Separator />

              <section className="grid gap-4">
                <div>
                  <h3 className="font-semibold">Pengalaman Mengajar</h3>
                  <p className="text-sm text-muted-foreground">Informasi pengalaman profesional guru.</p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="previousSchool">Sekolah Sebelumnya</Label>
                  <Input id="previousSchool" name="previousSchool" defaultValue={profile.previous_school || ""} placeholder="Nama sekolah sebelumnya" />
                </div>
                <div className="grid gap-2 sm:max-w-xs">
                  <Label htmlFor="teachingYears">Lama Mengajar (tahun)</Label>
                  <Input id="teachingYears" name="teachingYears" type="number" min="0" step="0.5" defaultValue={profile.teaching_years || ""} placeholder="5" />
                </div>
              </section>

              <Separator />

              <section className="grid gap-4">
                <div>
                  <h3 className="font-semibold">Tentang Guru</h3>
                  <p className="text-sm text-muted-foreground">Informasi tambahan untuk melengkapi profil.</p>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="hobbies">Hobi</Label>
                    <Input id="hobbies" name="hobbies" defaultValue={profile.hobbies || ""} placeholder="Contoh: Membaca, berkebun" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="favoriteActivity">Aktivitas Favorit</Label>
                    <Input id="favoriteActivity" name="favoriteActivity" defaultValue={profile.favorite_activity || ""} placeholder="Contoh: Menulis" />
                  </div>
                </div>
                <div className="grid gap-2 sm:max-w-md">
                  <Label htmlFor="favoriteDrink">Minuman Favorit</Label>
                  <Input id="favoriteDrink" name="favoriteDrink" defaultValue={profile.favorite_drink || ""} placeholder="Contoh: Kopi" />
                </div>
              </section>
            </div>

            <Button className="mt-6 w-full sm:w-auto" type="submit" disabled={isPending}>
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Simpan Biodata Guru
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


      {/* Subjects Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5" /> Mata Pelajaran</CardTitle>
          <CardDescription>
            Kelola mata pelajaran yang akan muncul di Jadwal, Jurnal, Penilaian, dan Bahan Ajar.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form action={handleAddSubject} className="grid gap-3 sm:grid-cols-[1fr_160px_auto]">
            <div className="grid gap-2">
              <Label htmlFor="subjectName">Nama Mata Pelajaran</Label>
              <Input id="subjectName" name="subjectName" placeholder="Contoh: Matematika" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="subjectCode">Kode</Label>
              <Input id="subjectCode" name="subjectCode" placeholder="MTK" />
            </div>
            <div className="flex items-end">
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                Tambah
              </Button>
            </div>
          </form>

          <Separator />

          {subjects.length === 0 ? (
            <div className="rounded-xl border border-dashed py-8 text-center text-sm text-muted-foreground">
              Belum ada mata pelajaran. Tambahkan mapel pertama di atas.
            </div>
          ) : (
            <div className="grid gap-2">
              {subjects.map((subject: any) => (
                <div key={subject.id} className="flex items-center justify-between gap-3 rounded-xl border p-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{subject.name}</p>
                    <p className="text-xs text-muted-foreground">{subject.code || "Tanpa kode"}</p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="shrink-0 text-destructive hover:text-destructive"
                    disabled={isPending}
                    onClick={() => handleDeleteSubject(subject.id)}
                    title="Hapus mata pelajaran"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
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
                <Select
                  name="academicYearId"
                  value={selectedAcademicYearId}
                  onValueChange={(value) => setSelectedAcademicYearId(value ?? "")}
                >
                  <SelectTrigger className="w-full">
                    <span className="flex-1 truncate text-left">
                      {selectedAcademicYear
                        ? `${selectedAcademicYear.name} - ${selectedAcademicYear.semester}`
                        : "Pilih Tahun Ajaran"}
                    </span>
                  </SelectTrigger>
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
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
