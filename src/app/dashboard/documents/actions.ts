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

  const teacherId = userData.user.id
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('active_academic_year_id')
    .eq('id', teacherId)
    .single()

  if (profileError) return { error: profileError.message }
  const activeYearId = profile?.active_academic_year_id || null

  const manualQuery = supabase
    .from('documents')
    .select('id, title, category, file_url, file_name, created_at, academic_year_id')
    .eq('teacher_id', teacherId)
    .order('created_at', { ascending: false })

  const devicesQuery = supabase
    .from('learning_devices')
    .select('id, title, category, file_url, file_name, created_at, academic_year_id, subjects(name)')
    .eq('teacher_id', teacherId)
    .order('created_at', { ascending: false })

  const materialsQuery = supabase
    .from('learning_materials')
    .select('id, title, file_url, file_type, created_at, academic_year_id, classes(name), subjects(name)')
    .eq('teacher_id', teacherId)
    .order('created_at', { ascending: false })

  const journalsQuery = supabase
    .from('teaching_journals')
    .select(`
      id, topic, created_at,
      meetings!inner (
        date, academic_year_id,
        classes(name),
        subjects(name)
      )
    `)
    .eq('teacher_id', teacherId)
    .order('created_at', { ascending: false })

  const assessmentsQuery = supabase
    .from('assessments')
    .select('id, title, type, created_at, academic_year_id, classes(name), subjects(name), assessment_scores(count)')
    .eq('teacher_id', teacherId)
    .order('created_at', { ascending: false })

  const attendanceQuery = supabase
    .from('daily_attendance')
    .select('id, attendance_date, academic_year_id, class_id, classes(name)')
    .eq('teacher_id', teacherId)
    .order('attendance_date', { ascending: false })

  if (activeYearId) {
    manualQuery.eq('academic_year_id', activeYearId)
    devicesQuery.eq('academic_year_id', activeYearId)
    journalsQuery.eq('meetings.academic_year_id', activeYearId)
    assessmentsQuery.eq('academic_year_id', activeYearId)
    materialsQuery.eq('academic_year_id', activeYearId)
    attendanceQuery.eq('academic_year_id', activeYearId)
  }

  const [manualRes, devicesRes, materialsRes, journalsRes, assessmentsRes, attendanceRes] = await Promise.all([
    manualQuery,
    devicesQuery,
    materialsQuery,
    journalsQuery,
    assessmentsQuery,
    attendanceQuery,
  ])

  const firstError =
    manualRes.error ||
    devicesRes.error ||
    materialsRes.error ||
    journalsRes.error ||
    assessmentsRes.error ||
    attendanceRes.error

  if (firstError) return { error: firstError.message }

  const manual = (manualRes.data || []).map((item: any) => ({
    ...item,
    source: 'Manual',
    source_url: null,
    readonly: false,
    description: 'Dokumen yang diunggah langsung.',
  }))

  const devices = (devicesRes.data || []).map((item: any) => ({
    id: `device-${item.id}`,
    source_id: item.id,
    title: item.title,
    category: 'Perangkat Pembelajaran',
    file_url: item.file_url,
    file_name: item.file_name,
    created_at: item.created_at,
    source: 'Perangkat Pembelajaran',
    source_url: '/dashboard/learning-devices',
    readonly: true,
    description: [item.subjects?.name, item.category].filter(Boolean).join(' · '),
  }))

  const materials = (materialsRes.data || []).map((item: any) => ({
      id: `material-${item.id}`,
      source_id: item.id,
      title: item.title,
      category: 'Bahan Ajar',
      file_url: item.file_url,
      file_name: item.file_type || null,
      created_at: item.created_at,
      source: 'Bahan Ajar',
      source_url: '/dashboard/materials',
      readonly: true,
      description: [item.classes?.name, item.subjects?.name, item.file_type].filter(Boolean).join(' · '),
    }))

  const journals = (journalsRes.data || []).map((item: any) => ({
    id: `journal-${item.id}`,
    source_id: item.id,
    title: `Jurnal - ${item.topic}`,
    category: 'Jurnal Mengajar',
    file_url: null,
    file_name: null,
    created_at: item.meetings?.date || item.created_at,
    source: 'Jurnal Mengajar',
    source_url: '/dashboard/journals',
    readonly: true,
    description: [item.meetings?.classes?.name, item.meetings?.subjects?.name].filter(Boolean).join(' · '),
  }))

  const assessments = (assessmentsRes.data || []).map((item: any) => ({
    id: `assessment-${item.id}`,
    source_id: item.id,
    title: `Penilaian - ${item.title}`,
    category: 'Penilaian',
    file_url: null,
    file_name: null,
    created_at: item.created_at,
    source: 'Penilaian',
    source_url: '/dashboard/assessments',
    readonly: true,
    description: [
      item.classes?.name,
      item.subjects?.name,
      item.type,
      `${(item.assessment_scores as any[])?.[0]?.count || 0} nilai siswa`,
    ].filter(Boolean).join(' · '),
  }))

  const monthlyAttendance = new Map<string, any>()
  ;(attendanceRes.data || []).forEach((item: any) => {
    const month = String(item.attendance_date).slice(0, 7)
    const key = `${item.class_id}-${month}`
    const existing = monthlyAttendance.get(key)
    if (existing) {
      existing.days += 1
      if (item.attendance_date > existing.created_at) existing.created_at = item.attendance_date
    } else {
      const [year, monthNumber] = month.split('-').map(Number)
      const monthLabel = new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' })
        .format(new Date(year, monthNumber - 1, 1))

      monthlyAttendance.set(key, {
        id: `attendance-${key}`,
        title: `Rekap Absensi - ${item.classes?.name || 'Kelas'} - ${monthLabel}`,
        category: 'Daftar Hadir',
        file_url: null,
        file_name: null,
        created_at: item.attendance_date,
        source: 'Absensi',
        source_url: '/dashboard/attendance',
        readonly: true,
        description: `${item.classes?.name || 'Kelas'} · 1 hari absensi tersimpan`,
        days: 1,
      })
    }
  })

  const attendance = Array.from(monthlyAttendance.values()).map((item: any) => ({
    ...item,
    description: item.description.replace('1 hari absensi tersimpan', `${item.days} hari absensi tersimpan`),
  }))

  const data = [
    ...manual,
    ...devices,
    ...materials,
    ...journals,
    ...assessments,
    ...attendance,
  ].sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  return { data }
}

