import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  
  // Ambil user yang sedang login
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) {
    return NextResponse.json({ error: 'Anda belum login. Silakan buka aplikasi di browser dan login terlebih dahulu.' })
  }

  const teacherId = userData.user.id

  // 1. Buat Tahun Ajaran Aktif
  const { data: academicYear, error: ayError } = await supabase.from('academic_years').insert({
    name: '2026/2027',
    semester: 'Ganjil',
    is_active: true,
    teacher_id: teacherId
  }).select('id').single()

  if (ayError) return NextResponse.json({ error: 'Gagal membuat tahun ajaran', detail: ayError })

  // Update profil guru agar menggunakan tahun ajaran tersebut
  await supabase.from('profiles').update({ active_academic_year_id: academicYear.id }).eq('id', teacherId)

  // 2. Buat Data Mata Pelajaran SD
  const subjectsToInsert = [
    { name: 'Tematik (Bahasa Indonesia)', code: 'BIN', teacher_id: teacherId },
    { name: 'Tematik (IPA)', code: 'IPA', teacher_id: teacherId },
    { name: 'Tematik (Matematika)', code: 'MTK', teacher_id: teacherId },
    { name: 'Pendidikan Pancasila', code: 'PPKN', teacher_id: teacherId },
    { name: 'Pendidikan Agama Islam', code: 'PAI', teacher_id: teacherId },
    { name: 'Seni Budaya dan Prakarya', code: 'SBDP', teacher_id: teacherId },
    { name: 'Pendidikan Jasmani Olahraga', code: 'PJOK', teacher_id: teacherId },
  ]
  const { data: subjects, error: subjError } = await supabase.from('subjects').insert(subjectsToInsert).select('id')
  if (subjError) return NextResponse.json({ error: 'Gagal membuat mapel', detail: subjError })

  // 3. Buat Data Kelas SD
  const classesToInsert = [
    { name: 'Kelas 1A', grade_level: '1', homeroom_teacher: 'Budi Santoso', academic_year_id: academicYear.id, teacher_id: teacherId },
    { name: 'Kelas 4B', grade_level: '4', homeroom_teacher: 'Budi Santoso', academic_year_id: academicYear.id, teacher_id: teacherId },
    { name: 'Kelas 6A', grade_level: '6', homeroom_teacher: 'Budi Santoso', academic_year_id: academicYear.id, teacher_id: teacherId },
  ]
  const { data: classes, error: classError } = await supabase.from('classes').insert(classesToInsert).select('id')
  if (classError) return NextResponse.json({ error: 'Gagal membuat kelas', detail: classError })

  // 4. Masukkan Data Siswa ke Kelas 4B sebagai contoh
  const class4B = classes[1].id
  const studentsToInsert = [
    { full_name: 'Ahmad Fauzi', gender: 'L', student_number: 1, class_id: class4B, teacher_id: teacherId },
    { full_name: 'Siti Aminah', gender: 'P', student_number: 2, class_id: class4B, teacher_id: teacherId },
    { full_name: 'Bima Sakti', gender: 'L', student_number: 3, class_id: class4B, teacher_id: teacherId },
    { full_name: 'Ratna Mutiara', gender: 'P', student_number: 4, class_id: class4B, teacher_id: teacherId },
    { full_name: 'Dika Pratama', gender: 'L', student_number: 5, class_id: class4B, teacher_id: teacherId },
  ]
  const { error: studentError } = await supabase.from('students').insert(studentsToInsert)
  if (studentError) return NextResponse.json({ error: 'Gagal membuat siswa', detail: studentError })

  return NextResponse.json({ 
    success: true, 
    message: 'Data SD (Tahun Ajaran, Mapel Tematik, Kelas 1-6, dan Siswa) berhasil dimasukkan ke akun Anda!' 
  })
}
