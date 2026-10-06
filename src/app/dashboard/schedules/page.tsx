import { getSchedules, getFormData } from "./actions"
import SchedulesClient from "./schedules-client"

export default async function SchedulesPage() {
  const [{ data: initialSchedules, error }, formData] = await Promise.all([
    getSchedules(),
    getFormData()
  ])

  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold tracking-tight">Jadwal Mengajar</h1>
        <div className="bg-red-50 text-red-500 p-4 rounded-lg">
          Gagal memuat jadwal: {error}
        </div>
      </div>
    )
  }

  return (
    <SchedulesClient 
      initialSchedules={initialSchedules || []} 
      classes={formData.classes}
      subjects={formData.subjects}
    />
  )
}
