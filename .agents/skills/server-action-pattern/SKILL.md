---
name: server-action-pattern
description: >
  Use when creating or modifying any Next.js Server Action ('use server' file or function).
  Enforces the standard try/catch, revalidation, and error-return pattern for this project.
---

# Server Action Pattern

## Standard Template

Every server action in this project MUST follow this pattern:

```typescript
'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function doSomething(id: string, data: SomeType) {
  try {
    const result = await prisma.model.update({
      where: { id },
      data: { ...data }
    });

    // Revalidate relevant pages
    revalidatePath('/', 'layout');           // Broad — use when multiple pages change
    revalidatePath(`/client/${id}`);         // Specific — use in addition to broad

    return { success: true, data: result };
  } catch (error) {
    // HIPAA: Never log sensitive user data (PII/PHI) to console
    console.error('Action failed [doSomething]:', error instanceof Error ? error.message : 'Unknown error');
    return { success: false, error: 'Operation failed. Please try again.' };
  }
}
```

---

## Rules

### 1. Always wrap in try/catch
No bare `await prisma.*` calls. Every DB operation must be caught.

### 2. Never log PII or PHI
```typescript
// ❌ WRONG — logs patient data
console.error('Failed to update client:', client);

// ✅ RIGHT — logs only the technical error
console.error('Failed to update client [updateClient]:', error instanceof Error ? error.message : error);
```

### 3. Return a structured object, not void
```typescript
// ❌ WRONG — caller can't know if it failed
export async function deletePacket(id: string) {
  await prisma.intakePacket.delete({ where: { id } });
}

// ✅ RIGHT
export async function deletePacket(id: string) {
  try {
    await prisma.intakePacket.delete({ where: { id } });
    return { success: true };
  } catch (error) {
    console.error('deletePacket failed:', error instanceof Error ? error.message : error);
    return { success: false, error: 'Failed to delete packet.' };
  }
}
```

### 4. revalidatePath scope

Use the correct scope based on what data changed:

| Change Type | Scope to Use |
|---|---|
| Client status, intake packet | `revalidatePath('/', 'layout')` |
| Single client page | `revalidatePath(\`/client/${clientId}\`)` |
| Magic link page | `revalidatePath('/magic-link/[id]', 'page')` |
| Pipeline list page | `revalidatePath('/portal-case/clients')` |
| Multiple pages affected | Both `'/'` layout + specific path |

**Default safe choice:** `revalidatePath('/', 'layout')` — broader but always correct.

### 5. For form actions using `useFormState` / `useActionState`

```typescript
export async function createClient(prevState: any, formData: FormData) {
  try {
    const firstName = String(formData.get('firstName'));
    if (!firstName) return { error: 'First name is required.' };

    const client = await prisma.client.create({ data: { firstName, ... } });
    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error) {
    console.error('createClient failed:', error instanceof Error ? error.message : error);
    return { error: 'Failed to create client.' };
  }
}
```

---

## File Locations

| Purpose | File |
|---|---|
| Intake & magic link actions | `src/app/actions/intake.ts` |
| Portal/pipeline actions | `src/app/(dashboard)/portal-case/actions.ts` |
| Magic link public actions | `src/app/magic-link/actions.ts` |
| Upload API | `src/app/api/upload/route.ts` |

Place new actions in the file that matches their domain. Create a new file only if the domain is clearly distinct.
