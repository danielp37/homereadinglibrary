## Day 1 — Seeded context
Project: Home Reading Library
Stack: Angular 21 frontend
Assigned to implement UI components and integrate with backend APIs.

## Learnings
- Implemented a reusable AddBookModalComponent and wired it to BookListComponent; tests added (unit + shallow integration).
- Modal saves via BaggyBookService.addBook() which posts to /api/books; confirm backend supports this endpoint in integration.
- Chose local component using existing ngx-bootstrap modals to keep changes minimal; consider shared modal service if reuse grows.
