'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getAssessmentsData() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) return { error: 'Unauthorized' }

  const { data: profile } = await supabase.from('profiles').select('active_academic_year_id').eq('id', userData.user.id).single()

  const [classesRes, subjectsRes] = await Promise.all([
    supabase.from('classes').select('id, name').eq('teacher_id', userData.user.id),
    supabase.from('subjects').select('id, name').eq('teacher_id', userData.user.id)
  ])

  const { data: assessments } = await supabase
    .from('assessments')
    .select('id, title, type, weight, classes(id, name), subjects(id, name)')
    .eq('teacher_id', userData.user.id)
    .order('created_at', { ascending: false })

  return {
    assessments: assessments || [],
    classes: classesRes.data || [],
    subjects: subjectsRes.data || [],
    activeYearId: profile?.active_academic_year_id || null
  }
}

export async function getAssessmentScores(assessmentId: string) {
  const supabase = await createClient()

  const { data: assessment } = await supabase
    .from('assessments')
    .select('class_id, classes(name), subjects(name)')
    .eq('id', assessmentId)
    .single()

  if (!assessment) return { error: 'Assessment not found' }

  const [studentsRes, scoresRes] = await Promise.all([
    supabase.from('students').select('id, full_name, student_number').eq('class_id', assessment.class_id).eq('is_active', true).order('full_name'),
    supabase.from('assessment_scores').select('student_id, score, feedback').eq('assessment_id', assessmentId)
  ])

  return {
    students: studentsRes.data || [],
    scores: scoresRes.data || [],
    assessment
  }
}

export async function createAssessment(formData: FormData) {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) return { error: 'Unauthorized' }

  const { data: profile } = await supabase.from('profiles').select('active_academic_year_id').eq('id', userData.user.id).single()
  if (!profile?.active_academic_year_id) return { error: 'Tahun ajaran aktif belum diatur.' }

  const title = formData.get('title') as string
  const type = formData.get('type') as string
  const classId = formData.get('classId') as string
  const subjectId = formData.get('subjectId') as string
  const weight = parseFloat(formData.get('weight') as string) || 0

  if (!title || !type || !classId || !subjectId) return { error: 'Semua field wajib diisi.' }

  const { error } = await supabase.from('assessments').insert({
    title, type, weight, class_id: classId, subject_id: subjectId,
    academic_year_id: profile.active_academic_year_id, teacher_id: userData.user.id
  })
  if (error) return { error: error.message }

  revalidatePath('/dashboard/assessments')
  return { success: true }
}

export async function saveScores(assessmentId: string, scores: { student_id: string, score: number }[]) {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) return { error: 'Unauthorized' }

  // Upsert scores
  for (const s of scores) {
    await supabase.from('assessment_scores').upsert({
      assessment_id: assessmentId, student_id: s.student_id, score: s.score
    }, { onConflict: 'assessment_id,student_id' })
  }

  revalidatePath('/dashboard/assessments')
  return { success: true }
}
