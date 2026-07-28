import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function getCurrentUser() {
  const isDevToolsEnabled = process.env.NEXT_PUBLIC_ENABLE_DEV_TOOLS === 'true';
  const cookieStore = await cookies();
  const impersonatedUserId = cookieStore.get('dev_impersonate_user_id')?.value;

  // 1. Check Dev Impersonation
  if (isDevToolsEnabled && impersonatedUserId) {
    const impersonatedUser = await prisma.user.findUnique({
      where: { id: impersonatedUserId }
    });
    if (impersonatedUser) {
      return impersonatedUser;
    }
  }

  const impersonatedRole = cookieStore.get('dev_impersonate_role')?.value;
  if (isDevToolsEnabled && impersonatedRole) {
    return {
      id: 'mock-user-id',
      firstName: 'Mock',
      lastName: impersonatedRole,
      email: `mock_${impersonatedRole.toLowerCase()}@example.com`,
      role: impersonatedRole,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  // 2. Fallback to real auth
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (authUser) {
    const dbUser = await prisma.user.findUnique({
      where: { id: authUser.id }
    });
    if (dbUser) return dbUser;
  }

  // Fallback for development if no one is logged in and no impersonation
  // In a real app this would return null, but for this CRM demo we might want a fallback
  return null;
}
