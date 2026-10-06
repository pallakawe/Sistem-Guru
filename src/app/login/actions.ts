'use server'

import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email dan password wajib diisi.' }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    if (error.message.includes('Invalid login credentials')) {
      return { error: 'Email atau password salah. Silakan coba lagi.' }
    }
    return { error: error.message }
  }

  return { success: true, redirectTo: '/dashboard' }
}

export async function signup(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string

  if (!email || !password || !fullName) {
    return { error: 'Semua field wajib diisi.' }
  }

  if (password.length < 6) {
    return { error: 'Password minimal 6 karakter.' }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  })

  if (error) {
    if (error.message.includes('User already registered')) {
      return { error: 'Email ini sudah terdaftar. Silakan masuk.' }
    }
    return { error: error.message }
  }

  return { success: true, redirectTo: '/dashboard' }
}
