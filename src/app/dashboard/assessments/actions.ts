'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function getActiveYearAndUser() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) return { supabase, user: null, activeYearId: null }

  const { data: profile } = await supabase
    .from('profiles')
    .select('active_academic_year_id')
    .eq('id', userData.user.id)
    .single()

  return { supabase, user: userData.user, activeYearId: profile?.active_academic_year_id || null }
}

export async function getAssessmentsData() {
  const { supabase, user, activeYearId } = await getActiveYearAndUser()
  if (!user) return { error: 'Unauthorized' }

  const classesQuery = supabase
    .from('classes')
    .select('id, name')
    .eq('teacher_id', user.id)
    .order('name')

  if (activeYearId) classesQuery.eq('academic_year_id', activeYearId)

  const assessmentsQuery = supabase
    .from('assessments')
    .select('id, title, type, weight, classes(id, name), subjects(id, name)')
    .eq('teacher_id', user.id)
    .order('created_at', { ascending: false })

  if (activeYearId) assessmentsQuery.eq('academic_year_id', activeYearId)

  const [classesRes, subjectsRes, assessmentsRes] = await Promise.all([
    classesQuery,
    supabase.from('subjects').select('id, name').eq('teacher_id', user.id).order('name'),
    assessmentsQuery,
  ])

  const error = classesRes.error || subjectsRes.error || assessmentsRes.error
  if (error) return { error: error.message }

  return {
    assessments: assessmentsRes.data || [],
    classes: classesRes.data || [],
    subjects: subjectsRes.data || [],
    activeYearId,
  }
}

export async function getAssessmentScores(assessmentId: string) {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) return { error: 'Unauthorized' }

  const { data: assessment, error: assessmentError } = await supabase
    .from('assessments')
    .select('id, class_id, classes(name), subjects(name)')
    .eq('id', assessmentId)
    .eq('teacher_id', userData.user.id)
    .maybeSingle()

  if (assessmentError) return { error: assessmentError.message }
  if (!assessment) return { error: 'Komponen nilai tidak ditemukan.' }

  const [studentsRes, scoresRes] = await Promise.all([
    supabase
      .from('students')
      .select('id, full_name, student_number')
      .eq('class_id', assessment.class_id)
      .eq('teacher_id', userData.user.id)
      .eq('is_active', true)
      .order('student_number', { ascending: true, nullsFirst: false })
      .order('full_name'),
    supabase.from('assessment_scores').select('student_id, score, feedback').eq('assessment_id', assessmentId),
  ])

  const error = studentsRes.error || scoresRes.error
  if (error) return { error: error.message }

  return { students: studentsRes.data || [], scores: scoresRes.data || [], assessment }
}

export async function createAssessment(formData: FormData) {
  const { supabase, user, activeYearId } = await getActiveYearAndUser()
  if (!user) return { error: 'Unauthorized' }
  if (!activeYearId) return { error: 'Tahun ajaran aktif belum diatur.' }

  const title = String(formData.get('title') || '').trim()
  const type = String(formData.get('type') || '').trim()
  const classId = String(formData.get('classId') || '').trim()
  const subjectId = String(formData.get('subjectId') || '').trim()
  const weight = Number(formData.get('weight') || 0)

  if (!title || !type || !classId || !subjectId) return { error: 'Semua field wajib diisi.' }
  if (!Number.isFinite(weight) || weight < 0 || weight > 100) return { error: 'Bobot harus 0 sampai 100.' }

  const [{ data: ownedClass }, { data: ownedSubject }] = await Promise.all([
    supabase.from('classes').select('id').eq('id', classId).eq('teacher_id', user.id).eq('academic_year_id', activeYearId).maybeSingle(),
    supabase.from('subjects').select('id').eq('id', subjectId).eq('teacher_id', user.id).maybeSingle(),
  ])

  if (!ownedClass || !ownedSubject) return { error: 'Kelas atau mata pelajaran tidak valid.' }

  const { error } = await supabase.from('assessments').insert({
    title, type, weight, class_id: classId, subject_id: subjectId,
    academic_year_id: activeYearId, teacher_id: user.id
  })
  if (error) return { error: error.message }

  revalidatePath('/dashboard/assessments')
  return { success: true }
}

export async function saveScores(assessmentId: string, scores: { student_id: string, score: number }[]) {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) return { error: 'Unauthorized' }

  const { data: assessment, error: assessmentError } = await supabase
    .from('assessments')
    .select('id, class_id')
    .eq('id', assessmentId)
    .eq('teacher_id', userData.user.id)
    .maybeSingle()

  if (assessmentError) return { error: assessmentError.message }
  if (!assessment) return { error: 'Komponen nilai tidak ditemukan.' }

  if (scores.some((item) => !Number.isFinite(item.score) || item.score < 0 || item.score > 100)) {
    return { error: 'Nilai harus 0 sampai 100.' }
  }

  const studentIds = [...new Set(scores.map((item) => item.student_id))]
  if (studentIds.length === 0) return { success: true }

  const { data: allowedStudents, error: studentsError } = await supabase
    .from('students')
    .select('id')
    .in('id', studentIds)
    .eq('class_id', assessment.class_id)
    .eq('teacher_id', userData.user.id)

  if (studentsError) return { error: studentsError.message }
  if ((allowedStudents || []).length !== studentIds.length) {
    return { error: 'Terdapat siswa yang tidak terdaftar pada kelas ini.' }
  }

  const { error } = await supabase.from('assessment_scores').upsert(
    scores.map((item) => ({ assessment_id: assessmentId, student_id: item.student_id, score: item.score })),
    { onConflict: 'assessment_id,student_id' }
  )

  if (error) return { error: error.message }

  revalidatePath('/dashboard/assessments')
  return { success: true }
}
