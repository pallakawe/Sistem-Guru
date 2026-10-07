'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getJournals() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) return { error: 'Unauthorized' }

  const { data: profile } = await supabase.from('profiles')
    .select('active_academic_year_id').eq('id', userData.user.id).single()
  if (!profile?.active_academic_year_id) return { data: [] }

  const { data, error } = await supabase
    .from('teaching_journals')
    .select(`
      id, topic, learning_objectives, activities, method, notes, obstacles, follow_up,
      meetings!inner (
        id, meeting_number, date, academic_year_id,
        classes (id, name),
        subjects (id, name)
      )
    `)
    .eq('teacher_id', userData.user.id)
    .eq('meetings.academic_year_id', profile.active_academic_year_id)
    .order('created_at', { ascending: false })

  if (error) return { error: error.message }
  return { data: data || [] }
}

export async function getFormData() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) return { classes: [], subjects: [] }

  const { data: profile } = await supabase.from('profiles')
    .select('active_academic_year_id').eq('id', userData.user.id).single()

  const classesQuery = supabase.from('classes').select('id, name')
    .eq('teacher_id', userData.user.id).order('name')
  if (profile?.active_academic_year_id) classesQuery.eq('academic_year_id', profile.active_academic_year_id)

  const [classesRes, subjectsRes] = await Promise.all([
    classesQuery,
    supabase.from('subjects').select('id, name').eq('teacher_id', userData.user.id).order('name'),
  ])

  return { classes: classesRes.data || [], subjects: subjectsRes.data || [] }
}

export async function createJournal(formData: FormData) {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) return { error: 'Unauthorized' }

  const { data: profile } = await supabase.from('profiles')
    .select('active_academic_year_id').eq('id', userData.user.id).single()
  if (!profile?.active_academic_year_id) return { error: 'Tahun ajaran aktif belum diatur.' }

  const classId = String(formData.get('classId') || '')
  const subjectId = String(formData.get('subjectId') || '')
  const meetingNumber = Number(formData.get('meetingNumber'))
  const date = String(formData.get('date') || '')
  const topic = String(formData.get('topic') || '').trim()
  const objectives = String(formData.get('objectives') || '').trim()
  const activities = String(formData.get('activities') || '').trim()
  const method = String(formData.get('method') || '').trim()
  const notes = String(formData.get('notes') || '').trim()
  const obstacles = String(formData.get('obstacles') || '').trim()
  const followUp = String(formData.get('followUp') || '').trim()

  if (!classId || !subjectId || !Number.isInteger(meetingNumber) || meetingNumber < 1 || !date || !topic) {
    return { error: 'Mohon lengkapi field wajib dengan benar.' }
  }

  const [{ data: ownedClass }, { data: ownedSubject }] = await Promise.all([
    supabase.from('classes').select('id').eq('id', classId).eq('teacher_id', userData.user.id)
      .eq('academic_year_id', profile.active_academic_year_id).maybeSingle(),
    supabase.from('subjects').select('id').eq('id', subjectId).eq('teacher_id', userData.user.id).maybeSingle(),
  ])
  if (!ownedClass || !ownedSubject) return { error: 'Kelas atau mata pelajaran tidak valid.' }

  const { data: meeting, error: meetingError } = await supabase.from('meetings').insert({
    meeting_number: meetingNumber, date, class_id: classId, subject_id: subjectId,
    academic_year_id: profile.active_academic_year_id, teacher_id: userData.user.id
  }).select('id').single()
  if (meetingError) return { error: meetingError.message }

  const { error: journalError } = await supabase.from('teaching_journals').insert({
    meeting_id: meeting.id, topic,
    learning_objectives: objectives || null, activities: activities || null, method: method || null,
    notes: notes || null, obstacles: obstacles || null, follow_up: followUp || null,
    teacher_id: userData.user.id
  })

  if (journalError) {
    await supabase.from('meetings').delete().eq('id', meeting.id).eq('teacher_id', userData.user.id)
    return { error: journalError.message }
  }

  const { error: attendanceError } = await supabase.from('attendance').insert({
    meeting_id: meeting.id, teacher_id: userData.user.id
  })
  if (attendanceError) {
    await supabase.from('meetings').delete().eq('id', meeting.id).eq('teacher_id', userData.user.id)
    return { error: attendanceError.message }
  }

  revalidatePath('/dashboard/journals')
  revalidatePath('/dashboard/attendance')
  return { success: true }
}


