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

## World-Class Ultra-Premium UI Directives (MANDATORY)
1. **Never Output Basic or Plain UIs:** Every dashboard, card, table, and portal must look like a top-tier modern SaaS application (Linear, Stripe, Vercel dark-mode style). Plain gray boxes, raw unstyled tables, or basic white cards are strictly prohibited.
2. **Glassmorphism & Radial Lighting:** Use deep multi-layered backgrounds (`bg-zinc-950/80`, `backdrop-blur-xl`), 1px translucent borders (`border-white/10 hover:border-brand-orange-500/50`), and subtle radial gradient glows.
3. **Rich Typography & Hierarchy:** Combine `font-heading` for titles, `font-mono` for metadata/timestamps/IDs, and high-contrast text (`text-white`, `text-zinc-400`).
4. **Micro-Interactions & Hover FX:** All interactive cards must feature smooth transitions (`transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl hover:border-brand-orange-500/40`).
5. **Vibrant Status Badges & Glows:** Use glowing live pulse dots (`.dot-live`), status badges with 10% opacity backgrounds and matching border outlines (e.g. `bg-green-500/10 text-green-400 border border-green-500/20`), and Lucide icons for visual clarity.
