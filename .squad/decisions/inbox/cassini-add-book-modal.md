# Decision: AddBookModal implementation

Date: 2026-04-16
By: Cassini

Decision:
- Implement a local reusable component `AddBookModalComponent` using existing ngx-bootstrap ModalModule (BsModalService).
- Do not introduce a global modal service or new library at this time; keep scope minimal and consistent with existing codebase patterns.

Rationale:
- Project already uses ngx-bootstrap ModalModule and several components rely on BsModalService, so reusing it keeps consistency.
- The requested feature is small and localized; a shared modal service would add indirection without immediate benefit.
- The component exposes an Output (bookAdded) so it can be reused by different pages.

Consequences:
- Future refactor may extract a shared modal utility if multiple widgets require consistent modal behaviors (focus management, modal stacking, etc.).
- The backend API expectation is POST /api/books (BaggyBookService.addBook). Ensure backend provides this endpoint.
