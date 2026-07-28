---
name: intake-workflow-map
description: >
  Use when touching any code related to client intake status, magic link flow, FlowMap, 
  intake packet, document approval/rejection, IntakeDocumentsTab, or ContinuousIntakeForm.
  Read before writing any status logic, transitions, or UI badge conditions.
---

# Intake Workflow Map

This is the authoritative state machine for the client intake pipeline in Simple RAS CRM.
Read this before writing any status logic, badge conditions, or status transitions.

---

## Client Status (`ClientStatus` enum)

```
INQUIRY → MAGIC_LINK_SENT → DOCS_SUBMITTED → DOCS_APPROVED_INTAKE
       → CLINICAL_REVIEW_APPROVED → VOB_COMPLETED → PA_SUBMITTED
       → PA_APPROVED → ACTIVE → DISCHARGED
```

| Status | Who sets it | Trigger |
|---|---|---|
| `INQUIRY` | System (default) | Client created in CRM |
| `MAGIC_LINK_SENT` | `generateMagicLink()` action | Magic link generated for parent |
| `DOCS_SUBMITTED` | `submitIntakePacket()` action | Parent completes & submits all forms |
| `DOCS_APPROVED_INTAKE` | `sendToClinical()` action | Intake coordinator approves all docs |
| `CLINICAL_REVIEW_APPROVED` | Clinical team action | BCBA approves medical necessity |
| `VOB_COMPLETED` | Billing action | Verification of Benefits done |
| `PA_SUBMITTED` | Billing action | Prior Authorization submitted to payer |
| `PA_APPROVED` | Billing action | PA approved by payer |
| `ACTIVE` | Case coordinator | Client is receiving services |
| `DISCHARGED` | Case coordinator | Client discharged |

---

## Intake Packet Status (`IntakePacketStatus` enum)

```
PENDING_CLIENT_SUBMISSION ⇄ SUBMITTED → APPROVED
                          ↓
              REJECTED_BY_INTAKE
              REJECTED_BY_CLINICAL
```

| Status | Meaning | Who sets it |
|---|---|---|
| `PENDING_CLIENT_SUBMISSION` | Client has not yet submitted, OR changes were requested | Default / `rejectDocument()` / `rejectFormFieldsBulk()` |
| `SUBMITTED` | Client submitted all forms; admin review pending | `submitIntakePacket()` |
| `APPROVED` | Intake approved all documents | `sendToClinical()` |
| `REJECTED_BY_INTAKE` | (Legacy — use `PENDING_CLIENT_SUBMISSION` + `rejectionDetails`) | — |
| `REJECTED_BY_CLINICAL` | Clinical team rejected | Clinical action |

---

## Key Relationship

```
Client (one-to-one) → IntakePacket
```

**Critical:** `client.intakePacket` is a **single object** (nullable), NOT an array.  
- ✅ `client.intakePacket?.status`  
- ❌ `client.intakePacket?.[0]?.status` — always `undefined`

---

## UI Badge Logic

### Master Pipeline (FlowMap)

| Condition | effectiveStatus | Node Label Override |
|---|---|---|
| `packet.status === 'PENDING_CLIENT_SUBMISSION'` | `MAGIC_LINK_SENT` (Node 1) | "Changes Needed" (if has rejections or DOCS_SUBMITTED) |
| `packet.status === 'SUBMITTED'` and `client.status === 'DOCS_SUBMITTED'` | `DOCS_SUBMITTED` (Node 2) | "Review Needed" |
| `client.status === 'DOCS_APPROVED_INTAKE'` | `DOCS_APPROVED_INTAKE` (Node 3) | — |

### Individual Form/Document Row Badge

| Condition | Badge | Color |
|---|---|---|
| `rejectionDetails[key]` exists | CHANGES NEEDED | 🔴 Red |
| `isComplete && !isForm` | APPROVED | 🟢 Green |
| `isComplete && isForm` | REVIEW NEEDED | 🟠 Orange |
| `isUploaded` | REVIEW NEEDED | 🟠 Orange |
| `packet.status === 'PENDING_CLIENT_SUBMISSION'` and none of above | PENDING UPLOAD | ⚫ Gray |
| `isForm` and not started | NOT STARTED | ⚫ Gray |