export async function createDocument(formData: FormData) {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) return { error: 'Unauthorized' }

  const { data: profile } = await supabase.from('profiles')
    .select('active_academic_year_id')
    .eq('id', userData.user.id)
    .single()
  if (!profile?.active_academic_year_id) return { error: 'Tahun ajaran aktif belum diatur.' }

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
    title, category, file_url: urlData.publicUrl, file_name: file.name,
    academic_year_id: profile.active_academic_year_id, teacher_id: userData.user.id
  })

  if (error) {
    await supabase.storage.from('documents').remove([filePath])
    return { error: error.message }
  }

  revalidatePath('/dashboard/documents')
  revalidatePath('/dashboard/archive')
  return { success: true }
}

export async function deleteDocument(id: string) {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) return { error: 'Unauthorized' }

  const { data: profile } = await supabase.from('profiles')
    .select('active_academic_year_id')
    .eq('id', userData.user.id)
    .single()
  if (!profile?.active_academic_year_id) return { error: 'Tahun ajaran aktif belum diatur.' }

  const { data: document, error: readError } = await supabase.from('documents')
    .select('id, file_url').eq('id', id).eq('teacher_id', userData.user.id)
    .eq('academic_year_id', profile.active_academic_year_id).maybeSingle()

  if (readError) return { error: readError.message }
  if (!document) return { error: 'Dokumen tidak ditemukan.' }

  const storagePath = storagePathFromPublicUrl(document.file_url)
  if (storagePath) {
    const { error: storageError } = await supabase.storage.from('documents').remove([storagePath])
    if (storageError) return { error: `Gagal menghapus file: ${storageError.message}` }
  }

  const { error } = await supabase.from('documents').delete().eq('id', id)
    .eq('teacher_id', userData.user.id)
    .eq('academic_year_id', profile.active_academic_year_id)
  if (error) return { error: error.message }

  revalidatePath('/dashboard/documents')
  revalidatePath('/dashboard/archive')
  return { success: true }
}

export async function updateDocument(id: string, formData: FormData) {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) return { error: 'Unauthorized' }

  const { data: profile } = await supabase.from('profiles')
    .select('active_academic_year_id')
    .eq('id', userData.user.id)
    .single()
  if (!profile?.active_academic_year_id) return { error: 'Tahun ajaran aktif belum diatur.' }

  const title = String(formData.get('title') || '').trim()
  const category = String(formData.get('category') || '').trim()
  if (!title || !category) return { error: 'Judul dan kategori wajib diisi.' }

  const { data, error } = await supabase.from('documents')
    .update({ title, category })
    .eq('id', id)
    .eq('teacher_id', userData.user.id)
    .eq('academic_year_id', profile.active_academic_year_id)
    .select('id')
    .maybeSingle()

  if (error) return { error: error.message }
  if (!data) return { error: 'Dokumen tidak ditemukan.' }

  revalidatePath('/dashboard/documents')
  revalidatePath('/dashboard/archive')
  return { success: true }
}
