# Teacher Requisition App

## Current State
Teachers and Authority users can submit requisitions. Admin Staff can mark requisitions as `completed`. Teachers and Authority can view their recent requisitions but have no way to acknowledge receipt.

## Requested Changes (Diff)

### Add
- New status: `#received` — Teacher/Authority confirms they received the fulfilled item
- New backend method: `markReceived(sessionId, id)` — only callable by the requisition's owner (Teacher or Authority) when status is `completed`. Creates a history entry with `#received` status.
- "Mark as Received" button in Teacher's Recent Requisitions (dashboard) and My Requisitions pages — visible only on `completed` status rows
- "Mark as Received" button in Authority's Recent Requisitions (dashboard) and All Requisitions pages — visible only on `completed` status rows (for their own submitted requisitions)
- Status badge for `received` (green/teal)
- Notification indicator on Admin Staff and Authority dashboards showing count of `received` requisitions

### Modify
- `Status` type: add `#received` variant
- `RequisitionTable`: add `received` action type
- `TeacherDashboard`: pass `received` action and handler to RequisitionTable
- `AuthorityDashboard`: pass `received` action and handler to RequisitionTable (for own requisitions in the All tab)
- `AdminDashboard`: add `received` stat card and show received requisitions
- DID files updated to include `received` in Status variant and `markReceived` method

### Remove
Nothing removed.

## Implementation Plan
1. Backend `main.mo`: Add `#received` to `Status` variant, add `markReceived` public func (validates owner + completed status, appends history entry)
2. `backend.did.js` + `backend.did.d.ts`: Add `received: IDL.Null` to Status variant, add `markReceived` method definition
3. `backend.d.ts`: Add `received` to Status type, add `markReceived` signature
4. `backend.ts`: Add `markReceived` method to Backend class
5. `types.ts`: Add `received` to Status type
6. `useQueries.ts`: Add `useMarkReceived` hook
7. `RequisitionTable.tsx`: Add `received` to action types and actionDefs
8. `StatusBadge.tsx`: Add `received` badge style
9. `TeacherDashboard.tsx`: Add `received` action + handler on both dashboard and requisitions views
10. `AuthorityDashboard.tsx`: Add `received` action + handler on dashboard and all requisitions views (only for own requisitions)
11. `AdminDashboard.tsx`: Add `received` stat card, show received count
