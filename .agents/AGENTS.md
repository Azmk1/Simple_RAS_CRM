# Workspace Agent Rules — Simple RAS CRM

## Prisma Relation Access (CRITICAL)

Before writing ANY code that reads a Prisma relation (e.g., `client.intakePacket`, `user.sessions`), you MUST verify its cardinality in `prisma/schema.prisma`:

- `Model?` or `Model` (no `[]`) → **one-to-one**: access as `client.intakePacket` (direct object, may be `null`)
- `Model[]` → **one-to-many**: access as `client.sessions[0]` or `.map()`

**Never** assume an array. **Never** use `[0]` on a one-to-one relation. The result is a silent `undefined` that causes cascading UI bugs and is extremely hard to trace.

### Enforcement Checklist
When writing code that touches a Prisma relation:
1. Open `prisma/schema.prisma` and find the field.
2. Check if it ends in `?`, `Model`, or `Model[]`.
3. Use the correct access pattern in your code.
4. If in doubt, add a server-side `console.log` in the **Server Component** (not a `'use client'` component) to verify the raw value before wiring up the UI.

## Button Cursors
When creating or modifying clickable elements (like <button>), always ensure they have the cursor-pointer class when active, and cursor-not-allowed when disabled. Do not leave the cursor as the default arrow when an element is interactive.
