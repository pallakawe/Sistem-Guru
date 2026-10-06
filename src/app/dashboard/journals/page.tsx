import { getJournals, getFormData } from "./actions"
import JournalsClient from "./journals-client"

export default async function JournalsPage() {
  const [{ data: initialJournals, error }, formData] = await Promise.all([
    getJournals(),
    getFormData()
  ])

  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold tracking-tight">Jurnal Mengajar</h1>
        <div className="bg-red-50 text-red-500 p-4 rounded-lg">
          Gagal memuat jurnal: {error}
        </div>
      </div>
    )
  }

  return (
    <JournalsClient 
      initialJournals={initialJournals || []} 
      classes={formData.classes}
      subjects={formData.subjects}
    />
  )
}
