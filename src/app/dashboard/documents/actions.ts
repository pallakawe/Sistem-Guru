'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

function storagePathFromPublicUrl(url: string | null) {
  if (!url) return null
  const marker = '/storage/v1/object/public/documents/'
  const index = url.indexOf(marker)
  return index >= 0 ? decodeURIComponent(url.slice(index + marker.length)) : null
}

export async function getDocuments() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) return { error: 'Unauthorized' }

  const { data, error } = await supabase.from('documents')
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

  const title = String(formData.get('title') || '').trim()
  const category = String(formData.get('category') || '').trim()
  const file = formData.get('file')

  if (!title || !category) return { error: 'Judul dan kategori wajib diisi.' }
  if (!(file instanceof File) || file.size === 0) return { error: 'File dokumen wajib dipilih.' }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-')
  const filePath = `${userData.user.id}/documents/${Date.now()}-${safeName}`

  const { error: uploadError } = await supabase.storage.from('documents').upload(filePath, file, { upsert: false })
  if (uploadError) return { error: `Upload gagal: ${uploadError.message}` }

  const { data: urlData } = supabase.storage.from('documents').getPublicUrl(filePath)
  const { error } = await supabase.from('documents').insert({
    title, category, file_url: urlData.publicUrl, file_name: file.name, teacher_id: userData.user.id
  })

  if (error) {
    await supabase.storage.from('documents').remove([filePath])
    return { error: error.message }
  }

  revalidatePath('/dashboard/documents')
  return { success: true }
}

export async function deleteDocument(id: string) {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) return { error: 'Unauthorized' }

  const { data: document, error: readError } = await supabase.from('documents')
    .select('id, file_url').eq('id', id).eq('teacher_id', userData.user.id).maybeSingle()

  if (readError) return { error: readError.message }
  if (!document) return { error: 'Dokumen tidak ditemukan.' }

  const storagePath = storagePathFromPublicUrl(document.file_url)
  if (storagePath) {
    const { error: storageError } = await supabase.storage.from('documents').remove([storagePath])
    if (storageError) return { error: `Gagal menghapus file: ${storageError.message}` }
  }

  const { error } = await supabase.from('documents').delete().eq('id', id).eq('teacher_id', userData.user.id)
  if (error) return { error: error.message }

  revalidatePath('/dashboard/documents')
  return { success: true }
}
