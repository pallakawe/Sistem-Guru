import { getLearningDevices } from "./actions"
import LearningDevicesClient from "./learning-devices-client"

export default async function LearningDevicesPage() {
  const { data: devices, error } = await getLearningDevices()

  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold tracking-tight">Perangkat Pembelajaran</h1>
        <div className="bg-red-50 text-red-500 p-4 rounded-lg">Gagal memuat data: {error}</div>
      </div>
    )
  }

  return <LearningDevicesClient initialDevices={devices || []} />
}
