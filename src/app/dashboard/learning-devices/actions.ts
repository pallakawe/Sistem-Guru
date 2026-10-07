'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getLearningDevices() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) return { error: 'Unauthorized' }

  const { data: profile } = await supabase.from('profiles').select('active_academic_year_id').eq('id', userData.user.id).single()

  const query = supabase
    .from('learning_devices')
    .select('id, title, category, file_url, file_name, created_at')
    .eq('teacher_id', userData.user.id)
    .order('created_at', { ascending: false })

  if (profile?.active_academic_year_id) {
    query.eq('academic_year_id', profile.active_academic_year_id)
  }

  const { data, error } = await query
  if (error) return { error: error.message }
  return { data: data || [] }
}

export async function createLearningDevice(formData: FormData) {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) return { error: 'Unauthorized' }

  const { data: profile } = await supabase.from('profiles').select('active_academic_year_id').eq('id', userData.user.id).single()
  if (!profile?.active_academic_year_id) return { error: 'Tahun ajaran aktif belum diatur.' }

  const title = formData.get('title') as string
  const category = formData.get('category') as string
  const file = formData.get('file') as File

  if (!title || !category) return { error: 'Judul dan kategori wajib diisi.' }

  let fileUrl: string | null = null
  let fileName: string | null = null

  if (file && file.size > 0) {
    const fileExt = file.name.split('.').pop()
    const filePath = `${userData.user.id}/learning-devices/${Date.now()}.${fileExt}`
    const { error: uploadError } = await supabase.storage.from('documents').upload(filePath, file, { upsert: true })
    if (!uploadError) {
      const { data: urlData } = supabase.storage.from('documents').getPublicUrl(filePath)
      fileUrl = urlData.publicUrl
      fileName = file.name
    }
  }

  const { error } = await supabase.from('learning_devices').insert({
    title, category, file_url: fileUrl, file_name: fileName,
    academic_year_id: profile.active_academic_year_id,
    teacher_id: userData.user.id
  })
  if (error) return { error: error.message }

  revalidatePath('/dashboard/learning-devices')
  return { success: true }
}

export async function deleteLearningDevice(id: string) {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) return { error: 'Unauthorized' }

  const { error } = await supabase.from('learning_devices').delete().eq('id', id).eq('teacher_id', userData.user.id)
  if (error) return { error: error.message }

  revalidatePath('/dashboard/learning-devices')
  return { success: true }
}
