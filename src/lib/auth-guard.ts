import { Role } from '@/generated/prisma/client';
import { getCurrentUser } from '@/lib/auth';

export async function requireRole(allowedRoles: Role[]) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('UNAUTHORIZED: Authentication required.');
  }

  if (!allowedRoles.includes(user.role as Role)) {
    throw new Error(`FORBIDDEN: Role '${user.role}' is not authorized to access this resource.`);
  }

  return user;
}

export function sanitizePhiData<T extends Record<string, any>>(data: T): Partial<T> {
  const sanitized = { ...data };
  
  // Strip out sensitive PHI fields when sending to Zero-PHI environments
  delete sanitized.medicaidId;
  delete sanitized.memberId;
  delete sanitized.guardianPhone;
  delete sanitized.guardianEmail;
  delete sanitized.parentAddress;
  delete sanitized.treatmentPlan;
  delete sanitized.intakePacket;
  
  return sanitized;
}
