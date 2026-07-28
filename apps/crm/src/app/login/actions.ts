'use server'

import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function login(prevState: any, formData: FormData) {
  const supabase = await createClient()

  // Use string conversion to handle FormData correctly
  const email = String(formData.get('email'))
  const password = String(formData.get('password'))

  if (!email || !password) {
    return { error: 'Email and password are required' }
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  if (data?.user?.id) {
    // 1. Fetch user role from Prisma using the Supabase auth UUID
    const user = await prisma.user.findUnique({
      where: { id: data.user.id },
      select: { role: true }
    })

    if (!user) {
      // User is authenticated in Supabase but missing from our database
      return { error: 'User account not configured in CRM database.' }
    }

    revalidatePath('/', 'layout')

    // 2. Role Router
    switch (user.role) {
      case 'OPS_DIRECTOR':
      case 'CEO':
        redirect('/ops')
      case 'INTAKE_PA_COORDINATOR':
        redirect('/portal-case')
      case 'CASE_COORDINATOR':
        redirect('/case')
      case 'CLINICAL_SUPPORT':
      case 'CLINICAL_DIRECTOR':
      case 'BCBA':
        redirect('/portal-clinical')
      case 'BILLING':
        redirect('/portal-billing')
      default:
        return { error: 'No dashboard assigned to your role.' }
    }
  }

  return { error: 'Unknown error occurred during login.' }
}
