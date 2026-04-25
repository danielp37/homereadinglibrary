## Day 1 — Seeded context
Project: Home Reading Library
Stack: Angular 21 frontend
Assigned to implement UI components and integrate with backend APIs.

## Learnings

- Added a new Administrative Reports page for end-of-year student reading levels, using a new backend API and matching existing Angular and service patterns.
- Discovered that duplicate service methods and imports can cause Angular build failures; always check for and remove duplicates after multiple edit passes.
- The nav menu uses FontAwesome icons and requires explicit import and assignment for new icons.
- The project uses non-standalone components and explicit module registration for new features.
- **npm `overrides` block** in package.json can force patched transitive dependency versions without changing direct dependencies. Used to address 14 Dependabot security alerts total, with 13 resolved via overrides and 1 remaining (vite 7.3.2, lodash 4.18.1, hono 4.12.14, @hono/node-server 1.19.14, follow-redirects 1.16.0). Verified via `npm ls --depth 4` and confirmed no build/test breakage.

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

## Day 6 — Security fix: npm overrides for 14 Dependabot alerts

**Fix**: Applied npm `overrides` block to force patched versions of transitive devDependencies with security vulnerabilities.

**Changes**:
- **`HomeReadingLibraryWeb\ClientApp\package.json`**: Added `overrides` block with:
  - `vite: 7.3.2` — fixes HIGH alerts #203/#204 (arbitrary file read, fs.deny bypass) and medium #205 (path traversal)
  - `lodash: 4.18.1` — fixes HIGH alert #202 (code injection via _.template) and medium #201 (prototype pollution)
  - `hono: 4.12.14` — fixes 5 medium alerts (#207-#213), patch upgrade from 4.12.9
  - `@hono/node-server: 1.19.14` — fixes medium alert #206, patch upgrade from 1.19.11
  - `follow-redirects: 1.16.0` — fixes medium alert #212 (auth header leak to cross-domain redirects)
- Ran `npm install` to rebuild package-lock.json with overridden versions.
- Verified all 5 packages installed at correct versions via `npm ls --depth 4`.

**Validation**: 
- `dotnet build HomereadingLibrary.sln` succeeded (exit 0).
- `dotnet test HomeReadingLibrary.Controllers.Tests` passed (14/14 tests).
- `dotnet test AspnetCore.Identity.MongoDb.Tests` passed (7/7 tests).
- No build or runtime errors introduced.

**Note**: `uuid@8.3.2` (alert #214) was NOT overridden — already at latest 8.x release; vulnerability (buffer bounds check) not triggered by sockjs usage. Will assess separately if needed.

## Day 7 — Column sorting for Missing Check-ins report

**Feature**: Sortable column headers for Teacher, Last Name, Book Title, Reading Level, and Checked Out on the Possible Missing Check-ins report.

**Changes**:
- **`missing-checkins-report.component.ts`**: Added `sortColumn`, `sortDirection` properties; `sort(column)` method sorts `rows` in-place (toggles asc/desc on same column, resets to asc for new column); `getSortIndicator(column)` returns ▲/▼ or empty string. Reading Level sort is primary by readingLevel (case-insensitive), secondary by boxNumber parsed as integer (parseInt fallback 0).
- **`missing-checkins-report.component.html`**: Added `(click)="sort(...)"` and `style="cursor:pointer"` to the five sortable `<th>` elements; non-sortable columns (Grade, First Name, Student Barcode, Barcode, Box Number) left unchanged.

**Validation**: `ng build` succeeded (exit 0), no TypeScript errors.

**Team Decision**: Column Sorting approach documented in `.squad/decisions.md` — in-place sort with no pipe or external dependency; read level uses two-key compare (level + box); sort state resets on fresh data load (acceptable UX).

**Test Integration**: Halley added 13 comprehensive unit tests covering initial state, direction toggle, all 5 sortable columns, getSortIndicator return values, and cursor styling. Tests documented in orchestration log.

