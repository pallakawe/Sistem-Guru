import { getDocuments } from "./actions"
import DocumentsClient from "./documents-client"

export default async function DocumentsPage() {
  const { data: docs, error } = await getDocuments()

  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold tracking-tight">Dokumen</h1>
        <div className="bg-red-50 text-red-500 p-4 rounded-lg">Gagal memuat data: {error}</div>
      </div>
    )
  }

  return <DocumentsClient initialDocs={docs || []} />
}
