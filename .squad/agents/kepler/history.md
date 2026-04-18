## Day 1 — Seeded context
Project: Home Reading Library
Owner: Dan Preece
Stack: .NET 10 backend, Angular 21 frontend
Notes: Lead will triage issues and propose architecture decisions.

## Learnings
- Created initial repository scaffolding: root README, developer quickstart, decision entry, and a smoke test to validate test runner.
- Ensured developers/ and .squad/decisions/inbox directories were created for documentation and decisions.
- Established project structure with consistent layering: AspnetCore.Identity.MongoDb (identity), HomeReadingLibrary.Controllers (API), HomeReadingLibrary.Domain (logic), HomeReadingLibraryWeb (host+web).
- Validated all layers with dotnet restore, build, and test passing; SmokeTests confirm test runner works.
- Set target framework to .NET 10 across all backend projects; noted Angular 21 for frontend.

