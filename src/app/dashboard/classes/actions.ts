'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getClasses() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) return { error: 'Unauthorized' }

  const { data: profile } = await supabase.from('profiles').select('active_academic_year_id').eq('id', userData.user.id).single()

  const query = supabase
    .from('classes')
    .select('id, name, grade_level, homeroom_teacher, students(count)')
    .eq('teacher_id', userData.user.id)
    .order('name', { ascending: true })

  if (profile?.active_academic_year_id) {
    query.eq('academic_year_id', profile.active_academic_year_id)
  }

  const { data, error } = await query
  if (error) return { error: error.message }
  return { data: data || [] }
}

export async function getStudentsByClass(classId: string) {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) return { error: 'Unauthorized' }

  const { data, error } = await supabase
    .from('students')
    .select('id, full_name, nis, nisn, gender, student_number, is_active')
    .eq('class_id', classId)
    .eq('teacher_id', userData.user.id)
    .order('student_number', { ascending: true, nullsFirst: false })
    .order('full_name', { ascending: true })
  if (error) return { error: error.message }
  return { data: data || [] }
}

export async function addClass(formData: FormData) {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) return { error: 'Unauthorized' }

  const { data: profile } = await supabase.from('profiles').select('active_academic_year_id').eq('id', userData.user.id).single()
  if (!profile?.active_academic_year_id) return { error: 'Tahun ajaran aktif belum diatur.' }

  const name = formData.get('name') as string
  const gradeLevel = formData.get('gradeLevel') as string
  const homeroomTeacher = formData.get('homeroomTeacher') as string

  if (!name || !gradeLevel) return { error: 'Nama kelas dan tingkat wajib diisi.' }

  const { error } = await supabase.from('classes').insert({
    name, grade_level: gradeLevel, homeroom_teacher: homeroomTeacher,
    academic_year_id: profile.active_academic_year_id,
    teacher_id: userData.user.id
  })
  if (error) return { error: error.message }

  revalidatePath('/dashboard/classes')
  return { success: true }
}

export async function addStudent(formData: FormData) {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) return { error: 'Unauthorized' }

  const classId = formData.get('classId') as string
  const fullName = formData.get('fullName') as string
  const nis = formData.get('nis') as string
  const nisn = formData.get('nisn') as string
  const gender = formData.get('gender') as string
  const studentNumber = parseInt(formData.get('studentNumber') as string) || null

  if (!classId || !fullName) return { error: 'Kelas dan nama siswa wajib diisi.' }

  const { data: profile } = await supabase.from('profiles')
    .select('active_academic_year_id').eq('id', userData.user.id).single()

  const classQuery = supabase.from('classes').select('id')
    .eq('id', classId).eq('teacher_id', userData.user.id)

  if (profile?.active_academic_year_id) {
    classQuery.eq('academic_year_id', profile.active_academic_year_id)
  }

  const { data: ownedClass } = await classQuery.maybeSingle()
  if (!ownedClass) return { error: 'Kelas tidak valid atau bukan kelas pada tahun ajaran aktif.' }

  const { error } = await supabase.from('students').insert({
    class_id: classId, full_name: fullName, nis, nisn, gender,
    student_number: studentNumber, teacher_id: userData.user.id
  })
  if (error) return { error: error.message }

  revalidatePath('/dashboard/classes')
  return { success: true }
}

export async function updateStudent(studentId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) return { error: 'Unauthorized' }

  const fullName = formData.get('fullName') as string
  const nis = formData.get('nis') as string
  const nisn = formData.get('nisn') as string
  const gender = formData.get('gender') as string
  const studentNumber = parseInt(formData.get('studentNumber') as string) || null

  const { error } = await supabase.from('students')
    .update({ full_name: fullName, nis, nisn, gender, student_number: studentNumber })
    .eq('id', studentId)
    .eq('teacher_id', userData.user.id)
  if (error) return { error: error.message }

  revalidatePath('/dashboard/classes')
  return { success: true }
}

