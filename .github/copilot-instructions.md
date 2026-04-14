# HomeReadingLibrary Copilot Instructions

## Core Priorities
- Keep edits safe, minimal, and localized to the user request.
- Prefer existing project patterns and dependencies over introducing new libraries.
- Preserve behavior unless the request explicitly requires behavior changes.
- Do not make breaking API changes unless explicitly asked.

## Architecture and Consistency
- Follow existing ASP.NET Core and C# conventions used in this repository.
- Keep concerns separated by project role:
  - `HomeReadingLibrary.Controllers`: HTTP and API surface behavior.
  - `HomeReadingLibrary.Domain`: domain logic and core services.
  - `AspnetCore.Identity.MongoDb`: identity, auth, and related data concerns.
  - `HomeReadingLibraryWeb`: host/web composition and app startup.
- Match existing naming, null handling, error handling, and logging patterns in touched files.

## Testing and Validation (Default Required)
- Always add or adjust tests for code changes when tests are feasible.
- Default verification bar for code edits:
  1. Run full solution build.
  2. Run full test suite.
- If validation cannot be run, clearly state what was not run and why.

## MongoDB and Data Safety
- Preserve existing MongoDB query and document-shape conventions.
- Avoid accidental schema drift or implicit data shape changes.
- Keep query/index changes explicit and scoped to the request.

## Response Style
- Provide a detailed walkthrough with rationale and tradeoffs.
- Include files changed, why each change was made, and how it was validated.
- For reviews, prioritize concrete findings and risks first.

## Handoff File
- When `handoff.md` exists or is requested, keep it current with status, validation, blockers, and next steps.
- Ensure entries are concrete and resume-friendly so a new contributor can continue without re-discovery.
