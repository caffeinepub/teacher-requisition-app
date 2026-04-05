# Teacher Requisition App

## Current State

The Authority Dashboard has an "Assign Staff" button (purple, person icon) on every requisition row in both Pending and All tabs. The assign staff modal is separate from the approve modal — Authority can assign staff independently at any time. The approve action uses a standalone ActionModal with only a remarks field.

## Requested Changes (Diff)

### Add
- Admin Staff assignment step embedded inside the Approve modal (ActionModal when actionType === "approve"). Before confirming approval, Authority must select an Admin Staff member from a dropdown.
- The approve modal now has two fields: Admin Staff selector (required) + Remarks (optional).
- The approve modal passes both the selected adminStaffEmail and remarks through the confirm handler.

### Modify
- ActionModal: When actionType is "approve", render an additional Admin Staff Select dropdown (required). The `onConfirm` callback needs to also carry the selected adminStaffEmail.
- AuthorityDashboard: Pass adminStaff list to ActionModal. Handle combined assign+approve in `handleAction` — first call `assignAdminStaff`, then call `approveRequisition`.
- RequisitionTable: Remove `assignStaff` from the `actions` arrays in AuthorityDashboard (pending tab, all tab, and dashboard widget).

### Remove
- Standalone "Assign Staff" button from all RequisitionTable `actions` in AuthorityDashboard.
- Standalone Assign Admin Staff Dialog modal (the separate `<Dialog>` block at the bottom of AuthorityDashboard).
- `assignStaff` action type handling from RequisitionTable.

## Implementation Plan

1. Update `ActionModal` to accept optional `adminStaff` prop (array of `{email, name}`). When `actionType === "approve"` and adminStaff is provided, render a required Select dropdown for admin staff selection above the remarks field. Update `onConfirm` signature to include `adminStaffEmail?: string`.
2. Update `AuthorityDashboard`: pass `adminStaff` list to `ActionModal`; in `handleAction`, if approving and adminStaffEmail is provided, call `assignAdminStaff` first, then `approveRequisition`. Remove all `assignStaff` from actions arrays. Remove the standalone assign Dialog.
3. Update `RequisitionTable`: remove `assignStaff` action type from the `actions` prop union and its render logic.
