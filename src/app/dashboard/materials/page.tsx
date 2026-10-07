import MaterialsClient from "./materials-client"
import { getMaterialsData } from "./actions"

export default async function MaterialsPage() {
  const data = await getMaterialsData()

  if ('error' in data && data.error) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold tracking-tight">Bahan Ajar</h1>
        <div className="rounded-lg bg-red-50 p-4 text-red-600">
          Gagal memuat bahan ajar: {data.error}
        </div>
      </div>
    )
  }

  return (
    <MaterialsClient
      initialMaterials={data.materials || []}
      classes={data.classes || []}
      subjects={data.subjects || []}
      meetings={data.meetings || []}
    />
  )
}
