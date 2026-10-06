'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getJournals() {
  const supabase = await createClient()
  
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) return { error: 'Unauthorized' }

  const { data: profile } = await supabase.from('profiles').select('active_academic_year_id').eq('id', userData.user.id).single()
  if (!profile?.active_academic_year_id) return { data: [] }

  const { data, error } = await supabase
    .from('teaching_journals')
    .select(`
      id,
      topic,
      learning_objectives,
      activities,
      method,
      notes,
      obstacles,
      follow_up,
      meetings (
        meeting_number,
        date,
        classes (id, name),
        subjects (id, name)
      )
    `)
    .eq('teacher_id', userData.user.id)
    .order('created_at', { ascending: false })

  if (error) return { error: error.message }
  return { data }
}

export async function getFormData() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) return { classes: [], subjects: [] }
  const { data: classes } = await supabase.from('classes').select('id, name').eq('teacher_id', userData.user.id)
  const { data: subjects } = await supabase.from('subjects').select('id, name').eq('teacher_id', userData.user.id)
  return { classes: classes || [], subjects: subjects || [] }
}

export async function createJournal(formData: FormData) {
  const supabase = await createClient()
  
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) return { error: 'Unauthorized' }

  const { data: profile } = await supabase.from('profiles').select('active_academic_year_id').eq('id', userData.user.id).single()
  if (!profile?.active_academic_year_id) return { error: 'Tahun ajaran aktif belum diatur.' }

  const classId = formData.get('classId') as string
  const subjectId = formData.get('subjectId') as string
  const meetingNumber = parseInt(formData.get('meetingNumber') as string)
  const date = formData.get('date') as string
  const topic = formData.get('topic') as string
  const objectives = formData.get('objectives') as string
  const activities = formData.get('activities') as string
  const method = formData.get('method') as string
  const notes = formData.get('notes') as string
  const obstacles = formData.get('obstacles') as string
  const followUp = formData.get('followUp') as string

  if (!classId || !subjectId || !meetingNumber || !date || !topic) {
    return { error: 'Mohon lengkapi field wajib.' }
  }

  const { data: meeting, error: meetingError } = await supabase.from('meetings').insert({
    meeting_number: meetingNumber,
    date: date,
    class_id: classId,
    subject_id: subjectId,
    academic_year_id: profile.active_academic_year_id,
    teacher_id: userData.user.id
  }).select('id').single()

  if (meetingError) return { error: meetingError.message }

  const { error: journalError } = await supabase.from('teaching_journals').insert({
    meeting_id: meeting.id,
    topic,
    learning_objectives: objectives,
    activities,
    method,
    notes,
    obstacles,
    follow_up: followUp,
    teacher_id: userData.user.id
  })
  if (journalError) return { error: journalError.message }

  await supabase.from('attendance').insert({
    meeting_id: meeting.id,
    teacher_id: userData.user.id
  })

  revalidatePath('/dashboard/journals')
  return { success: true }
}
