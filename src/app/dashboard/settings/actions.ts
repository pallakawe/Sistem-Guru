'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getProfileData() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) return { error: 'Unauthorized' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, nip, nuptk, phone, subject_specialty, avatar_url, birth_place, birth_date, address, gender, religion, marital_status, social_media, education_level, education_institution, education_major, graduation_year, previous_school, teaching_years, position, hobbies, favorite_activity, favorite_drink, active_academic_year_id, school_id')
    .eq('id', userData.user.id)
    .single()

  const [{ data: academicYears }, { data: subjects }] = await Promise.all([
    supabase
      .from('academic_years')
      .select('id, name, semester, is_active')
      .eq('teacher_id', userData.user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('subjects')
      .select('id, name, code')
      .eq('teacher_id', userData.user.id)
      .order('name', { ascending: true }),
  ])

  let school = null
  if (profile?.school_id) {
    const { data } = await supabase
      .from('schools')
      .select('id, name, address, principal_name, principal_nip')
      .eq('id', profile.school_id)
      .eq('teacher_id', userData.user.id)
      .maybeSingle()
    school = data
  }

  return {
    profile: profile || {},
    academicYears: academicYears || [],
    subjects: subjects || [],
    school: school || {},
    userEmail: userData.user.email || ''
  }
}

export async function saveProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) return { error: 'Unauthorized' }

  const { error } = await supabase.from('profiles').update({
    full_name: formData.get('fullName') as string,
    nip: formData.get('nip') as string,
    nuptk: formData.get('nuptk') as string,
    phone: String(formData.get('phone') || '').trim() || null,
    subject_specialty: String(formData.get('subjectSpecialty') || '').trim() || null,
    birth_place: String(formData.get('birthPlace') || '').trim() || null,
    birth_date: String(formData.get('birthDate') || '').trim() || null,
    address: String(formData.get('address') || '').trim() || null,
    gender: String(formData.get('gender') || '').trim() || null,
    religion: String(formData.get('religion') || '').trim() || null,
    marital_status: String(formData.get('maritalStatus') || '').trim() || null,
    social_media: String(formData.get('socialMedia') || '').trim() || null,
    education_level: String(formData.get('educationLevel') || '').trim() || null,
    education_institution: String(formData.get('educationInstitution') || '').trim() || null,
    education_major: String(formData.get('educationMajor') || '').trim() || null,
    graduation_year: Number(formData.get('graduationYear') || 0) || null,
    previous_school: String(formData.get('previousSchool') || '').trim() || null,
    teaching_years: Number(formData.get('teachingYears') || 0) || null,
    position: String(formData.get('position') || '').trim() || null,
    hobbies: String(formData.get('hobbies') || '').trim() || null,
    favorite_activity: String(formData.get('favoriteActivity') || '').trim() || null,
    favorite_drink: String(formData.get('favoriteDrink') || '').trim() || null,
  }).eq('id', userData.user.id)

  if (error) return { error: error.message }
  revalidatePath('/dashboard/settings')
  return { success: true }
}

export async function saveSchool(formData: FormData) {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) return { error: 'Unauthorized' }

  const schoolName = String(formData.get('schoolName') || '').trim()
  const schoolAddress = String(formData.get('schoolAddress') || '').trim()
  const principalName = String(formData.get('principalName') || '').trim()
  const principalNip = String(formData.get('principalNip') || '').trim()
  const existingSchoolId = String(formData.get('schoolId') || '').trim()

  if (!schoolName) return { error: 'Nama sekolah wajib diisi.' }

  if (existingSchoolId) {
    const { error } = await supabase
      .from('schools')
      .update({ name: schoolName, address: schoolAddress, principal_name: principalName || null, principal_nip: principalNip || null })
      .eq('id', existingSchoolId)
      .eq('teacher_id', userData.user.id)

    if (error) return { error: error.message }
  } else {
    const { data: school, error } = await supabase
      .from('schools')
      .insert({
        name: schoolName,
        address: schoolAddress,
        principal_name: principalName || null,
        principal_nip: principalNip || null,
        teacher_id: userData.user.id,
      })
      .select('id')
      .single()

    if (error) return { error: error.message }

    const { error: profileError } = await supabase
      .from('profiles')
      .update({ school_id: school.id })
      .eq('id', userData.user.id)

    if (profileError) return { error: profileError.message }
  }

  revalidatePath('/dashboard/settings')
  return { success: true }
}

