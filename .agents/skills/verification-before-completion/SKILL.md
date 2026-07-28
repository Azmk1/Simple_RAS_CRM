---
name: verification-before-completion
description: >
  Use when about to tell the user a bug is fixed, a feature is complete, or to "refresh the page."
  Requires confirming the build compiles and the specific symptom is resolved before making any success claim.
---

# Verification Before Completion

## The Iron Law

```
NO SUCCESS CLAIMS WITHOUT FRESH EVIDENCE.
```

**"Refresh and it should work" without verifying the build is a lie, not a shortcut.**

---

## The Gate: Before Saying "It's Fixed" or "Refresh Now"

Run through this checklist mentally before ending the response:

### Step 1 — Did the build compile?
Check the terminal output. Look for:
- `✓ Compiled` or similar success message
- **Zero** TypeScript errors
- **Zero** parsing errors

If there's a build error you haven't resolved yet → **do not claim it's fixed**.

### Step 2 — Is the logic provably correct?
Trace the data path in your head:
1. Does the DB query `include` the relation? ✓/✗
2. Is the relation accessed as the correct type (object vs array)? ✓/✗
3. Does the server action call `revalidatePath` with a broad enough scope? ✓/✗
4. Will the component receive the updated value as a prop? ✓/✗

If you can't say ✓ to all four → **add a server-side debug log first**.

### Step 3 — Is the fix minimal?
- Did you change more than one thing at once?
- If yes: you don't actually know which change fixed it. This is a problem.

### Step 4 — Only then, tell the user
Acceptable claim format:
> "The build compiled cleanly. [Specific change] fixes [specific root cause]. Refresh to see it."

Not acceptable:
> "This should work now, try refreshing."
> "I made a few changes, let me know if it works."

---

## Common Premature Claims to Avoid

| Premature | Evidence-Based Alternative |
|---|---|
| "Try refreshing the page" | "The build compiled. The fix addresses X because [evidence]." |
| "This should fix it" | "I traced the data flow — the root cause was X, fixed by Y." |
| "It's done!" | Confirm build + logic trace first |
| "The changes are live" | Confirm dev server compiled the file |

---

## For TypeScript Build Errors Specifically

Run a mental check: does the file you edited have:
- All JSX elements properly closed?
- All IIFE patterns closed with `()}`?
- All template literals closed?
- No `any` type that masks a real type mismatch?

If uncertain → the correct response is "let me verify the build" not "it should work."
