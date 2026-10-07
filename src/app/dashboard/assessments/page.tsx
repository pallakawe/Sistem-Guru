import { getAssessmentsData } from "./actions"
import AssessmentsClient from "./assessments-client"

export default async function AssessmentsPage() {
  const result = await getAssessmentsData()

  if ('error' in result && result.error) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold tracking-tight">Penilaian</h1>
        <div className="bg-red-50 text-red-500 p-4 rounded-lg">Gagal memuat data: {result.error}</div>
      </div>
    )
  }

  return (
    <AssessmentsClient
      assessments={result.assessments || []}
      classes={result.classes || []}
      subjects={result.subjects || []}
    />
  )
}
