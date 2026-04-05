# Teacher Requisition App

## Current State

- Four roles: Teacher, Authority, Admin Staff, Super Admin
- Teachers submit requisitions, selecting an Authority to assign to
- Authority sees only requisitions assigned to them; can approve or reject
- Admin Staff see all requisitions; can mark approved ones as completed or notFulfilled
- Notifications are frontend-only toast messages (no backend notification store)
- Requisition tuple has 14 fields (v4), last field is `assignedAuthorityEmail: ?Text`
- No `assignedAdminStaffEmail` field exists yet
- No `getAdminStaff` backend query exists
- No `assignAdminStaff` backend mutation exists

## Requested Changes (Diff)

### Add
- `assignedAdminStaffEmail: ?Text` as the 15th field (v5 tuple) on requisitions
- `getAdminStaff(sessionId)` backend query — returns all users with `#adminStaff` role; callable by any logged-in user
- `assignAdminStaff(sessionId, requisitionId, adminStaffEmail)` backend mutation — callable only by Authority role; stores `assignedAdminStaffEmail` on the requisition
- Data migration from all prior tuple versions (v1–v4) to v5, defaulting `assignedAdminStaffEmail` to `null`
- Backend notification store: `Notification` type with fields `(recipientEmail, requisitionId, message, createdAt, read: Bool)`; stable array `notifications`
- `getNotifications(sessionId)` query — returns unread notifications for the calling user
- `markNotificationsRead(sessionId)` update — marks all notifications for the calling user as read
- When `assignAdminStaff` is called, create a notification for the assigned admin staff email: "You have been assigned to requisition #ID: <itemName>"
- Authority Dashboard: "Assign Staff" action button on each requisition row (pending and all tabs); opens a modal/dropdown listing all admin staff users; submits the assignment
- Admin Dashboard: notification bell/badge in the header showing unread notification count; a notifications panel or toast on login/load showing new assignments
- `assignedAdminStaffEmail` visible in requisition detail modal for all roles

### Modify
- Requisition tuple upgraded from v4 (14 fields) to v5 (15 fields) with migration
- `RequisitionView` type in backend to include `assignedAdminStaffEmail: ?Text`
- `backend.d.ts`: add `assignedAdminStaffEmail` to `RequisitionView`, add `getAdminStaff`, `assignAdminStaff`, `getNotifications`, `markNotificationsRead` signatures
- `RequisitionModal.tsx`: show `assignedAdminStaffEmail` in the detail view alongside the existing `assignedAuthorityEmail`
- `AuthorityDashboard.tsx`: add "Assign Staff" action to requisition rows; fetch admin staff list via `getAdminStaff`; call `assignAdminStaff` on selection
- `AdminDashboard.tsx`: on mount, fetch notifications and show unread count badge on header; show toast for each new assignment notification; display assigned admin staff name/email per requisition row

### Remove
- Nothing removed

## Implementation Plan

1. **Backend (main.mo)**
   - Add `Notification` type and `stable var notifications` array
   - Upgrade `ReqTuple` to v5 (add `assignedAdminStaffEmail: ?Text` as 15th element)
   - Add migration branch for v4→v5 (append null)
   - Update `toView` to include `assignedAdminStaffEmail`
   - Add `getAdminStaff` query
   - Add `assignAdminStaff` update: auth check (Authority only), find requisition, set field, push notification
   - Add `getNotifications` query (returns notifications for calling user)
   - Add `markNotificationsRead` update

2. **backend.d.ts + backend.ts**
   - Add `assignedAdminStaffEmail: [] | [string]` to `RequisitionView`
   - Add `AdminStaffView` type (same shape as `AuthorityView`)
   - Add `getAdminStaff(sessionId)` signature
   - Add `assignAdminStaff(sessionId, id, email)` signature
   - Add `AppNotification` type and `getNotifications` / `markNotificationsRead` signatures
   - Update wrapper functions in `backend.ts`

3. **AuthorityDashboard.tsx**
   - Fetch admin staff list on mount via `getAdminStaff`
   - Add "Assign Staff" action button (person+ icon) on requisition rows in pending and all tabs
   - Open a small modal: dropdown of admin staff users by name/email, confirm button
   - On confirm, call `assignAdminStaff`; show success toast; refresh requisitions
   - Show currently assigned admin staff name (if any) in the row or detail modal

4. **AdminDashboard.tsx**
   - On mount, call `getNotifications` and store unread list
   - Show unread count badge on a bell icon in the dashboard header
   - Show a toast for each unread notification on first load
   - Call `markNotificationsRead` after displaying them
   - Show `assignedAdminStaffEmail` column or in requisition detail

5. **RequisitionModal.tsx**
   - Add a row showing "Assigned Admin Staff" when `assignedAdminStaffEmail` is present
