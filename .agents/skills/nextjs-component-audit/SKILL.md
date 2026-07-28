---
name: nextjs-component-audit
description: >
  Trigger when a Next.js component is not displaying the right data, a UI change
  is not taking effect after a code change, or when trying to understand why data
  from a server action or database is not reaching a component correctly.
---

# Skill: Next.js Component Data Flow Audit

Use this skill to systematically audit why a component is not receiving or displaying the correct data. Work through these checks in order — stop when you find the issue.

## The Data Flow in This App

```
Database (Supabase/PostgreSQL)
  → Prisma query in Server Component (page.tsx)
    → Props passed to Client Components ('use client')
      → Rendered in the browser
```

Each arrow is a potential break point.

---

## Check 1 — Is the data being fetched at all?

Find the **Server Component** for the page (e.g., `src/app/(dashboard)/client/[id]/page.tsx`).

Confirm it has a `prisma.model.findUnique/findMany()` call and that it `include`s all needed relations:

```typescript
const client = await prisma.client.findUnique({
  where: { id: params.id },
  include: {
    intakePacket: true,   // ← required for anything that reads the packet
    paRequests: true,
  }
});
```

If the `include` is missing, add it. **This is the #1 cause of `undefined` relation bugs.**

---

## Check 2 — Are props being passed down correctly?

Trace the prop from the server component to the component displaying the data:

```
page.tsx → ClientProfileTabs (client={client}) → IntakeDocumentsTab (client={client})
```

Open each intermediate component and verify `client` (or whatever prop) is being passed through. A missing prop at any level silently breaks everything downstream.

---

## Check 3 — Is the component reading the right field?

Verify the field name matches the schema exactly:
- Schema: `intakePacket IntakePacket?` → access as `client.intakePacket` (NOT `client.intakePacket[0]`)
- Schema: `sessions Session[]` → access as `client.sessions`

Run a quick grep to confirm usage:
```bash
grep -n "intakePacket" src/components/path/to/Component.tsx
```

---

## Check 4 — Is a Server Action revalidating correctly?

After a server action updates data, Next.js needs to be told to re-fetch it. Check the action:

```typescript
// ✅ Correct — invalidates all pages under this layout
revalidatePath('/', 'layout');

// ⚠️ Too narrow — only works for one specific route
revalidatePath('/client/[id]', 'page');

// ❌ Wrong — dynamic segments need the 'page' type
revalidatePath(`/client/${clientId}`); // missing second arg
```

---

## Check 5 — Is Turbopack caching a stale component?

Symptoms: Code was updated but the browser still shows old behavior.

Fixes (in order of effort):
1. **Hard refresh** in browser: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
2. **Add a React `key` prop** to force remount:
   ```tsx
   <SomeComponent key={`component-${someValue}`} ... />
   ```
3. **Stop and restart** `npm run dev`

> [!IMPORTANT]
> Client-side `console.log` inside `'use client'` components may be cached by Turbopack.
> Always add debug logs to a **Server Component** (`page.tsx`) for reliable output.

---

## Check 6 — Server Action vs. Server Component confusion

- `'use server'` actions run on the server but are **triggered by the client**.
- `page.tsx` (no directive) runs **at request time** on the server.
- `'use client'` components run **in the browser** and receive props from the server.

If you're trying to read DB data inside a `'use client'` component directly — that's wrong. Data must flow from `page.tsx` → props → client component.

---

## Quick Diagnostic Checklist

- [ ] `include` present in Prisma query for all needed relations
- [ ] All props passed through every intermediate component
- [ ] Correct field access pattern (one-to-one vs array)
- [ ] Server action calls `revalidatePath` with broad enough scope
- [ ] Hard refresh tried
- [ ] Debug log added to **server component** (not client component)
