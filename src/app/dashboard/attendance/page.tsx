import { getAttendanceSetup } from "./actions"
import AttendanceClient from "./attendance-client"

export default async function AttendancePage() {
  const data = await getAttendanceSetup()

  if (data.error) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold tracking-tight">Absensi Siswa</h1>
        <div className="rounded-lg bg-red-50 p-4 text-red-500">
          Gagal memuat data absensi: {data.error}
        </div>
      </div>
    )
  }

  return <AttendanceClient classes={data.classes || []} />
}
