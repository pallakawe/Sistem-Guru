/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Users, Loader2, Pencil, Trash2, ChevronLeft, FileSpreadsheet, FileDown } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { addClass, addStudent, getStudentsByClass, updateStudent, updateClass, deleteClass, deleteStudent } from "./actions"
import { useToast } from "@/hooks/use-toast"
import { exportRowsToExcel, exportRowsToPdf } from "@/lib/export-data"

const GRADE_LEVELS = ["1", "2", "3", "4", "5", "6"]

export default function ClassesClient({ initialClasses }: { initialClasses: any[] }) {
  const [classes, setClasses] = useState<any[]>(initialClasses)
  const [selectedClass, setSelectedClass] = useState<any | null>(null)
  const [students, setStudents] = useState<any[]>([])
  const [loadingStudents, setLoadingStudents] = useState(false)
  const [openAddClass, setOpenAddClass] = useState(false)
  const [editingClass, setEditingClass] = useState<any | null>(null)
  const [classToDelete, setClassToDelete] = useState<any | null>(null)
  const [openAddStudent, setOpenAddStudent] = useState(false)
  const [openEditStudent, setOpenEditStudent] = useState(false)
  const [editingStudent, setEditingStudent] = useState<any | null>(null)
  const [studentToDelete, setStudentToDelete] = useState<any | null>(null)
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  async function handleViewStudents(cls: any) {
    setLoadingStudents(true)
    setSelectedClass(cls)
    const res = await getStudentsByClass(cls.id)
    if (!res.error) setStudents(res.data || [])
    setLoadingStudents(false)
  }

  async function handleAddClass(formData: FormData) {
    startTransition(async () => {
      const result = await addClass(formData)
      if (result.error) {
        toast({ title: "Gagal", description: result.error, variant: "destructive" })
      } else {
        toast({ title: "Berhasil!", description: "Kelas baru ditambahkan." })
        setOpenAddClass(false)
        window.location.reload()
      }
    })
  }


  function handleEditClass(formData: FormData) {
    if (!editingClass) return
    startTransition(async () => {
      const result = await updateClass(editingClass.id, formData)
      if (result.error) {
        toast({ title: 'Gagal mengedit kelas', description: result.error, variant: 'destructive' })
      } else {
        setEditingClass(null)
        toast({ title: 'Berhasil', description: 'Data kelas diperbarui.' })
        window.location.reload()
      }
    })
  }

  function handleDeleteClass() {
    if (!classToDelete) return
    startTransition(async () => {
      const result = await deleteClass(classToDelete.id)
      if (result.error) {
        toast({ title: 'Kelas tidak dapat dihapus', description: result.error, variant: 'destructive' })
      } else {
        setClasses(prev => prev.filter(cls => cls.id !== classToDelete.id))
        setClassToDelete(null)
        toast({ title: 'Berhasil', description: 'Kelas dihapus.' })
      }
    })
  }

  async function handleAddStudent(formData: FormData) {
    if (!selectedClass) return
    formData.set('classId', selectedClass.id)
    startTransition(async () => {
      const result = await addStudent(formData)
      if (result.error) {
        toast({ title: "Gagal", description: result.error, variant: "destructive" })
      } else {
        toast({ title: "Berhasil!", description: "Siswa ditambahkan." })
        setOpenAddStudent(false)
        const res = await getStudentsByClass(selectedClass.id)
        if (!res.error) setStudents(res.data || [])
      }
    })
  }

  async function handleUpdateStudent(formData: FormData) {
    if (!editingStudent) return
    startTransition(async () => {
      const result = await updateStudent(editingStudent.id, formData)
      if (result.error) {
        toast({ title: "Gagal", description: result.error, variant: "destructive" })
      } else {
        toast({ title: "Berhasil!", description: "Data siswa diperbarui." })
        setOpenEditStudent(false)
        setEditingStudent(null)
        const res = await getStudentsByClass(selectedClass.id)
        if (!res.error) setStudents(res.data || [])
      }
    })
  }

  function handleDeleteStudent() {
    if (!studentToDelete || !selectedClass) return
    startTransition(async () => {
      const result = await deleteStudent(studentToDelete.id)
      if (result.error) {
        toast({ title: "Gagal", description: result.error, variant: "destructive" })
        return
      }
      const res = await getStudentsByClass(selectedClass.id)
      if (!res.error) setStudents(res.data || [])
      setStudentToDelete(null)
      toast({
        title: result.deactivated ? "Siswa dinonaktifkan" : "Siswa dihapus",
        description: result.deactivated
          ? "Siswa memiliki riwayat absensi/nilai, jadi dinonaktifkan agar riwayat tetap aman."
          : "Data siswa berhasil dihapus."
      })
    })
  }

  const studentExport = {
    title: selectedClass ? `Daftar Siswa - ${selectedClass.name}` : "Daftar Siswa",
    fileName: selectedClass ? `daftar-siswa-${selectedClass.name}` : "daftar-siswa",
    subtitle: selectedClass ? `Jumlah siswa: ${students.length}` : undefined,
    headers: ["No", "NIS", "NISN", "Nama Lengkap", "L/P", "No. Absen", "Status"],
    rows: students.map((s, i) => [
      i + 1,
      s.nis || "-",
      s.nisn || "-",
      s.full_name,
      s.gender || "-",
      s.student_number || "-",
      s.is_active ? "Aktif" : "Tidak Aktif",
    ]),
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          {selectedClass ? (
            <Button variant="ghost" size="sm" className="mb-2 -ml-2" onClick={() => setSelectedClass(null)}>
              <ChevronLeft className="h-4 w-4 mr-1" /> Kembali ke Daftar Kelas
            </Button>
          ) : null}
          <h1 className="text-3xl font-bold tracking-tight">
            {selectedClass ? `${selectedClass.name} — Daftar Siswa` : 'Kelas & Siswa'}
          </h1>
          <p className="text-muted-foreground">
            {selectedClass ? `${students.length} siswa terdaftar` : 'Kelola data kelas dan siswa yang Anda ajar.'}
          </p>
        </div>
        {!selectedClass ? (
          <Button onClick={() => setOpenAddClass(true)}>
            <Plus className="mr-2 h-4 w-4" /> Tambah Kelas
          </Button>
        ) : (
          <div className="flex flex-wrap justify-end gap-2">
            {students.length > 0 && (
              <>
                <Button variant="outline" onClick={() => exportRowsToExcel(studentExport)}>
                  <FileSpreadsheet className="mr-2 h-4 w-4" /> Excel
                </Button>
                <Button variant="outline" onClick={() => exportRowsToPdf(studentExport)}>
                  <FileDown className="mr-2 h-4 w-4" /> PDF
                </Button>
              </>
            )}
            <Button onClick={() => setOpenAddStudent(true)}>
              <Plus className="mr-2 h-4 w-4" /> Tambah Siswa
            </Button>
          </div>
        )}
      </div>

      {!selectedClass ? (
        // Class list view
        <div className="grid gap-4 md:grid-cols-3">
          {classes.length === 0 ? (
            <div className="col-span-3 text-center py-16 border-2 border-dashed rounded-lg">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-medium text-lg">Belum ada kelas</h3>
              <p className="text-muted-foreground text-sm mb-4">Buat kelas baru untuk memulai.</p>
              <Button onClick={() => setOpenAddClass(true)}>Tambah Kelas</Button>
            </div>
          ) : (
            classes.map(cls => (
              <Card key={cls.id} className="hover:shadow-md transition-all">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">{cls.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">Tingkat {cls.grade_level} {cls.homeroom_teacher ? `· ${cls.homeroom_teacher}` : ''}</p>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center mt-4">
                    <Badge variant="secondary">{(cls.students as any[])?.[0]?.count ?? 0} Siswa</Badge>
                    <div className="flex flex-wrap items-center justify-end gap-1">
                      <Button variant="outline" size="sm" onClick={() => handleViewStudents(cls)}>Lihat Siswa</Button>
                      <Button variant="ghost" size="icon-sm" aria-label={`Edit kelas ${cls.name}`} title="Edit kelas" onClick={() => setEditingClass(cls)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon-sm" className="text-destructive hover:text-destructive" aria-label={`Hapus kelas ${cls.name}`} title="Hapus kelas" onClick={() => setClassToDelete(cls)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      ) : (
        // Student list view
        <div className="rounded-md border">
          {loadingStudents ? (
            <div className="flex justify-center items-center py-16"><Loader2 className="h-8 w-8 animate-spin" /></div>
          ) : students.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground">Belum ada siswa di kelas ini.</p>
              <Button className="mt-4" onClick={() => setOpenAddStudent(true)}>Tambah Siswa</Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No</TableHead>
                  <TableHead>NIS/NISN</TableHead>
                  <TableHead>Nama Lengkap</TableHead>
                  <TableHead>L/P</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((s, i) => (
                  <TableRow key={s.id}>
                    <TableCell>{i + 1}</TableCell>
                    <TableCell className="font-mono text-sm">{s.nis || '-'} / {s.nisn || '-'}</TableCell>
                    <TableCell className="font-medium">{s.full_name}</TableCell>
                    <TableCell>{s.gender || '-'}</TableCell>
                    <TableCell><Badge variant={s.is_active ? 'default' : 'secondary'}>{s.is_active ? 'Aktif' : 'Tidak Aktif'}</Badge></TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => { setEditingStudent(s); setOpenEditStudent(true) }}>
                          <Pencil className="h-4 w-4 mr-1" /> Edit
                        </Button>
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => setStudentToDelete(s)}>
                          <Trash2 className="h-4 w-4 mr-1" /> Hapus
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      )}

      {/* Add Class Dialog */}
      <Dialog open={openAddClass} onOpenChange={setOpenAddClass}>
        <DialogContent>
          <form action={handleAddClass}>
            <DialogHeader><DialogTitle>Tambah Kelas Baru</DialogTitle><DialogDescription>Isi data kelas yang ingin Anda buat.</DialogDescription></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nama Kelas</Label>
                <Input id="name" name="name" placeholder="Contoh: Kelas 4A" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="gradeLevel">Tingkat Kelas</Label>
                <Select name="gradeLevel" required>
                  <SelectTrigger><SelectValue placeholder="Pilih Tingkat" /></SelectTrigger>
                  <SelectContent>
                    {GRADE_LEVELS.map(g => <SelectItem key={g} value={g}>Kelas {g}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="homeroomTeacher">Wali Kelas (Opsional)</Label>
                <Input id="homeroomTeacher" name="homeroomTeacher" placeholder="Nama wali kelas" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpenAddClass(false)}>Batal</Button>
              <Button type="submit" disabled={isPending}>{isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Simpan</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>


      {/* Edit Class Dialog */}
      <Dialog open={!!editingClass} onOpenChange={(open) => { if (!open && !isPending) setEditingClass(null) }}>
        <DialogContent>
          <form key={editingClass?.id} action={handleEditClass}>
            <DialogHeader>
              <DialogTitle>Edit Kelas</DialogTitle>
              <DialogDescription>Perbarui nama, tingkat, dan wali kelas.</DialogDescription>
            </DialogHeader>
            {editingClass && (
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-class-name">Nama Kelas</Label>
                  <Input id="edit-class-name" name="name" defaultValue={editingClass.name} required />
                </div>
                <div className="grid gap-2">
                  <Label>Tingkat Kelas</Label>
                  <Select name="gradeLevel" defaultValue={String(editingClass.grade_level)} required>
                    <SelectTrigger><SelectValue placeholder="Pilih Tingkat" /></SelectTrigger>
                    <SelectContent>
                      {GRADE_LEVELS.map(g => <SelectItem key={g} value={g}>Kelas {g}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-homeroom">Wali Kelas</Label>
                  <Input id="edit-homeroom" name="homeroomTeacher" defaultValue={editingClass.homeroom_teacher || ''} />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" disabled={isPending} onClick={() => setEditingClass(null)}>Batal</Button>
              <Button type="submit" disabled={isPending}>{isPending ? 'Menyimpan...' : 'Simpan Perubahan'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Class Confirmation */}
      <Dialog open={!!classToDelete} onOpenChange={(open) => { if (!open && !isPending) setClassToDelete(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Kelas?</DialogTitle>
            <DialogDescription>
              Yakin ingin menghapus kelas "{classToDelete?.name}"? Tindakan ini tidak bisa dibatalkan.
              Kelas dengan siswa atau data pembelajaran terkait tidak akan dihapus demi keamanan data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" disabled={isPending} onClick={() => setClassToDelete(null)}>Batal</Button>
            <Button type="button" variant="destructive" disabled={isPending} onClick={handleDeleteClass}>
              {isPending ? 'Menghapus...' : 'Ya, Hapus Kelas'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Student Dialog */}
      <Dialog open={openAddStudent} onOpenChange={setOpenAddStudent}>
        <DialogContent>
          <form action={handleAddStudent}>
            <DialogHeader><DialogTitle>Tambah Siswa Baru</DialogTitle><DialogDescription>Tambahkan siswa ke {selectedClass?.name}.</DialogDescription></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="fullName">Nama Lengkap</Label>
                <Input id="fullName" name="fullName" placeholder="Nama lengkap siswa" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="nis">NIS</Label>
                  <Input id="nis" name="nis" placeholder="NIS" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="nisn">NISN</Label>
                  <Input id="nisn" name="nisn" placeholder="NISN" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="gender">Jenis Kelamin</Label>
                  <Select name="gender">
                    <SelectTrigger><SelectValue placeholder="Pilih" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="L">Laki-laki</SelectItem>
                      <SelectItem value="P">Perempuan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="studentNumber">No. Absen</Label>
                  <Input id="studentNumber" name="studentNumber" type="number" min={1} placeholder="1" />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpenAddStudent(false)}>Batal</Button>
              <Button type="submit" disabled={isPending}>{isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Simpan</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Student Dialog */}
      <Dialog open={!!studentToDelete} onOpenChange={(open) => { if (!open && !isPending) setStudentToDelete(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Siswa?</DialogTitle>
            <DialogDescription>
              Yakin ingin menghapus {studentToDelete?.full_name}? Jika siswa sudah memiliki riwayat absensi atau nilai,
              sistem akan menonaktifkannya agar riwayat tetap tersimpan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" disabled={isPending} onClick={() => setStudentToDelete(null)}>Batal</Button>
            <Button type="button" variant="destructive" disabled={isPending} onClick={handleDeleteStudent}>
              {isPending ? "Memproses..." : "Lanjutkan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Student Dialog */}
      <Dialog open={openEditStudent} onOpenChange={(o) => { if (!o) { setOpenEditStudent(false); setEditingStudent(null) } }}>
        <DialogContent>
          <form action={handleUpdateStudent}>
            <DialogHeader><DialogTitle>Edit Data Siswa</DialogTitle><DialogDescription>Ubah data siswa di bawah ini.</DialogDescription></DialogHeader>
            {editingStudent && (
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="editFullName">Nama Lengkap</Label>
                  <Input id="editFullName" name="fullName" defaultValue={editingStudent.full_name} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="editNis">NIS</Label>
                    <Input id="editNis" name="nis" defaultValue={editingStudent.nis || ''} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="editNisn">NISN</Label>
                    <Input id="editNisn" name="nisn" defaultValue={editingStudent.nisn || ''} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="editGender">Jenis Kelamin</Label>
                    <Select name="gender" defaultValue={editingStudent.gender || ''}>
                      <SelectTrigger><SelectValue placeholder="Pilih" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="L">Laki-laki</SelectItem>
                        <SelectItem value="P">Perempuan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="editStudentNumber">No. Absen</Label>
                    <Input id="editStudentNumber" name="studentNumber" type="number" defaultValue={editingStudent.student_number || ''} />
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpenEditStudent(false)}>Batal</Button>
              <Button type="submit" disabled={isPending}>{isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Simpan Perubahan</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
