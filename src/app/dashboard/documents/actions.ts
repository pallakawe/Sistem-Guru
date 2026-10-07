'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getDocuments() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) return { error: 'Unauthorized' }

  const { data, error } = await supabase
    .from('documents')
    .select('id, title, category, file_url, file_name, created_at')
    .eq('teacher_id', userData.user.id)
    .order('created_at', { ascending: false })

  if (error) return { error: error.message }
  return { data: data || [] }
}

export async function createDocument(formData: FormData) {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) return { error: 'Unauthorized' }

  const title = formData.get('title') as string
  const category = formData.get('category') as string
  const file = formData.get('file') as File

  if (!title || !category) return { error: 'Judul dan kategori wajib diisi.' }

  let fileUrl: string | null = null
  let fileName: string | null = null

  if (file && file.size > 0) {
    const fileExt = file.name.split('.').pop()
    const filePath = `${userData.user.id}/documents/${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file, { upsert: true })

    if (!uploadError) {
      const { data: urlData } = supabase.storage.from('documents').getPublicUrl(filePath)
      fileUrl = urlData.publicUrl
      fileName = file.name
    }
  }

  const { error } = await supabase.from('documents').insert({
    title, category, file_url: fileUrl, file_name: fileName,
    teacher_id: userData.user.id
  })
  if (error) return { error: error.message }

  revalidatePath('/dashboard/documents')
  return { success: true }
}

export async function deleteDocument(id: string) {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) return { error: 'Unauthorized' }

  const { error } = await supabase.from('documents').delete().eq('id', id).eq('teacher_id', userData.user.id)
  if (error) return { error: error.message }

  revalidatePath('/dashboard/documents')
  return { success: true }
}
