'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { BookOpen, AlertCircle } from 'lucide-react'
import { login } from './actions'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(event.currentTarget)

    try {
      const response = await login(formData)
      if (response?.error) {
        setError(response.error)
      } else if (response?.success && response?.redirectTo) {
        router.push(response.redirectTo)
      }
    } catch (err) {
      console.error(err)
      setError('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <Image
        src="/login-background.jpg"
        alt=""
        fill
        priority
        quality={100}
        sizes="100vw"
        className="object-cover object-center"
      />
      <div className="absolute inset-0 bg-black/10" />

      <div className="relative z-10 min-h-screen grid lg:grid-cols-2">

      {/* Left Panel */}
      <div className="hidden lg:flex flex-col justify-between p-10 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/70 via-slate-950/25 to-transparent" />

        <div className="relative z-20 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
            <BookOpen className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight">Sistem Guru</span>
        </div>

        <div className="relative z-20 space-y-6">
          <div className="space-y-2">
            <h2 className="text-4xl font-bold leading-tight">
              Satu Guru,<br />Satu Dashboard,<br />Semua Administrasi.
            </h2>
            <p className="text-zinc-300 text-lg">
              Kelola kelas, absensi, jurnal, penilaian, dan dokumen Anda dalam satu aplikasi terintegrasi.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Absensi Cepat", desc: "Hadir semua dalam 1 klik" },
              { label: "Jurnal Digital", desc: "Catat setiap pertemuan" },
              { label: "Rekap Otomatis", desc: "Nilai & absensi dihitung otomatis" },
              { label: "Dokumen Terpusat", desc: "Semua file di satu tempat" },
            ].map(f => (
              <div key={f.label} className="rounded-xl bg-white/10 backdrop-blur p-4 border border-white/10">
                <p className="font-semibold text-sm">{f.label}</p>
                <p className="text-xs text-zinc-300 mt-0.5">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-20 text-xs text-zinc-500">
          © 2026 Sistem Guru. Dibuat untuk kemudahan guru Indonesia.
        </p>
      </div>

      {/* Right Panel — Login only */}
      <div className="relative z-10 flex items-center justify-center p-6 sm:p-8">
        <div className="absolute inset-0 bg-transparent" />
        <div className="relative mx-auto w-full max-w-sm space-y-6 rounded-2xl border border-white/50 bg-white/88 p-6 shadow-2xl backdrop-blur-md sm:p-8">
          {/* Mobile logo */}
          <div className="flex items-center justify-center gap-2 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
              <BookOpen className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold">Sistem Guru</span>
          </div>

          <div className="space-y-2 text-center lg:text-left">
            <h1 className="text-2xl font-bold">Masuk ke Akun</h1>
            <p className="text-muted-foreground text-sm">
              Masukkan email dan password untuk mengakses dashboard.
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                placeholder="guru@sekolah.com"
                type="email"
                autoComplete="email"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
              />
            </div>
            <Button type="submit" className="w-full h-11" disabled={loading}>
              {loading ? 'Memproses...' : 'Masuk'}
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground">
            Belum punya akun? Hubungi administrator sekolah Anda.
          </p>
        </div>
      </div>
    </div>
  </div>
  )
}
