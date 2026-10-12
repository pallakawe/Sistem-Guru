import { getArchiveData } from "./actions"
import ArchiveClient from "./archive-client"

export default async function ArchivePage() {
  const data = await getArchiveData()

  if ("error" in data && data.error) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold tracking-tight">Arsip Tahun Ajaran</h1>
        <div className="rounded-xl bg-red-50 p-4 text-red-600 dark:bg-red-950/20 dark:text-red-400">
          Gagal memuat arsip: {data.error}
        </div>
      </div>
    )
  }

  return <ArchiveClient initialData={data} />
}
