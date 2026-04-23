## Day 1 — Seeded context
Project: Home Reading Library
Stack: Angular 21 frontend
Assigned to implement UI components and integrate with backend APIs.

## Learnings

- Added a new Administrative Reports page for end-of-year student reading levels, using a new backend API and matching existing Angular and service patterns.
- Discovered that duplicate service methods and imports can cause Angular build failures; always check for and remove duplicates after multiple edit passes.
- The nav menu uses FontAwesome icons and requires explicit import and assignment for new icons.
- The project uses non-standalone components and explicit module registration for new features.

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

## Day 3 — Book list table and modal fields fix
**Issue**: Book-list table was missing all book data columns (title, author, ISBN, etc.) and only showing action buttons. AddBookModalComponent had incorrect fields.

**Changes**:
- **book-list.component.html**: Added explicit ngx-datatable columns (ISBN, Title, Author, Reading Level, Publisher, Box, Copies, CheckedOut) before Actions column.
- **add-book-modal.component.ts**: 
  - Reordered form fields: ISBN, Title, Author, Reading Level, Box Number
  - Removed Year and Notes fields from FormGroup
  - Updated save() to map guidedReadingLevel and boxNumber to Book entity
- **add-book-modal.component.html**: 
  - Updated field order to ISBN → Title → Author → Reading Level → Box Number
  - Converted Reading Level to select dropdown with options: K, 1-3, 4-6, 7-9, 10-12, Adult
  - Removed Publisher, Year, Notes fields; kept ISBN optional

**Validation**: `ng build` succeeded with no TypeScript errors. All columns now render properly in datatable.

## Day 4 — Possible Missing Check-ins report (frontend)

**Feature**: New admin-only report page showing books still checked out where the student has since checked in other books (possible missed scan-in).

**Changes**:
- **`src/app/entities/missing-checkin-report-item.ts`**: New entity interface with fields: studentFirstName, studentLastName, bookTitle, bookCopyBarCode, readingLevel, boxNumber, checkedOutDate.
- **`src/app/services/baggy-book.service.ts`**: Added `getMissingCheckinsReport()` — calls `GET /api/reports/missingcheckins`, uses `getAuthHeaders(false)`, maps `{ data: [...] }` response shape. Matches `getEndOfYearStudentReport()` pattern exactly.
- **`src/app/components/missing-checkins-report/` (4 files)**: New component — button-triggered report (no auto-load), spinner while loading, table when data, "No data found" when empty. `standalone: false`, no CSV export.
- **`src/app/app.module.ts`**: Added `MissingCheckinsReportComponent` to declarations.
- **`src/app/modules/app-routing/app-routing.module.ts`**: Added `{ path: 'missingcheckins', component: MissingCheckinsReportComponent, canActivate: [AuthGuard] }` before wildcard.
- **`src/app/components/navmenu/navmenu.component.html`**: Added "Possible Missing Check-ins" link under Reports dropdown, admin-only, after "Year End Student Progress".

**Validation**: `ng build --configuration=production` succeeded. Only pre-existing CommonJS warning from angular-oauth2-oidc-jwks (unrelated).

## Day 5 — Missing Check-ins Report: added StudentBarCode, TeacherName, Grade columns

**Feature**: Extended the Missing Check-ins report UI with three new fields returned by the backend.

**Changes**:
- **`src/app/entities/missing-checkin-report-item.ts`**: Added `studentBarCode`, `teacherName`, `grade` fields to interface.
- **`src/app/components/missing-checkins-report/missing-checkins-report.component.html`**: Added Teacher, Grade, Student Barcode columns; column order is now Teacher | Grade | Last Name | First Name | Student Barcode | Book Title | Barcode | Reading Level | Box Number | Checked Out.
- **`src/app/components/missing-checkins-report/missing-checkins-report.component.spec.ts`**: Updated mock data objects with the three new fields; added test asserting Teacher, Grade, and Student Barcode headers render when data is present.

**Validation**: `ng build` succeeded (exit 0). `ng test` runner fails to start due to a pre-existing `@types/node` TS2344/TS2386 incompatibility in `node_modules` — unrelated to this change.