### Card Title Badge (Client Submissions section)

| Condition | Badge | Color |
|---|---|---|
| `PENDING_CLIENT_SUBMISSION` + has rejections | CHANGES NEEDED | 🔴 Red |
| `SUBMITTED` | REVIEW NEEDED | 🟠 Orange |
| otherwise | raw status | ⚫ Gray |

---

## Rejection Flow

When the admin rejects a form field or document:

1. `rejectFormFieldsBulk()` or `rejectDocument()` in `portal-case/actions.ts`:
   - Sets `packet.status = 'PENDING_CLIENT_SUBMISSION'`
   - Adds to `packet.rejectionDetails` JSON: `{ fieldId: reason }` or `{ documentKey: reason }`
   - Clears the uploaded URL from `formData` (so client re-uploads)
   - Does NOT change `client.status` — it stays `DOCS_SUBMITTED`

2. Client sees "CHANGES NEEDED" on magic link page
   - Badge is determined by checking `rejectionDetails` in `InitialBlock.tsx`

3. Client re-submits (`submitIntakePacket()`):
   - Sets `packet.status = 'SUBMITTED'`
   - Sets `packet.rejectionDetails = {}`
   - Sets `client.status = 'DOCS_SUBMITTED'`

4. Admin sees "REVIEW NEEDED" — FlowMap returns to Node 2

---

## Document Keys

| Document | DB Field | `rejectionDetails` Key |
|---|---|---|
| Insurance Card (Front) | `insuranceCardFrontUploaded` | `insuranceCardFrontUploaded` |
| Insurance Card (Back) | `insuranceCardBackUploaded` | `insuranceCardBackUploaded` |
| Medicaid Card (Front) | `medicaidCardFrontUploaded` | `medicaidCardFrontUploaded` |
| Medicaid Card (Back) | `medicaidCardBackUploaded` | `medicaidCardBackUploaded` |
| Diagnostic Eval | `diagnosticEvalUploaded` | `diagnosticEvalUploaded` |
| Physician Rx | `physicianRxUploaded` | `physicianRxUploaded` |
| IEP | `iepUploaded` | `iepUploaded` |
| Custody Docs | `custodyDocsUploaded` | `custodyDocsUploaded` |
| Prior ABA Records | `priorAbaRecordsUploaded` | `priorAbaRecordsUploaded` |

Form field rejections use `formField_${fieldId}` as the key.

---

## Magic Link Flow

```
Admin generates link → client.status = MAGIC_LINK_SENT
                     → IntakePacket created with PENDING_CLIENT_SUBMISSION

Parent opens link → ContinuousIntakeForm renders
                 → Shows Form01 (client intake) + Form02 (consent) + DocumentUploads

Parent submits → submitIntakePacket() called
              → packet.status = SUBMITTED
              → client.status = DOCS_SUBMITTED
              → rejectionDetails = {}

Admin reviews → Approves/rejects each document and form field
              → On reject: packet.status = PENDING_CLIENT_SUBMISSION

Parent re-submits → cycle repeats until all approved

Admin clicks "Approve & Send to Clinical" → client.status = DOCS_APPROVED_INTAKE
                                          → packet.status = APPROVED
```

---

## Key Files

| File | Purpose |
|---|---|
| `src/app/(dashboard)/client/[id]/page.tsx` | Server page — fetches `client` with `intakePacket` |
| `src/components/client-profile/FlowMap.tsx` | Pipeline visualization — reads packet status |
| `src/components/client-profile/tabs/IntakeDocumentsTab.tsx` | Admin review UI |
| `src/app/(dashboard)/portal-case/actions.ts` | All admin-side actions (approve, reject, generate link) |
| `src/app/actions/intake.ts` | Client-side submission actions |
| `src/app/magic-link/actions.ts` | Magic link page actions |
| `src/components/magic-link/ContinuousIntakeForm.tsx` | Parent-facing form |
| `src/components/magic-link/InitialBlock.tsx` | First screen on magic link — shows status |
