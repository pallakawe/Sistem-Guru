import { getMeetings } from "./actions"
import AttendanceClient from "./attendance-client"

export default async function AttendancePage() {
  const { data: meetings, error } = await getMeetings()

  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold tracking-tight">Absensi Cepat</h1>
        <div className="bg-red-50 text-red-500 p-4 rounded-lg">
          Gagal memuat data pertemuan: {error}
        </div>
      </div>
    )
  }

  return (
    <AttendanceClient meetings={meetings || []} />
  )
}
