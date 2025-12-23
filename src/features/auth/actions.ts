'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'

// Server Action para inicio de sesión
export async function login(formData: FormData) {
    const supabase = await createClient()

    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    }

    const { error } = await supabase.auth.signInWithPassword(data)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/', 'layout')
    redirect('/app')
}

// Server Action para registro de usuario
export async function signup(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const full_name = formData.get('full_name') as string

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name,
            },
            emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
        }
    })

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/', 'layout')
    // IMPORTANTE: Si "Confirm Email" está activo en Supabase, el usuario no tendrá sesión todavía.
    // Redirigimos a /app, pero lo ideal sería mostrar una pantalla de "Verifica tu email".
    redirect('/app')
}

// Server Action para recuperar contraseña
export async function forgotPassword(formData: FormData) {
    const supabase = await createClient()
    const email = formData.get('email') as string

    const { error } = await supabase.auth.resetPasswordForEmail(email)

    if (error) {
        return { error: error.message }
    }

    return { success: 'Check your email for the password reset link.' }
}

// Server Action para cerrar sesión
export async function signout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    revalidatePath('/', 'layout')
    redirect('/login')
}
