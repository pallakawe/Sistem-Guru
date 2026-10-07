'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getMeetings() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) return { error: 'Unauthorized' }

  const { data: profile } = await supabase.from('profiles').select('active_academic_year_id').eq('id', userData.user.id).single()
  if (!profile?.active_academic_year_id) return { data: [] }

  const { data, error } = await supabase
    .from('meetings')
    .select(`
      id, meeting_number, date,
      classes (id, name),
      subjects (id, name),
      attendance (id)
    `)
    .eq('teacher_id', userData.user.id)
    .eq('academic_year_id', profile.active_academic_year_id)
    .order('date', { ascending: false })

  if (error) return { error: error.message }
  return { data: data || [] }
}

export async function getMeetingStudents(meetingId: string) {
  const supabase = await createClient()
  
  const { data: meeting } = await supabase
    .from('meetings')
    .select('class_id, attendance(id)')
    .eq('id', meetingId)
    .single()
    
  if (!meeting || !meeting.attendance || (meeting.attendance as any[]).length === 0) {
    return { error: 'Data absensi untuk pertemuan ini tidak ditemukan.' }
  }
  
  const classId = meeting.class_id
  const attendanceId = (meeting.attendance as any)[0].id

  const { data: students } = await supabase
    .from('students')
    .select('id, full_name, student_number')
    .eq('class_id', classId)
    .eq('is_active', true)
    .order('full_name', { ascending: true })

  if (!students) return { students: [], records: [], attendanceId }

  const { data: records } = await supabase
    .from('attendance_records')
    .select('student_id, status')
    .eq('attendance_id', attendanceId)

  return { students, records: records || [], attendanceId }
}

export async function saveAttendance(attendanceId: string, records: { student_id: string, status: string }[]) {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) return { error: 'Unauthorized' }

  // Hapus record lama agar tidak duplikat
  await supabase.from('attendance_records').delete().eq('attendance_id', attendanceId)

  const insertData = records.map(r => ({
    attendance_id: attendanceId,
    student_id: r.student_id,
    status: r.status
  }))

  if (insertData.length > 0) {
    const { error } = await supabase.from('attendance_records').insert(insertData)
    if (error) return { error: error.message }
  }
  
  revalidatePath('/dashboard/attendance')
  return { success: true }
}
