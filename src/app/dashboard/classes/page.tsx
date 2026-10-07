import { getClasses } from "./actions"
import ClassesClient from "./classes-client"

export default async function ClassesPage() {
  const { data: classes, error } = await getClasses()

  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold tracking-tight">Kelas & Siswa</h1>
        <div className="bg-red-50 text-red-500 p-4 rounded-lg">Gagal memuat data: {error}</div>
      </div>
    )
  }

  return <ClassesClient initialClasses={classes || []} />
}
