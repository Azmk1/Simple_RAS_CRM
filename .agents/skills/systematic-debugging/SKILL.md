---
name: systematic-debugging
description: >
  Use when encountering ANY bug, unexpected behavior, build error, or "it still doesn't work"
  response from the user — before attempting any fix. Mandatory for all technical issues.
---

# Systematic Debugging

## The Iron Law

```
NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST.
```

**Applying a fix before confirming root cause is failure, not progress.**

This was proven in this codebase: `client.intakePacket[0]` returned `undefined` silently for 30+ minutes because we kept applying fixes to symptoms instead of tracing the data flow. A single server-side log in `page.tsx` cracked it immediately.

---

## Phase 1: Gather Evidence BEFORE Writing Any Code

### For Next.js UI/Data bugs:

1. **Add a server-side log in the Server Component** (`page.tsx`, NOT a `'use client'` file):
   ```typescript
   // TEMP DEBUG
   console.log('==DEBUG==', JSON.stringify({
     clientStatus: model.status,
     relationField: model.someRelation,     // Is it null? Is it an object or array?
     nestedField: model.relation?.field,
   }, null, 2));
   ```
   Read the output in the **terminal** where `npm run dev` is running (not the browser console — Turbopack may cache it).

2. **Verify the Prisma `include`** in the query:
   ```typescript
   // BAD — relation will always be undefined
   const client = await prisma.client.findUnique({ where: { id } });
   
   // GOOD — relation is fetched
   const client = await prisma.client.findUnique({
     where: { id },
     include: { intakePacket: true }
   });
   ```

3. **Check relation cardinality in `prisma/schema.prisma`**:
   - `IntakePacket?` → one-to-one → access as `client.intakePacket` (object or null)
   - `Session[]` → one-to-many → access as `client.sessions` (array)
   - **NEVER use `[0]` on a one-to-one relation** — it silently returns `undefined`

4. **Check `revalidatePath` scope** in server actions:
   ```typescript
   // Too narrow — misses layout-level caches
   revalidatePath('/client/[id]', 'page');
   
   // Broad — use this when data changes affect multiple routes
   revalidatePath('/', 'layout');
   ```

### For build/compile errors:

1. Read the full error message and stack trace. Note the **exact file and line number**.
2. Run `npx tsc --noEmit` to get the full TypeScript error list.
3. Check if a recent edit introduced an unclosed JSX tag or missing parenthesis (most common cause).

### For "still not working" after a fix:

1. **Hard refresh** in browser: `Ctrl+Shift+R`
2. Check the terminal for a fresh compile log — does it show the file was recompiled?
3. If yes and still broken: the logic fix is wrong. Add more evidence.
4. If no: Turbopack didn't pick up the change. Touch the file or restart `npm run dev`.

---

## Phase 2: State Your Root Cause Hypothesis

Before writing any fix, state clearly:

> "I think the root cause is **[X]** because **[evidence Y from Phase 1]**."

If you can't fill in both blanks with specifics, go back to Phase 1.

---

## Phase 3: Fix at the Source, Not the Symptom

- Fix the **origin** of the bad value, not where it crashes.
- Make the **smallest possible change** that addresses root cause.
- Do NOT apply multiple changes at once — you won't know which one fixed it.

---

## Phase 4: Verify the Fix

Before claiming success:
1. Confirm the dev server compiled without errors.
2. Hard refresh the page.
3. Confirm the specific symptom is gone.
4. Remove all `// TEMP DEBUG` console.logs.

---

## Common Root Causes in This Project

| Symptom | Most Likely Root Cause |
|---|---|
| Relation field is `undefined` | Missing `include` in Prisma query |
| `[0]` returns `undefined` | One-to-one relation accessed as array |
| UI doesn't update after server action | `revalidatePath` scope too narrow |
| Client-side log shows stale value | Turbopack cache — add server-side log instead |
| Build error "Expected a semicolon" | Unclosed JSX fragment or IIFE |
| Page still shows old data after refresh | `revalidatePath` not called in the action |
