'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

const VALID_STATUSES = new Set(['H', 'S', 'I', 'A'])

export async function getMeetings() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) return { error: 'Unauthorized' }

  const { data: profile } = await supabase.from('profiles').select('active_academic_year_id').eq('id', userData.user.id).single()
  if (!profile?.active_academic_year_id) return { data: [] }

  const { data, error } = await supabase
    .from('meetings')
    .select('id, meeting_number, date, classes(id, name), subjects(id, name), attendance(id)')
    .eq('teacher_id', userData.user.id)
    .eq('academic_year_id', profile.active_academic_year_id)
    .order('date', { ascending: false })

  if (error) return { error: error.message }
  return { data: data || [] }
}

export async function getMeetingStudents(meetingId: string) {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) return { error: 'Unauthorized' }

  const { data: meeting, error: meetingError } = await supabase
    .from('meetings')
    .select('class_id, attendance(id)')
    .eq('id', meetingId)
    .eq('teacher_id', userData.user.id)
    .maybeSingle()

  if (meetingError) return { error: meetingError.message }
  if (!meeting || !meeting.attendance || (meeting.attendance as any[]).length === 0) {
    return { error: 'Data absensi untuk pertemuan ini tidak ditemukan.' }
  }

  const attendanceId = (meeting.attendance as any[])[0].id

  const [{ data: students, error: studentsError }, { data: records, error: recordsError }] = await Promise.all([
    supabase.from('students').select('id, full_name, student_number')
      .eq('class_id', meeting.class_id).eq('teacher_id', userData.user.id).eq('is_active', true)
      .order('student_number', { ascending: true, nullsFirst: false }).order('full_name'),
    supabase.from('attendance_records').select('student_id, status').eq('attendance_id', attendanceId),
  ])

  const error = studentsError || recordsError
  if (error) return { error: error.message }

  return { students: students || [], records: records || [], attendanceId }
}

export async function saveAttendance(attendanceId: string, records: { student_id: string, status: string }[]) {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) return { error: 'Unauthorized' }

  const { data: attendance, error: attendanceError } = await supabase
    .from('attendance')
    .select('id, meetings(class_id)')
    .eq('id', attendanceId)
    .eq('teacher_id', userData.user.id)
    .maybeSingle()

  if (attendanceError) return { error: attendanceError.message }
  if (!attendance) return { error: 'Data absensi tidak ditemukan.' }
  if (records.some((record) => !VALID_STATUSES.has(record.status))) return { error: 'Status kehadiran tidak valid.' }

  const classId = (attendance.meetings as any)?.class_id
  const studentIds = [...new Set(records.map((record) => record.student_id))]

  if (studentIds.length > 0) {
    const { data: allowedStudents, error: studentsError } = await supabase
      .from('students').select('id').in('id', studentIds)
      .eq('class_id', classId).eq('teacher_id', userData.user.id)

    if (studentsError) return { error: studentsError.message }
    if ((allowedStudents || []).length !== studentIds.length) return { error: 'Terdapat siswa yang tidak valid untuk kelas ini.' }

    const { error } = await supabase.from('attendance_records').upsert(
      records.map((record) => ({ attendance_id: attendanceId, student_id: record.student_id, status: record.status })),
      { onConflict: 'attendance_id,student_id' }
    )
    if (error) return { error: error.message }
  }

  revalidatePath('/dashboard/attendance')
  return { success: true }
}