export async function saveAcademicYear(formData: FormData) {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) return { error: 'Unauthorized' }

  const academicYearId = String(formData.get('academicYearId') || '').trim()
  const yearName = String(formData.get('yearName') || '').trim()
  const semester = String(formData.get('semester') || '').trim()

  if (academicYearId) {
    const { data: selectedYear, error: selectedError } = await supabase
      .from('academic_years')
      .select('id')
      .eq('id', academicYearId)
      .eq('teacher_id', userData.user.id)
      .maybeSingle()

    if (selectedError) return { error: selectedError.message }
    if (!selectedYear) return { error: 'Tahun ajaran tidak valid.' }

    const { error: deactivateError } = await supabase
      .from('academic_years')
      .update({ is_active: false })
      .eq('teacher_id', userData.user.id)
    if (deactivateError) return { error: deactivateError.message }

    const { error: activateError } = await supabase
      .from('academic_years')
      .update({ is_active: true })
      .eq('id', academicYearId)
      .eq('teacher_id', userData.user.id)
    if (activateError) return { error: activateError.message }

    const { error: profileError } = await supabase
      .from('profiles')
      .update({ active_academic_year_id: academicYearId })
      .eq('id', userData.user.id)
    if (profileError) return { error: profileError.message }
  } else if (yearName && semester) {
    if (!['Ganjil', 'Genap'].includes(semester)) return { error: 'Semester tidak valid.' }

    const { data: newYear, error: insertError } = await supabase
      .from('academic_years')
      .insert({
        name: yearName,
        semester,
        is_active: false,
        teacher_id: userData.user.id
      })
      .select('id')
      .single()

    if (insertError) return { error: insertError.message }

    const { error: deactivateError } = await supabase
      .from('academic_years')
      .update({ is_active: false })
      .eq('teacher_id', userData.user.id)
      .neq('id', newYear.id)

    if (deactivateError) {
      await supabase.from('academic_years').delete().eq('id', newYear.id).eq('teacher_id', userData.user.id)
      return { error: deactivateError.message }
    }

    const { error: activateError } = await supabase
      .from('academic_years')
      .update({ is_active: true })
      .eq('id', newYear.id)
      .eq('teacher_id', userData.user.id)

    if (activateError) return { error: activateError.message }

    const { error: profileError } = await supabase
      .from('profiles')
      .update({ active_academic_year_id: newYear.id })
      .eq('id', userData.user.id)

    if (profileError) return { error: profileError.message }
  } else {
    return { error: 'Pilih atau buat tahun ajaran terlebih dahulu.' }
  }

  revalidatePath('/dashboard/settings')
  revalidatePath('/dashboard')
  return { success: true }
}


export async function addSubject(formData: FormData) {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) return { error: 'Unauthorized' }

  const name = String(formData.get('subjectName') || '').trim()
  const code = String(formData.get('subjectCode') || '').trim()

  if (!name) return { error: 'Nama mata pelajaran wajib diisi.' }

  const { data: existing, error: existingError } = await supabase
    .from('subjects')
    .select('id')
    .eq('teacher_id', userData.user.id)
    .ilike('name', name)
    .maybeSingle()

  if (existingError) return { error: existingError.message }
  if (existing) return { error: 'Mata pelajaran dengan nama tersebut sudah ada.' }

  const { error } = await supabase.from('subjects').insert({
    name,
    code: code || null,
    teacher_id: userData.user.id,
  })

  if (error) return { error: error.message }

  revalidatePath('/dashboard/settings')
  revalidatePath('/dashboard/schedules')
  revalidatePath('/dashboard/journals')
  revalidatePath('/dashboard/assessments')
  revalidatePath('/dashboard/materials')
  return { success: true }
}

export async function deleteSubject(subjectId: string) {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) return { error: 'Unauthorized' }

  const relatedTables = ['schedules', 'meetings', 'assessments', 'learning_materials'] as const

  for (const table of relatedTables) {
    const { count, error } = await supabase
      .from(table)
      .select('id', { count: 'exact', head: true })
      .eq('subject_id', subjectId)
      .eq('teacher_id', userData.user.id)

    if (error) return { error: error.message }
    if ((count || 0) > 0) {
      return { error: 'Mata pelajaran sudah dipakai pada data pembelajaran sehingga tidak dapat dihapus.' }
    }
  }

  const { data, error } = await supabase
    .from('subjects')
    .delete()
    .eq('id', subjectId)
    .eq('teacher_id', userData.user.id)
    .select('id')
    .maybeSingle()

  if (error) return { error: error.message }
  if (!data) return { error: 'Mata pelajaran tidak ditemukan.' }

  revalidatePath('/dashboard/settings')
  revalidatePath('/dashboard/schedules')
  revalidatePath('/dashboard/journals')
  revalidatePath('/dashboard/assessments')
  revalidatePath('/dashboard/materials')
  return { success: true }
}
