'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getMaterialsData() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) return { error: 'Unauthorized' }

  const teacherId = userData.user.id

  const [
    { data: materials, error: materialsError },
    { data: classes, error: classesError },
    { data: subjects, error: subjectsError },
    { data: meetings, error: meetingsError },
  ] = await Promise.all([
    supabase
      .from('learning_materials')
      .select('id, title, description, topic, file_url, file_type, created_at, class_id, subject_id, meeting_id, classes(name), subjects(name), meetings(meeting_number)')
      .eq('teacher_id', teacherId)
      .order('created_at', { ascending: false }),
    supabase
      .from('classes')
      .select('id, name')
      .eq('teacher_id', teacherId)
      .order('name'),
    supabase
      .from('subjects')
      .select('id, name')
      .eq('teacher_id', teacherId)
      .order('name'),
    supabase
      .from('meetings')
      .select('id, meeting_number, date, class_id, subject_id, classes(name), subjects(name)')
      .eq('teacher_id', teacherId)
      .order('date', { ascending: false }),
  ])

  const error = materialsError || classesError || subjectsError || meetingsError
  if (error) return { error: error.message }

  return {
    materials: materials || [],
    classes: classes || [],
    subjects: subjects || [],
    meetings: meetings || [],
  }
}

export async function createMaterial(formData: FormData) {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) return { error: 'Unauthorized' }

  const title = String(formData.get('title') || '').trim()
  const description = String(formData.get('description') || '').trim()
  const subjectId = String(formData.get('subject_id') || '').trim()
  const classId = String(formData.get('class_id') || '').trim()
  const topic = String(formData.get('topic') || '').trim()
  const meetingId = String(formData.get('meeting_id') || '').trim()
  const fileType = String(formData.get('file_type') || '').trim()
  const externalUrl = String(formData.get('url') || '').trim()
  const file = formData.get('file')

  if (!title || !subjectId) {
    return { error: 'Judul dan mata pelajaran wajib diisi.' }
  }

  let fileUrl: string | null = externalUrl || null

  if (file instanceof File && file.size > 0) {
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-')
    const path = `${userData.user.id}/learning-materials/${Date.now()}-${safeName}`
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(path, file, { upsert: false })

    if (uploadError) return { error: uploadError.message }

    const { data: publicUrl } = supabase.storage.from('documents').getPublicUrl(path)
    fileUrl = publicUrl.publicUrl
  }

  if ((fileType === 'Link' || fileType === 'Video') && !fileUrl) {
    return { error: 'URL wajib diisi untuk tipe Link atau Video.' }
  }

  const { error } = await supabase.from('learning_materials').insert({
    title,
    description: description || null,
    subject_id: subjectId,
    class_id: classId || null,
    topic: topic || null,
    file_url: fileUrl,
    file_type: fileType || null,
    meeting_id: meetingId || null,
    teacher_id: userData.user.id,
  })

  if (error) return { error: error.message }

  revalidatePath('/dashboard/materials')
  return { success: true }
}

export async function deleteMaterial(id: string) {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('learning_materials')
    .delete()
    .eq('id', id)
    .eq('teacher_id', userData.user.id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/materials')
  return { success: true }
}
