# Teacher Requisition App

## Current State
Admin Staff dashboard shows the Complete button to all admin staff users on approved requisitions. The `assignedAdminStaffEmail` field exists on requisitions but is not used to gate the Complete button. The assigned admin staff name is not displayed in the requisition tables.

## Requested Changes (Diff)

### Add
- Display the name of the assigned admin staff in requisition tables for all admin staff users

### Modify
- Backend `fulfillRequisition`: Only the assigned admin staff can complete a requisition if one is assigned. If no admin staff is assigned, any admin staff can complete.
- Frontend `RequisitionTable`: Accept `currentUserEmail` and `adminStaffMap` props. Gate complete/notFulfilled buttons so only the assigned admin staff sees them. Show assigned admin staff name in a new column.
- Frontend `AdminDashboard`: Pass `session.email` as `currentUserEmail` and fetch admin staff list to pass name map.

### Remove
- Nothing

## Implementation Plan
1. Update `fulfillRequisition` and `markNotFulfilled` in `main.mo` to enforce assignment check.
2. Add `currentUserEmail` and `adminStaffMap` props to `RequisitionTable`. Gate complete/notFulfilled buttons. Add Assigned Staff column.
3. Update `AdminDashboard` to pass these props with session email and admin staff data.
