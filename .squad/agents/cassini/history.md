## Day 1 — Seeded context
Project: Home Reading Library
Stack: Angular 21 frontend
Assigned to implement UI components and integrate with backend APIs.

## Learnings
- Implemented a reusable AddBookModalComponent and wired it to BookListComponent; tests added (unit + shallow integration).
- Modal saves via BaggyBookService.addBook() which posts to /api/books; confirm backend supports this endpoint in integration.
- Chose local component using existing ngx-bootstrap modals to keep changes minimal; consider shared modal service if reuse grows.

## Day 2 — Modal refactoring (edit & copy operations)
Refactored app-add-book component to separate concerns:
- **AddBookModalComponent**: Focused on adding NEW books; dialog-only, simple form.
- **EditBookModalComponent**: NEW component for editing books and adding copies to existing books; modal with two modes (edit/add-copy).
- Updated BookListComponent to:
  - Show Edit and Add Copy buttons in the datatable row (via ngx-datatable template).
  - Wire both modals via ViewChild references.
  - Emit bookAdded when either modal updates.
- Updated playwright tests to cover opening add-book modal, edit-book modal, and add-copy modal variants.
- Build verified: `ng build` succeeds with no TypeScript errors.
- App-add-book component is deprecated; can be removed in future refactoring (currently still imported for backward compatibility).

## Key Decisions
- Used same BsModalService and modal pattern for consistency with existing code.
- EditBookModalComponent accepts mode parameter ('edit' | 'add-copy') to display conditional UI.
- Form prefill logic isolates per mode to avoid confusion (edit shows title/author fields, copy shows barcode/book details).
- Tests focus on user interactions (opening modals, form submission, barcode entry) rather than implementation details.
