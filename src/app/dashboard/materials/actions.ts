'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

function storagePathFromPublicUrl(url: string | null) {
  if (!url) return null
  const marker = '/storage/v1/object/public/documents/'
  const index = url.indexOf(marker)
  return index >= 0 ? decodeURIComponent(url.slice(index + marker.length)) : null
}

export async function getMaterialsData() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) return { error: 'Unauthorized' }

  const teacherId = userData.user.id
  const { data: profile } = await supabase.from('profiles')
    .select('active_academic_year_id').eq('id', teacherId).single()

  const classesQuery = supabase.from('classes').select('id, name').eq('teacher_id', teacherId).order('name')
  const meetingsQuery = supabase.from('meetings')
    .select('id, meeting_number, date, class_id, subject_id, classes(name), subjects(name)')
    .eq('teacher_id', teacherId).order('date', { ascending: false })

  if (profile?.active_academic_year_id) {
    classesQuery.eq('academic_year_id', profile.active_academic_year_id)
    meetingsQuery.eq('academic_year_id', profile.active_academic_year_id)
  }

  const [materialsRes, classesRes, subjectsRes, meetingsRes] = await Promise.all([
    supabase.from('learning_materials')
      .select('id, title, description, topic, file_url, file_type, created_at, class_id, subject_id, meeting_id, classes(name), subjects(name), meetings(meeting_number)')
      .eq('teacher_id', teacherId).order('created_at', { ascending: false }),
    classesQuery,
    supabase.from('subjects').select('id, name').eq('teacher_id', teacherId).order('name'),
    meetingsQuery,
  ])

  const error = materialsRes.error || classesRes.error || subjectsRes.error || meetingsRes.error
  if (error) return { error: error.message }

  return {
    materials: materialsRes.data || [], classes: classesRes.data || [],
    subjects: subjectsRes.data || [], meetings: meetingsRes.data || [],
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

  if (!title || !subjectId) return { error: 'Judul dan mata pelajaran wajib diisi.' }

  const { data: ownedSubject } = await supabase.from('subjects').select('id')
    .eq('id', subjectId).eq('teacher_id', userData.user.id).maybeSingle()
  if (!ownedSubject) return { error: 'Mata pelajaran tidak valid.' }

  if (classId) {
    const { data: ownedClass } = await supabase.from('classes').select('id')
      .eq('id', classId).eq('teacher_id', userData.user.id).maybeSingle()
    if (!ownedClass) return { error: 'Kelas tidak valid.' }
  }
  if (meetingId) {
    const { data: ownedMeeting } = await supabase.from('meetings').select('id')
      .eq('id', meetingId).eq('teacher_id', userData.user.id).maybeSingle()
    if (!ownedMeeting) return { error: 'Pertemuan tidak valid.' }
  }

  let fileUrl: string | null = externalUrl || null
  let uploadedPath: string | null = null

  if (file instanceof File && file.size > 0) {
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-')
    uploadedPath = `${userData.user.id}/learning-materials/${Date.now()}-${safeName}`
    const { error: uploadError } = await supabase.storage.from('documents').upload(uploadedPath, file, { upsert: false })
    if (uploadError) return { error: uploadError.message }
    fileUrl = supabase.storage.from('documents').getPublicUrl(uploadedPath).data.publicUrl
  }

  if ((fileType === 'Link' || fileType === 'Video') && !fileUrl) return { error: 'URL wajib diisi untuk tipe Link atau Video.' }
  if (!['Link', 'Video'].includes(fileType) && !fileUrl) return { error: 'File materi wajib dipilih.' }

  const { error } = await supabase.from('learning_materials').insert({
    title, description: description || null, subject_id: subjectId, class_id: classId || null,
    topic: topic || null, file_url: fileUrl, file_type: fileType || null,
    meeting_id: meetingId || null, teacher_id: userData.user.id
  })

  if (error) {
    if (uploadedPath) await supabase.storage.from('documents').remove([uploadedPath])
    return { error: error.message }
  }

  revalidatePath('/dashboard/materials')
  return { success: true }
}

export async function deleteMaterial(id: string) {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) return { error: 'Unauthorized' }

  const { data: material, error: readError } = await supabase.from('learning_materials')
    .select('id, file_url').eq('id', id).eq('teacher_id', userData.user.id).maybeSingle()
  if (readError) return { error: readError.message }
  if (!material) return { error: 'Bahan ajar tidak ditemukan.' }

  const storagePath = storagePathFromPublicUrl(material.file_url)
  if (storagePath) {
    const { error: storageError } = await supabase.storage.from('documents').remove([storagePath])
    if (storageError) return { error: `Gagal menghapus file: ${storageError.message}` }
  }

  const { error } = await supabase.from('learning_materials').delete()
    .eq('id', id).eq('teacher_id', userData.user.id)
  if (error) return { error: error.message }

  revalidatePath('/dashboard/materials')
  return { success: true }
}
