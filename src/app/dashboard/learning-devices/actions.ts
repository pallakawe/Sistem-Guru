'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

function storagePathFromPublicUrl(url: string | null) {
  if (!url) return null
  const marker = '/storage/v1/object/public/documents/'
  const index = url.indexOf(marker)
  return index >= 0 ? decodeURIComponent(url.slice(index + marker.length)) : null
}

export async function getLearningDevices() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) return { error: 'Unauthorized' }

  const { data: profile } = await supabase.from('profiles').select('active_academic_year_id').eq('id', userData.user.id).single()
  const query = supabase.from('learning_devices')
    .select('id, title, category, file_url, file_name, created_at, subject_id, subjects(id, name)')
    .eq('teacher_id', userData.user.id)
    .order('created_at', { ascending: false })

  if (profile?.active_academic_year_id) query.eq('academic_year_id', profile.active_academic_year_id)

  const [{ data, error }, { data: subjects, error: subjectsError }] = await Promise.all([
    query,
    supabase.from('subjects').select('id, name').eq('teacher_id', userData.user.id).order('name'),
  ])
  if (error || subjectsError) return { error: (error || subjectsError)?.message || 'Gagal memuat data.' }
  return { data: data || [], subjects: subjects || [] }
}

export async function createLearningDevice(formData: FormData) {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) return { error: 'Unauthorized' }

  const { data: profile } = await supabase.from('profiles').select('active_academic_year_id').eq('id', userData.user.id).single()
  if (!profile?.active_academic_year_id) return { error: 'Tahun ajaran aktif belum diatur.' }

  const title = String(formData.get('title') || '').trim()
  const category = String(formData.get('category') || '').trim()
  const subjectId = String(formData.get('subjectId') || '').trim()
  const file = formData.get('file')

  if (!title || !category || !subjectId) return { error: 'Judul, mata pelajaran, dan kategori wajib diisi.' }

  const { data: ownedSubject, error: subjectError } = await supabase
    .from('subjects')
    .select('id')
    .eq('id', subjectId)
    .eq('teacher_id', userData.user.id)
    .maybeSingle()
  if (subjectError) return { error: subjectError.message }
  if (!ownedSubject) return { error: 'Mata pelajaran tidak valid.' }
  if (!(file instanceof File) || file.size === 0) return { error: 'File perangkat pembelajaran wajib dipilih.' }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-')
  const filePath = `${userData.user.id}/learning-devices/${Date.now()}-${safeName}`
  const { error: uploadError } = await supabase.storage.from('documents').upload(filePath, file, { upsert: false })
  if (uploadError) return { error: `Upload gagal: ${uploadError.message}` }

  const { data: urlData } = supabase.storage.from('documents').getPublicUrl(filePath)
  const { error } = await supabase.from('learning_devices').insert({
    title, category, subject_id: subjectId, file_url: urlData.publicUrl, file_name: file.name,
    academic_year_id: profile.active_academic_year_id, teacher_id: userData.user.id
  })

  if (error) {
    await supabase.storage.from('documents').remove([filePath])
    return { error: error.message }
  }

  revalidatePath('/dashboard/learning-devices')
  return { success: true }
}

export async function deleteLearningDevice(id: string) {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) return { error: 'Unauthorized' }

  const { data: device, error: readError } = await supabase.from('learning_devices')
    .select('id, file_url').eq('id', id).eq('teacher_id', userData.user.id).maybeSingle()

  if (readError) return { error: readError.message }
  if (!device) return { error: 'Perangkat pembelajaran tidak ditemukan.' }

  const storagePath = storagePathFromPublicUrl(device.file_url)
  if (storagePath) {
    const { error: storageError } = await supabase.storage.from('documents').remove([storagePath])
    if (storageError) return { error: `Gagal menghapus file: ${storageError.message}` }
  }

  const { error } = await supabase.from('learning_devices').delete().eq('id', id).eq('teacher_id', userData.user.id)
  if (error) return { error: error.message }

  revalidatePath('/dashboard/learning-devices')
  return { success: true }
}


export async function updateLearningDevice(id: string, formData: FormData) {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) return { error: 'Unauthorized' }

  const title = String(formData.get('title') || '').trim()
  const category = String(formData.get('category') || '').trim()
  const subjectId = String(formData.get('subjectId') || '').trim()
  if (!title || !category || !subjectId) return { error: 'Judul, mata pelajaran, dan kategori wajib diisi.' }

  const { data: ownedSubject, error: subjectError } = await supabase
    .from('subjects')
    .select('id')
    .eq('id', subjectId)
    .eq('teacher_id', userData.user.id)
    .maybeSingle()
  if (subjectError) return { error: subjectError.message }
  if (!ownedSubject) return { error: 'Mata pelajaran tidak valid.' }

  const { data, error } = await supabase.from('learning_devices')
    .update({ title, category, subject_id: subjectId })
    .eq('id', id)
    .eq('teacher_id', userData.user.id)
    .select('id')
    .maybeSingle()

  if (error) return { error: error.message }
  if (!data) return { error: 'Perangkat pembelajaran tidak ditemukan.' }

  revalidatePath('/dashboard/learning-devices')
  return { success: true }
}
