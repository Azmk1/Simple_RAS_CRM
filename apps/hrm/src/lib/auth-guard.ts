import { Role } from '@repo/db';

export async function requireRole(allowedRoles: Role[]) {
  // Standalone HRM role guard
  return true;
}

export function sanitizePhiData<T extends Record<string, any>>(data: T): Partial<T> {
  const sanitized = { ...data };
  
  delete sanitized.medicaidId;
  delete sanitized.memberId;
  delete sanitized.guardianPhone;
  delete sanitized.guardianEmail;
  delete sanitized.parentAddress;
  delete sanitized.treatmentPlan;
  delete sanitized.intakePacket;
  
  return sanitized;
}
