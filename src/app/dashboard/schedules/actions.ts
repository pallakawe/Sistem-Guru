'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function getContext() {
  const supabase = await createClient()
  const { data: userData, error: authError } = await supabase.auth.getUser()
  if (authError || !userData?.user) return { supabase, user: null, activeYearId: null }

  const { data: profile } = await supabase.from('profiles')
    .select('active_academic_year_id').eq('id', userData.user.id).single()
  return { supabase, user: userData.user, activeYearId: profile?.active_academic_year_id || null }
}

export async function getSchedules() {
  const { supabase, user, activeYearId } = await getContext()
  if (!user) return { error: 'Unauthorized' }
  if (!activeYearId) return { data: [] }

  const { data, error } = await supabase.from('schedules')
    .select('id, day_of_week, start_time, end_time, room, classes(id, name), subjects(id, name)')
    .eq('teacher_id', user.id).eq('academic_year_id', activeYearId)
    .order('day_of_week').order('start_time')

  if (error) return { error: error.message }
  return { data: data || [] }
}

export async function getFormData() {
  const { supabase, user, activeYearId } = await getContext()
  if (!user) return { classes: [], subjects: [] }

  const classesQuery = supabase.from('classes').select('id, name').eq('teacher_id', user.id).order('name')
  if (activeYearId) classesQuery.eq('academic_year_id', activeYearId)

  const [classesRes, subjectsRes] = await Promise.all([
    classesQuery,
    supabase.from('subjects').select('id, name').eq('teacher_id', user.id).order('name'),
  ])
  return { classes: classesRes.data || [], subjects: subjectsRes.data || [] }
}

export async function createSchedule(formData: FormData) {
  const { supabase, user, activeYearId } = await getContext()
  if (!user) return { error: 'Unauthorized' }
  if (!activeYearId) return { error: 'Tahun ajaran aktif belum diatur. Silakan atur di Pengaturan.' }

  const dayOfWeek = Number(formData.get('dayOfWeek'))
  const startTime = String(formData.get('startTime') || '')
  const endTime = String(formData.get('endTime') || '')
  const classId = String(formData.get('classId') || '')
  const subjectId = String(formData.get('subjectId') || '')
  const room = String(formData.get('room') || '').trim()

  if (!Number.isInteger(dayOfWeek) || dayOfWeek < 1 || dayOfWeek > 7 || !startTime || !endTime || !classId || !subjectId) {
    return { error: 'Mohon lengkapi semua field yang wajib.' }
  }
  if (endTime <= startTime) return { error: 'Jam selesai harus lebih akhir daripada jam mulai.' }

  const [{ data: ownedClass }, { data: ownedSubject }] = await Promise.all([
    supabase.from('classes').select('id').eq('id', classId).eq('teacher_id', user.id)
      .eq('academic_year_id', activeYearId).maybeSingle(),
    supabase.from('subjects').select('id').eq('id', subjectId).eq('teacher_id', user.id).maybeSingle(),
  ])
  if (!ownedClass || !ownedSubject) return { error: 'Kelas atau mata pelajaran tidak valid.' }

  const { error } = await supabase.from('schedules').insert({
    day_of_week: dayOfWeek, start_time: startTime, end_time: endTime,
    class_id: classId, subject_id: subjectId, room: room || null,
    academic_year_id: activeYearId, teacher_id: user.id
  })
  if (error) return { error: error.message }

  revalidatePath('/dashboard/schedules')
  return { success: true }
}


export async function updateSchedule(scheduleId: string, formData: FormData) {
  const { supabase, user, activeYearId } = await getContext()
  if (!user) return { error: 'Unauthorized' }
  if (!activeYearId) return { error: 'Tahun ajaran aktif belum diatur.' }

  const dayOfWeek = Number(formData.get('dayOfWeek'))
  const startTime = String(formData.get('startTime') || '')
  const endTime = String(formData.get('endTime') || '')
  const classId = String(formData.get('classId') || '')
  const subjectId = String(formData.get('subjectId') || '')
  const room = String(formData.get('room') || '').trim()

  if (!Number.isInteger(dayOfWeek) || dayOfWeek < 1 || dayOfWeek > 7 || !startTime || !endTime || !classId || !subjectId) {
    return { error: 'Mohon lengkapi semua field yang wajib.' }
  }
  if (endTime <= startTime) return { error: 'Jam selesai harus lebih akhir daripada jam mulai.' }

  const [{ data: ownedClass }, { data: ownedSubject }] = await Promise.all([
    supabase.from('classes').select('id').eq('id', classId).eq('teacher_id', user.id)
      .eq('academic_year_id', activeYearId).maybeSingle(),
    supabase.from('subjects').select('id').eq('id', subjectId).eq('teacher_id', user.id).maybeSingle(),
  ])
  if (!ownedClass || !ownedSubject) return { error: 'Kelas atau mata pelajaran tidak valid.' }

  const { data, error } = await supabase.from('schedules')
    .update({
      day_of_week: dayOfWeek,
      start_time: startTime,
      end_time: endTime,
      class_id: classId,
      subject_id: subjectId,
      room: room || null,
    })
    .eq('id', scheduleId)
    .eq('teacher_id', user.id)
    .eq('academic_year_id', activeYearId)
    .select('id')
    .maybeSingle()

  if (error) return { error: error.message }
  if (!data) return { error: 'Jadwal tidak ditemukan.' }

  revalidatePath('/dashboard/schedules')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function deleteSchedule(scheduleId: string) {
  const { supabase, user } = await getContext()
  if (!user) return { error: 'Unauthorized' }

  const { data, error } = await supabase.from('schedules')
    .delete()
    .eq('id', scheduleId)
    .eq('teacher_id', user.id)
    .select('id')
    .maybeSingle()

  if (error) return { error: error.message }
  if (!data) return { error: 'Jadwal tidak ditemukan.' }

  revalidatePath('/dashboard/schedules')
  revalidatePath('/dashboard')
  return { success: true }
}
