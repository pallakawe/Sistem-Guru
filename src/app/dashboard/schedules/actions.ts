'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getSchedules() {
  const supabase = await createClient()
  
  const { data: userData, error: authError } = await supabase.auth.getUser()
  if (authError || !userData?.user) return { error: 'Unauthorized' }

  // Get active academic year for the user
  const { data: profile } = await supabase
    .from('profiles')
    .select('active_academic_year_id')
    .eq('id', userData.user.id)
    .single()

  if (!profile?.active_academic_year_id) {
     // fallback if no active academic year
     return { data: [] }
  }

  const { data, error } = await supabase
    .from('schedules')
    .select(`
      id,
      day_of_week,
      start_time,
      end_time,
      room,
      classes(id, name),
      subjects(id, name)
    `)
    .eq('teacher_id', userData.user.id)
    .eq('academic_year_id', profile.active_academic_year_id)
    .order('start_time', { ascending: true })

  if (error) return { error: error.message }
  return { data }
}

export async function getFormData() {
  const supabase = await createClient()
  
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) return { classes: [], subjects: [] }

  const { data: classes } = await supabase.from('classes').select('id, name').eq('teacher_id', userData.user.id)
  const { data: subjects } = await supabase.from('subjects').select('id, name').eq('teacher_id', userData.user.id)
  
  return { 
    classes: classes || [], 
    subjects: subjects || [] 
  }
}

export async function createSchedule(formData: FormData) {
  const supabase = await createClient()
  
  const { data: userData, error: authError } = await supabase.auth.getUser()
  if (authError || !userData?.user) return { error: 'Unauthorized' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('active_academic_year_id')
    .eq('id', userData.user.id)
    .single()

  if (!profile?.active_academic_year_id) {
    return { error: 'Tahun ajaran aktif belum diatur. Silakan atur di Pengaturan.' }
  }

  const dayOfWeek = parseInt(formData.get('dayOfWeek') as string)
  const startTime = formData.get('startTime') as string
  const endTime = formData.get('endTime') as string
  const classId = formData.get('classId') as string
  const subjectId = formData.get('subjectId') as string
  const room = formData.get('room') as string

  if (!dayOfWeek || !startTime || !endTime || !classId || !subjectId) {
    return { error: 'Mohon lengkapi semua field yang wajib.' }
  }

  const { error } = await supabase.from('schedules').insert({
    day_of_week: dayOfWeek,
    start_time: startTime,
    end_time: endTime,
    class_id: classId,
    subject_id: subjectId,
    room: room,
    academic_year_id: profile.active_academic_year_id,
    teacher_id: userData.user.id
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/schedules')
  return { success: true }
}
