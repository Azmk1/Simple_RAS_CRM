'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function setImpersonationCookie(userId: string | null, role: string | null = null) {
  if (process.env.NEXT_PUBLIC_ENABLE_DEV_TOOLS !== 'true') {
    return { success: false, error: 'Dev tools disabled' };
  }

  const cookieStore = await cookies();
  
  if (userId) {
    cookieStore.set('dev_impersonate_user_id', userId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    });
    cookieStore.delete('dev_impersonate_role');
  } else if (role) {
    cookieStore.set('dev_impersonate_role', role, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    });
    cookieStore.delete('dev_impersonate_user_id');
  } else {
    cookieStore.delete('dev_impersonate_user_id');
    cookieStore.delete('dev_impersonate_role');
  }

  revalidatePath('/', 'layout');
  return { success: true };
}
