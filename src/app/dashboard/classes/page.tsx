import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default function ClassesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kelas & Siswa</h1>
          <p className="text-muted-foreground">
            Kelola data kelas dan siswa yang Anda ajar.
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Tambah Kelas
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Dummy Class Card 1 */}
        <Card className="hover:shadow-md transition-all cursor-pointer">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">X RPL 1</CardTitle>
            <div className="text-sm text-muted-foreground">Wali Kelas: Budi Santoso, S.Pd</div>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mt-4">
              <Badge variant="secondary">36 Siswa</Badge>
              <Button variant="outline" size="sm">Lihat Siswa</Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Dummy Class Card 2 */}
        <Card className="hover:shadow-md transition-all cursor-pointer">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">XI RPL 2</CardTitle>
            <div className="text-sm text-muted-foreground">Wali Kelas: Siti Aminah, M.Kom</div>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mt-4">
              <Badge variant="secondary">32 Siswa</Badge>
              <Button variant="outline" size="sm">Lihat Siswa</Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Daftar Semua Siswa</h2>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>NIS/NISN</TableHead>
                <TableHead>Nama Lengkap</TableHead>
                <TableHead>L/P</TableHead>
                <TableHead>Kelas</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">1001 / 0012345678</TableCell>
                <TableCell>Andi Prasetyo</TableCell>
                <TableCell>L</TableCell>
                <TableCell>X RPL 1</TableCell>
                <TableCell><Badge>Aktif</Badge></TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">Edit</Button>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">1002 / 0012345679</TableCell>
                <TableCell>Bunga Lestari</TableCell>
                <TableCell>P</TableCell>
                <TableCell>X RPL 1</TableCell>
                <TableCell><Badge>Aktif</Badge></TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">Edit</Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
