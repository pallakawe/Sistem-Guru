'use server'

import { createClient } from "@/lib/supabase/server"

export async function getArchiveData(yearId?: string) {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) return { error: "Unauthorized" }

  const teacherId = userData.user.id

  const { data: years, error: yearsError } = await supabase
    .from("academic_years")
    .select("id, name, semester, is_active, created_at")
    .eq("teacher_id", teacherId)
    .order("created_at", { ascending: false })

  if (yearsError) return { error: yearsError.message }
  if (!years || years.length === 0) {
    return {
      years: [],
      selectedYear: null,
      classes: [],
      students: [],
      journals: [],
      attendance: [],
      assessments: [],
      devices: [],
    }
  }

  const selectedYear = yearId
    ? years.find((year) => year.id === yearId)
    : years[0]

  if (!selectedYear) return { error: "Tahun ajaran tidak ditemukan." }

  const [
    classesRes,
    journalsRes,
    attendanceRes,
    assessmentsRes,
    devicesRes,
  ] = await Promise.all([
    supabase
      .from("classes")
      .select("id, name, grade_level, homeroom_teacher, students(count)")
      .eq("teacher_id", teacherId)
      .eq("academic_year_id", selectedYear.id)
      .order("name"),
    supabase
      .from("teaching_journals")
      .select(`
        id, topic, learning_objectives, method, created_at,
        meetings!inner (
          id, meeting_number, date, academic_year_id,
          classes (id, name),
          subjects (id, name)
        )
      `)
      .eq("teacher_id", teacherId)
      .eq("meetings.academic_year_id", selectedYear.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("daily_attendance")
      .select("id, attendance_date, class_id, classes(name), daily_attendance_records(status)")
      .eq("teacher_id", teacherId)
      .eq("academic_year_id", selectedYear.id)
      .order("attendance_date", { ascending: false }),
    supabase
      .from("assessments")
      .select("id, title, type, weight, created_at, classes(name), subjects(name), assessment_scores(count)")
      .eq("teacher_id", teacherId)
      .eq("academic_year_id", selectedYear.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("learning_devices")
      .select("id, title, category, file_url, file_name, created_at, subjects(name)")
      .eq("teacher_id", teacherId)
      .eq("academic_year_id", selectedYear.id)
      .order("created_at", { ascending: false }),
  ])

  const firstError =
    classesRes.error ||
    journalsRes.error ||
    attendanceRes.error ||
    assessmentsRes.error ||
    devicesRes.error

  if (firstError) return { error: firstError.message }

  const classIds = (classesRes.data || []).map((item: any) => item.id)
  let students: any[] = []

  if (classIds.length > 0) {
    const { data, error } = await supabase
      .from("students")
      .select("id, full_name, nis, nisn, gender, class_id, classes(name), is_active")
      .eq("teacher_id", teacherId)
      .in("class_id", classIds)
      .order("full_name")

    if (error) return { error: error.message }
    students = data || []
  }

  const attendance = (attendanceRes.data || []).map((item: any) => {
    const counts = { H: 0, S: 0, I: 0, A: 0 }
    ;(item.daily_attendance_records || []).forEach((record: any) => {
      if (record.status in counts) {
        counts[record.status as keyof typeof counts] += 1
      }
    })

    return {
      ...item,
      counts,
      total: (item.daily_attendance_records || []).length,
    }
  })

  return {
    years,
    selectedYear,
    classes: classesRes.data || [],
    students,
    journals: journalsRes.data || [],
    attendance,
    assessments: assessmentsRes.data || [],
    devices: devicesRes.data || [],
  }
}
