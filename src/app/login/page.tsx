'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { BookOpen, AlertCircle } from 'lucide-react'
import { login, signup } from './actions'

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(event.currentTarget)

    try {
      const response = isLogin ? await login(formData) : await signup(formData)
      if (response?.error) {
        setError(response.error)
      }
    } catch {
      setError('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Panel */}
      <div className="hidden lg:flex flex-col justify-between p-10 text-white relative overflow-hidden bg-zinc-900">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/30 via-purple-600/20 to-pink-600/20" />
        {/* Decorative blobs */}
        <div className="absolute top-20 right-20 w-72 h-72 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute bottom-20 left-10 w-64 h-64 rounded-full bg-purple-500/20 blur-3xl" />

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

      {/* Right Panel */}
      <div className="flex items-center justify-center p-8">
        <div className="mx-auto w-full max-w-sm space-y-6">
          {/* Mobile logo */}
          <div className="flex items-center justify-center gap-2 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
              <BookOpen className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold">Sistem Guru</span>
          </div>

          <div className="space-y-2 text-center lg:text-left">
            <h1 className="text-2xl font-bold">
              {isLogin ? 'Masuk ke Akun' : 'Buat Akun Baru'}
            </h1>
            <p className="text-muted-foreground text-sm">
              {isLogin
                ? 'Masukkan email dan password Anda untuk melanjutkan'
                : 'Daftarkan diri sebagai guru di Sistem Guru'}
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Nama Lengkap</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  placeholder="Budi Santoso, S.Pd"
                  type="text"
                  autoComplete="name"
                  required
                />
              </div>
            )}
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
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                {isLogin && (
                  <a href="#" className="text-xs text-muted-foreground hover:text-primary transition-colors">
                    Lupa password?
                  </a>
                )}
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                required
              />
            </div>
            <Button type="submit" className="w-full h-11" disabled={loading}>
              {loading
                ? (isLogin ? 'Memproses...' : 'Mendaftar...')
                : (isLogin ? 'Masuk' : 'Daftar Sekarang')}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            {isLogin ? (
              <>
                Belum punya akun?{' '}
                <button
                  type="button"
                  className="font-medium text-primary hover:underline underline-offset-4"
                  onClick={() => { setIsLogin(false); setError(null) }}
                >
                  Daftar di sini
                </button>
              </>
            ) : (
              <>
                Sudah punya akun?{' '}
                <button
                  type="button"
                  className="font-medium text-primary hover:underline underline-offset-4"
                  onClick={() => { setIsLogin(true); setError(null) }}
                >
                  Masuk di sini
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}
