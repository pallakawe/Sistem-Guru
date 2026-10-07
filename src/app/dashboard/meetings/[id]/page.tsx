import Link from "next/link"
import { notFound } from "next/navigation"
import { format, parseISO } from "date-fns"
import { id as idLocale } from "date-fns/locale"
import { ArrowLeft, BookOpen, CheckSquare, FileText, GraduationCap } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default async function MeetingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) notFound()

  const { data: meeting, error } = await supabase
    .from("meetings")
    .select(`
      id, meeting_number, date,
      classes(id, name),
      subjects(id, name),
      attendance(id),
      teaching_journals(id, topic, learning_objectives, activities, method, notes, obstacles, follow_up)
    `)
    .eq("id", id)
    .eq("teacher_id", userData.user.id)
    .maybeSingle()

  if (error || !meeting) notFound()

  const [materialsRes, assessmentsRes] = await Promise.all([
    supabase
      .from("learning_materials")
      .select("id, title, file_type, file_url")
      .eq("meeting_id", id)
      .eq("teacher_id", userData.user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("assessments")
      .select("id, title, type, weight")
      .eq("class_id", (meeting.classes as any)?.id)
      .eq("teacher_id", userData.user.id)
      .order("created_at", { ascending: false }),
  ])

  const journal = (meeting.teaching_journals as any[])?.[0]
  const attendance = (meeting.attendance as any[])?.[0]
  const materials = materialsRes.data || []
  const assessments = assessmentsRes.data || []

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start gap-4">
        <Button variant="outline" size="icon" render={<Link href="/dashboard/journals" />}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Pertemuan {meeting.meeting_number} — {(meeting.classes as any)?.name || "Kelas"}
          </h1>
          <p className="text-muted-foreground">
            {(meeting.subjects as any)?.name || "Mata Pelajaran"} · {format(parseISO(meeting.date), "d MMMM yyyy", { locale: idLocale })}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-base"><CheckSquare className="h-4 w-4" /> Absensi</CardTitle></CardHeader>
          <CardContent>
            <Badge variant={attendance ? "default" : "secondary"}>{attendance ? "Siap diisi" : "Belum tersedia"}</Badge>
            <Button className="mt-4 w-full" variant="outline" render={<Link href="/dashboard/attendance" />}>Buka Absensi</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-base"><FileText className="h-4 w-4" /> Jurnal</CardTitle></CardHeader>
          <CardContent>
            <p className="line-clamp-2 text-sm text-muted-foreground">{journal?.topic || "Belum ada jurnal."}</p>
            <Button className="mt-4 w-full" variant="outline" render={<Link href="/dashboard/journals" />}>Buka Jurnal</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-base"><BookOpen className="h-4 w-4" /> Bahan Ajar</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{materials.length}</div>
            <p className="text-sm text-muted-foreground">materi terkait pertemuan</p>
            <Button className="mt-4 w-full" variant="outline" render={<Link href="/dashboard/materials" />}>Buka Bahan Ajar</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-base"><GraduationCap className="h-4 w-4" /> Penilaian</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assessments.length}</div>
            <p className="text-sm text-muted-foreground">komponen pada kelas ini</p>
            <Button className="mt-4 w-full" variant="outline" render={<Link href="/dashboard/assessments" />}>Buka Penilaian</Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Ringkasan Jurnal Pertemuan</CardTitle></CardHeader>
        <CardContent>
          {!journal ? (
            <p className="text-sm text-muted-foreground">Jurnal untuk pertemuan ini belum tersedia.</p>
          ) : (
            <div className="grid gap-4 text-sm">
              <div><p className="font-medium">Topik</p><p className="text-muted-foreground">{journal.topic}</p></div>
              {journal.learning_objectives && <div><p className="font-medium">Tujuan Pembelajaran</p><p className="whitespace-pre-wrap text-muted-foreground">{journal.learning_objectives}</p></div>}
              {journal.activities && <div><p className="font-medium">Kegiatan</p><p className="whitespace-pre-wrap text-muted-foreground">{journal.activities}</p></div>}
              {journal.method && <div><p className="font-medium">Metode</p><p className="text-muted-foreground">{journal.method}</p></div>}
              {journal.obstacles && <div><p className="font-medium">Kendala</p><p className="whitespace-pre-wrap text-muted-foreground">{journal.obstacles}</p></div>}
              {journal.follow_up && <div><p className="font-medium">Tindak Lanjut</p><p className="whitespace-pre-wrap text-muted-foreground">{journal.follow_up}</p></div>}
            </div>
          )}
        </CardContent>
      </Card>

      {materials.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Bahan Ajar Terkait</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {materials.map((material: any) => (
              <div key={material.id} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="font-medium">{material.title}</p>
                  <p className="text-xs text-muted-foreground">{material.file_type || "Materi"}</p>
                </div>
                {material.file_url && (
                  <Button variant="outline" size="sm" render={<a href={material.file_url} target="_blank" rel="noopener noreferrer" />}>Buka</Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
