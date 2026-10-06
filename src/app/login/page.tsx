'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { BookOpen } from 'lucide-react'
import { login, signup } from './actions'
import { useToast } from '@/hooks/use-toast'

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)

    const formData = new FormData(event.currentTarget)
    
    try {
      const response = isLogin ? await login(formData) : await signup(formData)
      if (response?.error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: response.error,
        })
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between bg-zinc-900 p-10 text-white dark:border-r relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <BookOpen className="mr-2 h-6 w-6" />
          Sistem Guru
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              &ldquo;Satu Guru, Satu Dashboard, Semua Administrasi. Mengubah cara Anda mengelola kelas dan pembelajaran dengan lebih efisien.&rdquo;
            </p>
            <footer className="text-sm">Tim Sistem Guru</footer>
          </blockquote>
        </div>
      </div>
      <div className="p-8 flex items-center justify-center">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              {isLogin ? 'Selamat Datang' : 'Buat Akun Baru'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isLogin ? 'Masukkan email dan password Anda untuk masuk' : 'Lengkapi data di bawah ini untuk mendaftar'}
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Nama Lengkap</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  placeholder="Budi Santoso, S.Pd"
                  type="text"
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
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                {isLogin && (
                  <a href="#" className="text-sm text-muted-foreground hover:text-primary">
                    Lupa password?
                  </a>
                )}
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Memproses...' : isLogin ? 'Masuk' : 'Daftar'}
            </Button>
          </form>

          <div className="text-center text-sm">
            {isLogin ? (
              <>
                Belum punya akun?{' '}
                <button
                  type="button"
                  className="underline underline-offset-4 hover:text-primary"
                  onClick={() => setIsLogin(false)}
                >
                  Daftar di sini
                </button>
              </>
            ) : (
              <>
                Sudah punya akun?{' '}
                <button
                  type="button"
                  className="underline underline-offset-4 hover:text-primary"
                  onClick={() => setIsLogin(true)}
                >
                  Masuk di sini
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
