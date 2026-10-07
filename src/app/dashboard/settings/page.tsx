import { getProfileData } from "./actions"
import SettingsClient from "./settings-client"

export default async function SettingsPage() {
  const data = await getProfileData()

  if ('error' in data && data.error) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold tracking-tight">Pengaturan</h1>
        <div className="bg-red-50 text-red-500 p-4 rounded-lg">Gagal memuat data: {data.error}</div>
      </div>
    )
  }

  return (
    <SettingsClient
      profile={data.profile}
      school={data.school}
      academicYears={data.academicYears}
      userEmail={data.userEmail}
    />
  )
}
