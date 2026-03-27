---
description: "Use when editing ASP.NET Core/C# code in this repository to keep changes safe, minimal, and consistent with existing backend architecture."
applyTo: "AspnetCore.Identity.MongoDb/**/*.cs,HomeReadingLibrary.Controllers/**/*.cs,HomeReadingLibrary.Domain/**/*.cs,HomeReadingLibraryWeb/**/*.cs"
---

# Backend C# Implementation Rules

## Design and Scope
- Implement only what the request requires; avoid opportunistic refactors.
- Keep methods cohesive and avoid introducing broad abstractions unless repeated duplication justifies it.
- Preserve public contracts and endpoint behavior unless explicitly requested to change them.

## Code Quality
- Follow existing C# style in nearby files (naming, nullable usage, constructor style, async patterns).
- Prefer explicit, readable logic over clever one-liners.
- Keep error handling and guard clauses consistent with local project conventions.

## ASP.NET Core and API Safety
- Keep controller changes backward-compatible unless instructed otherwise.
- Validate inputs at boundaries and return appropriate HTTP responses.
- Avoid hidden side effects in request handling.

## Dependency and Package Rules
- Reuse existing services/utilities/patterns before adding new dependencies.
- Introduce new packages only when necessary and justified by the task.
