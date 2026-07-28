import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true }
  });

  if (!dbUser) {
    redirect('/login?error=account_not_configured');
  }

  switch (dbUser.role) {
    case 'OPS_DIRECTOR':
    case 'CEO':
      redirect('/ops');
    case 'INTAKE_PA_COORDINATOR':
      redirect('/portal-case');
    case 'CASE_COORDINATOR':
      redirect('/case');
    case 'CLINICAL_SUPPORT':
    case 'CLINICAL_DIRECTOR':
    case 'BCBA':
      redirect('/portal-clinical');
    case 'BILLING':
      redirect('/portal-billing');
    default:
      redirect('/login?error=invalid_role');
  }
}
