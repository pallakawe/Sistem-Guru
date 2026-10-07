'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getProfileData() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) return { error: 'Unauthorized' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, nip, nuptk, phone, subject_specialty, active_academic_year_id')
    .eq('id', userData.user.id)
    .single()

  const { data: academicYears } = await supabase
    .from('academic_years')
    .select('id, name, semester, is_active')
    .eq('teacher_id', userData.user.id)
    .order('created_at', { ascending: false })

  const { data: school } = await supabase
    .from('schools')
    .select('id, name, address')
    .limit(1)
    .single()

  return {
    profile: profile || {},
    academicYears: academicYears || [],
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
    phone: formData.get('phone') as string,
    subject_specialty: formData.get('subjectSpecialty') as string,
  }).eq('id', userData.user.id)

  if (error) return { error: error.message }
  revalidatePath('/dashboard/settings')
  return { success: true }
}

export async function saveSchool(formData: FormData) {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) return { error: 'Unauthorized' }

  const schoolName = formData.get('schoolName') as string
  const schoolAddress = formData.get('schoolAddress') as string
  const existingSchoolId = formData.get('schoolId') as string

  if (existingSchoolId) {
    const { error } = await supabase.from('schools').update({ name: schoolName, address: schoolAddress }).eq('id', existingSchoolId)
    if (error) return { error: error.message }
  } else {
    const { data: school } = await supabase.from('schools').insert({ name: schoolName, address: schoolAddress }).select('id').single()
    if (school) {
      await supabase.from('profiles').update({ school_id: school.id }).eq('id', userData.user.id)
    }
  }

  revalidatePath('/dashboard/settings')
  return { success: true }
}

export async function saveAcademicYear(formData: FormData) {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) return { error: 'Unauthorized' }

  const academicYearId = formData.get('academicYearId') as string
  const yearName = formData.get('yearName') as string
  const semester = formData.get('semester') as string

  if (academicYearId) {
    // Set selected year as active
    await supabase.from('academic_years').update({ is_active: false }).eq('teacher_id', userData.user.id)
    await supabase.from('academic_years').update({ is_active: true }).eq('id', academicYearId)
    await supabase.from('profiles').update({ active_academic_year_id: academicYearId }).eq('id', userData.user.id)
  } else if (yearName && semester) {
    // Create new academic year
    const { data: newYear } = await supabase.from('academic_years').insert({
      name: yearName, semester, is_active: true, teacher_id: userData.user.id
    }).select('id').single()
    if (newYear) {
      await supabase.from('profiles').update({ active_academic_year_id: newYear.id }).eq('id', userData.user.id)
    }
  }

  revalidatePath('/dashboard/settings')
  return { success: true }
}
