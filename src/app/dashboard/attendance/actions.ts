'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

const VALID_STATUSES = new Set(['H', 'S', 'I', 'A'])

async function getContext() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) return { supabase, user: null, activeYearId: null }

  const { data: profile } = await supabase
    .from('profiles')
    .select('active_academic_year_id')
    .eq('id', userData.user.id)
    .single()

  return {
    supabase,
    user: userData.user,
    activeYearId: profile?.active_academic_year_id || null,
  }
}

export async function getAttendanceSetup() {
  const { supabase, user, activeYearId } = await getContext()
  if (!user) return { error: 'Unauthorized', classes: [] }
  if (!activeYearId) return { classes: [], activeYearId: null }

  const { data, error } = await supabase
    .from('classes')
    .select('id, name')
    .eq('teacher_id', user.id)
    .eq('academic_year_id', activeYearId)
    .order('name')

  if (error) return { error: error.message, classes: [] }

  return { classes: data || [], activeYearId }
}

export async function getMonthlyAttendanceSummary(classId: string, month: string) {
  const { supabase, user, activeYearId } = await getContext()
  if (!user) return { error: 'Unauthorized', days: [] }
  if (!activeYearId) return { error: 'Tahun ajaran aktif belum diatur.', days: [] }

  if (!/^\d{4}-\d{2}$/.test(month)) return { error: 'Format bulan tidak valid.', days: [] }

  const { data: ownedClass } = await supabase
    .from('classes')
    .select('id')
    .eq('id', classId)
    .eq('teacher_id', user.id)
    .eq('academic_year_id', activeYearId)
    .maybeSingle()

  if (!ownedClass) return { error: 'Kelas tidak valid.', days: [] }

  const firstDate = month + '-01'
  const [year, monthNumber] = month.split('-').map(Number)
  const lastDay = new Date(year, monthNumber, 0).getDate()
  const lastDate = month + '-' + String(lastDay).padStart(2, '0')

  const { data, error } = await supabase
    .from('daily_attendance')
    .select('id, attendance_date, daily_attendance_records(status)')
    .eq('teacher_id', user.id)
    .eq('class_id', classId)
    .eq('academic_year_id', activeYearId)
    .gte('attendance_date', firstDate)
    .lte('attendance_date', lastDate)
    .order('attendance_date')

  if (error) return { error: error.message, days: [] }

  const days = (data || []).map((item: any) => {
    const counts = { H: 0, S: 0, I: 0, A: 0 }
    ;(item.daily_attendance_records || []).forEach((record: any) => {
      if (record.status in counts) counts[record.status as keyof typeof counts] += 1
    })
    return {
      date: item.attendance_date,
      total: (item.daily_attendance_records || []).length,
      counts,
    }
  })

  return { days }
}

export async function getDailyAttendance(classId: string, date: string) {
  const { supabase, user, activeYearId } = await getContext()
  if (!user) return { error: 'Unauthorized' }
  if (!activeYearId) return { error: 'Tahun ajaran aktif belum diatur.' }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { error: 'Tanggal tidak valid.' }

  const { data: ownedClass, error: classError } = await supabase
    .from('classes')
    .select('id, name')
    .eq('id', classId)
    .eq('teacher_id', user.id)
    .eq('academic_year_id', activeYearId)
    .maybeSingle()

  if (classError) return { error: classError.message }
  if (!ownedClass) return { error: 'Kelas tidak valid.' }

  const [{ data: students, error: studentsError }, { data: attendance, error: attendanceError }] = await Promise.all([
    supabase
      .from('students')
      .select('id, full_name, student_number')
      .eq('class_id', classId)
      .eq('teacher_id', user.id)
      .eq('is_active', true)
      .order('student_number', { ascending: true, nullsFirst: false })
      .order('full_name'),
    supabase
      .from('daily_attendance')
      .select('id')
      .eq('teacher_id', user.id)
      .eq('class_id', classId)
      .eq('attendance_date', date)
      .maybeSingle(),
  ])

  if (studentsError || attendanceError) return { error: (studentsError || attendanceError)?.message }

  let records: any[] = []
  if (attendance?.id) {
    const { data, error } = await supabase
      .from('daily_attendance_records')
      .select('student_id, status, notes')
      .eq('daily_attendance_id', attendance.id)

    if (error) return { error: error.message }
    records = data || []
  }

  return {
    className: ownedClass.name,
    attendanceId: attendance?.id || null,
    students: students || [],
    records,
  }
}

export async function saveDailyAttendance(
  classId: string,
  date: string,
  records: { student_id: string, status: string, notes?: string }[]
) {
  const { supabase, user, activeYearId } = await getContext()
  if (!user) return { error: 'Unauthorized' }
  if (!activeYearId) return { error: 'Tahun ajaran aktif belum diatur.' }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { error: 'Tanggal tidak valid.' }
  if (!Array.isArray(records) || records.length === 0) return { error: 'Tidak ada data siswa untuk disimpan.' }
  if (records.some((record) => !VALID_STATUSES.has(record.status))) {
    return { error: 'Status kehadiran tidak valid.' }
  }

  const { data: ownedClass, error: classError } = await supabase
    .from('classes')
    .select('id')
    .eq('id', classId)
    .eq('teacher_id', user.id)
    .eq('academic_year_id', activeYearId)
    .maybeSingle()

  if (classError) return { error: classError.message }
  if (!ownedClass) return { error: 'Kelas tidak valid.' }

  const studentIds = [...new Set(records.map((record) => record.student_id))]
  const { data: allowedStudents, error: studentsError } = await supabase
    .from('students')
    .select('id')
    .in('id', studentIds)
    .eq('class_id', classId)
    .eq('teacher_id', user.id)
    .eq('is_active', true)

  if (studentsError) return { error: studentsError.message }
  if ((allowedStudents || []).length !== studentIds.length) {
    return { error: 'Terdapat siswa yang tidak valid untuk kelas ini.' }
  }

  const { data: attendance, error: attendanceError } = await supabase
    .from('daily_attendance')
    .upsert({
      class_id: classId,
      attendance_date: date,
      academic_year_id: activeYearId,
      teacher_id: user.id,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'teacher_id,class_id,attendance_date',
    })
    .select('id')
    .single()

  if (attendanceError) return { error: attendanceError.message }

  const { error: recordsError } = await supabase
    .from('daily_attendance_records')
    .upsert(
      records.map((record) => ({
        daily_attendance_id: attendance.id,
        student_id: record.student_id,
        status: record.status,
        notes: record.notes?.trim() || null,
        updated_at: new Date().toISOString(),
      })),
      { onConflict: 'daily_attendance_id,student_id' }
    )

  if (recordsError) return { error: recordsError.message }

  revalidatePath('/dashboard/attendance')
  revalidatePath('/dashboard')
  return { success: true }
}