export async function updateClass(classId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) return { error: 'Anda harus login terlebih dahulu.' }

  const name = String(formData.get('name') || '').trim()
  const gradeLevel = String(formData.get('gradeLevel') || '').trim()
  const homeroomTeacher = String(formData.get('homeroomTeacher') || '').trim()
  if (!name || !['1', '2', '3', '4', '5', '6'].includes(gradeLevel)) {
    return { error: 'Nama dan tingkat kelas (1–6) wajib diisi.' }
  }

  const { data, error } = await supabase.from('classes')
    .update({ name, grade_level: gradeLevel, homeroom_teacher: homeroomTeacher })
    .eq('id', classId)
    .eq('teacher_id', userData.user.id)
    .select('id')
    .maybeSingle()
  if (error) return { error: error.message }
  if (!data) return { error: 'Kelas tidak ditemukan atau tidak diizinkan.' }
  revalidatePath('/dashboard/classes')
  return { success: true }
}

export async function deleteClass(classId: string) {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) return { error: 'Anda harus login terlebih dahulu.' }

  const { data: owned, error: ownerError } = await supabase.from('classes')
    .select('id').eq('id', classId).eq('teacher_id', userData.user.id).maybeSingle()
  if (ownerError) return { error: ownerError.message }
  if (!owned) return { error: 'Kelas tidak ditemukan atau tidak diizinkan.' }

  // Existing foreign keys use ON DELETE CASCADE. Never delete a class while
  // dependent student / teaching data may be destroyed by that cascade.
  const relatedTables = [
    'students', 'schedules', 'meetings', 'assessments', 'learning_materials'
  ] as const
  for (const table of relatedTables) {
    const { count, error } = await supabase.from(table)
      .select('id', { count: 'exact', head: true })
      .eq('class_id', classId).eq('teacher_id', userData.user.id)
    if (error) return { error: 'Gagal memeriksa data terkait: ' + error.message }
    if (count === null) return { error: 'Tidak dapat memastikan kelas aman dihapus.' }
    if (count > 0) return {
      error: 'Kelas memiliki data siswa atau pembelajaran terkait. Pindahkan/hapus data terkait terlebih dahulu agar tidak kehilangan data.'
    }
  }

  const { data, error } = await supabase.from('classes').delete()
    .eq('id', classId).eq('teacher_id', userData.user.id)
    .select('id').maybeSingle()
  if (error) return { error: error.message }
  if (!data) return { error: 'Kelas sudah tidak tersedia.' }
  revalidatePath('/dashboard/classes')
  return { success: true }
}


export async function deleteStudent(studentId: string) {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) return { error: 'Unauthorized' }

  const { data: student, error: studentError } = await supabase
    .from('students')
    .select('id, class_id')
    .eq('id', studentId)
    .eq('teacher_id', userData.user.id)
    .maybeSingle()

  if (studentError) return { error: studentError.message }
  if (!student) return { error: 'Siswa tidak ditemukan.' }

  const [{ count: attendanceCount, error: attendanceError }, { count: scoreCount, error: scoreError }] = await Promise.all([
    supabase.from('attendance_records').select('id', { count: 'exact', head: true }).eq('student_id', studentId),
    supabase.from('assessment_scores').select('id', { count: 'exact', head: true }).eq('student_id', studentId),
  ])

  if (attendanceError || scoreError) return { error: (attendanceError || scoreError)?.message || 'Gagal memeriksa data siswa.' }

  if ((attendanceCount || 0) > 0 || (scoreCount || 0) > 0) {
    const { error: deactivateError } = await supabase
      .from('students')
      .update({ is_active: false })
      .eq('id', studentId)
      .eq('teacher_id', userData.user.id)

    if (deactivateError) return { error: deactivateError.message }

    revalidatePath('/dashboard/classes')
    return { success: true, deactivated: true }
  }

  const { error } = await supabase
    .from('students')
    .delete()
    .eq('id', studentId)
    .eq('teacher_id', userData.user.id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/classes')
  return { success: true, deactivated: false }
}


type ImportedStudent = {
  full_name: string
  nis?: string
  nisn?: string
  gender?: string
  student_number?: number | null
}