export async function updateJournal(journalId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) return { error: 'Unauthorized' }

  const { data: profile } = await supabase.from('profiles')
    .select('active_academic_year_id').eq('id', userData.user.id).single()
  if (!profile?.active_academic_year_id) return { error: 'Tahun ajaran aktif belum diatur.' }

  const { data: journal, error: journalReadError } = await supabase
    .from('teaching_journals')
    .select('id, meeting_id')
    .eq('id', journalId)
    .eq('teacher_id', userData.user.id)
    .maybeSingle()

  if (journalReadError) return { error: journalReadError.message }
  if (!journal) return { error: 'Jurnal tidak ditemukan.' }

  const classId = String(formData.get('classId') || '')
  const subjectId = String(formData.get('subjectId') || '')
  const meetingNumber = Number(formData.get('meetingNumber'))
  const date = String(formData.get('date') || '')
  const topic = String(formData.get('topic') || '').trim()
  const objectives = String(formData.get('objectives') || '').trim()
  const activities = String(formData.get('activities') || '').trim()
  const method = String(formData.get('method') || '').trim()
  const notes = String(formData.get('notes') || '').trim()
  const obstacles = String(formData.get('obstacles') || '').trim()
  const followUp = String(formData.get('followUp') || '').trim()

  if (!classId || !subjectId || !Number.isInteger(meetingNumber) || meetingNumber < 1 || !date || !topic) {
    return { error: 'Mohon lengkapi field wajib dengan benar.' }
  }

  const [{ data: ownedClass }, { data: ownedSubject }] = await Promise.all([
    supabase.from('classes').select('id').eq('id', classId).eq('teacher_id', userData.user.id)
      .eq('academic_year_id', profile.active_academic_year_id).maybeSingle(),
    supabase.from('subjects').select('id').eq('id', subjectId).eq('teacher_id', userData.user.id).maybeSingle(),
  ])
  if (!ownedClass || !ownedSubject) return { error: 'Kelas atau mata pelajaran tidak valid.' }

  const { error: meetingError } = await supabase.from('meetings')
    .update({ meeting_number: meetingNumber, date, class_id: classId, subject_id: subjectId })
    .eq('id', journal.meeting_id)
    .eq('teacher_id', userData.user.id)

  if (meetingError) return { error: meetingError.message }

  const { error } = await supabase.from('teaching_journals')
    .update({
      topic,
      learning_objectives: objectives || null,
      activities: activities || null,
      method: method || null,
      notes: notes || null,
      obstacles: obstacles || null,
      follow_up: followUp || null,
    })
    .eq('id', journalId)
    .eq('teacher_id', userData.user.id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/journals')
  revalidatePath('/dashboard/attendance')
  return { success: true }
}

export async function deleteJournal(journalId: string) {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) return { error: 'Unauthorized' }

  const { data: journal, error: journalError } = await supabase
    .from('teaching_journals')
    .select('id, meeting_id')
    .eq('id', journalId)
    .eq('teacher_id', userData.user.id)
    .maybeSingle()

  if (journalError) return { error: journalError.message }
  if (!journal) return { error: 'Jurnal tidak ditemukan.' }

  const { error } = await supabase.from('meetings')
    .delete()
    .eq('id', journal.meeting_id)
    .eq('teacher_id', userData.user.id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/journals')
  revalidatePath('/dashboard/attendance')
  revalidatePath('/dashboard/materials')
  return { success: true }
}