export async function importStudents(classId: string, rows: ImportedStudent[]) {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) return { error: 'Unauthorized' }

  if (!classId) return { error: 'Kelas wajib dipilih.' }
  if (!Array.isArray(rows) || rows.length === 0) return { error: 'Tidak ada data siswa untuk diimport.' }
  if (rows.length > 500) return { error: 'Maksimal 500 siswa dalam satu kali import.' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('active_academic_year_id')
    .eq('id', userData.user.id)
    .single()

  const classQuery = supabase
    .from('classes')
    .select('id')
    .eq('id', classId)
    .eq('teacher_id', userData.user.id)

  if (profile?.active_academic_year_id) {
    classQuery.eq('academic_year_id', profile.active_academic_year_id)
  }

  const { data: ownedClass, error: classError } = await classQuery.maybeSingle()
  if (classError) return { error: classError.message }
  if (!ownedClass) return { error: 'Kelas tidak valid atau bukan kelas pada tahun ajaran aktif.' }

  const normalized = rows.map((row, index) => {
    const fullName = String(row.full_name || '').trim()
    const nis = String(row.nis || '').trim()
    const nisn = String(row.nisn || '').trim()
    const rawGender = String(row.gender || '').trim().toUpperCase()
    const gender = rawGender === 'LAKI-LAKI' || rawGender === 'LAKI LAKI' || rawGender === 'L' ? 'L'
      : rawGender === 'PEREMPUAN' || rawGender === 'P' ? 'P'
      : ''
    const number = row.student_number === null || row.student_number === undefined || row.student_number === ''
      ? null
      : Number(row.student_number)

    return {
      rowNumber: index + 2,
      full_name: fullName,
      nis,
      nisn,
      gender,
      student_number: number,
    }
  })

  const invalidRows: string[] = []
  normalized.forEach((row) => {
    if (!row.full_name) invalidRows.push(`Baris ${row.rowNumber}: nama siswa kosong.`)
    if (row.gender && !['L', 'P'].includes(row.gender)) invalidRows.push(`Baris ${row.rowNumber}: jenis kelamin tidak valid.`)
    if (row.student_number !== null && (!Number.isInteger(row.student_number) || row.student_number < 1)) {
      invalidRows.push(`Baris ${row.rowNumber}: nomor absen harus bilangan bulat positif.`)
    }
  })

  if (invalidRows.length > 0) {
    return { error: invalidRows.slice(0, 5).join(' ') + (invalidRows.length > 5 ? ' Periksa baris lainnya juga.' : '') }
  }

  const seenNis = new Set<string>()
  const seenNisn = new Set<string>()
  for (const row of normalized) {
    if (row.nis) {
      if (seenNis.has(row.nis)) return { error: `NIS ${row.nis} duplikat di file Excel.` }
      seenNis.add(row.nis)
    }
    if (row.nisn) {
      if (seenNisn.has(row.nisn)) return { error: `NISN ${row.nisn} duplikat di file Excel.` }
      seenNisn.add(row.nisn)
    }
  }

  const { data: existingStudents, error: existingError } = await supabase
    .from('students')
    .select('nis, nisn')
    .eq('class_id', classId)
    .eq('teacher_id', userData.user.id)

  if (existingError) return { error: existingError.message }

  const existingNis = new Set((existingStudents || []).map((item: any) => item.nis).filter(Boolean))
  const existingNisn = new Set((existingStudents || []).map((item: any) => item.nisn).filter(Boolean))

  const skipped: string[] = []
  const insertRows = normalized.filter((row) => {
    const duplicateNis = row.nis && existingNis.has(row.nis)
    const duplicateNisn = row.nisn && existingNisn.has(row.nisn)
    if (duplicateNis || duplicateNisn) {
      skipped.push(row.full_name)
      return false
    }
    return true
  })

  if (insertRows.length === 0) {
    return {
      success: true,
      imported: 0,
      skipped: skipped.length,
      message: 'Tidak ada siswa baru. Semua data terdeteksi sebagai duplikat NIS/NISN.',
    }
  }

  const { error: insertError } = await supabase.from('students').insert(
    insertRows.map((row) => ({
      class_id: classId,
      full_name: row.full_name,
      nis: row.nis || null,
      nisn: row.nisn || null,
      gender: row.gender || null,
      student_number: row.student_number,
      teacher_id: userData.user.id,
      is_active: true,
    }))
  )

  if (insertError) return { error: insertError.message }

  revalidatePath('/dashboard/classes')
  return {
    success: true,
    imported: insertRows.length,
    skipped: skipped.length,
    message: `${insertRows.length} siswa berhasil diimport${skipped.length ? `, ${skipped.length} data duplikat dilewati` : ''}.`,
  }
}
