---
description: "Use when implementing or modifying code to enforce test updates and full validation (build + all tests) before completion."
applyTo: "AspnetCore.Identity.MongoDb/**/*.cs,AspnetCore.Identity.MongoDb.Tests/**/*.cs,HomeReadingLibrary.Controllers/**/*.cs,HomeReadingLibrary.Domain/**/*.cs,HomeReadingLibraryWeb/**/*.cs,**/*.csproj,**/*.sln"
---

# Testing and Validation Rules

## Test Expectations
- Always add or adjust tests for behavior changes.
- Ensure tests verify the intended behavior, not implementation details.
- Favor focused, maintainable test cases with clear arrange/act/assert structure.

## Default Validation Workflow
1. Build the solution.
2. Run the full test suite.
3. Report failures with likely root cause and impacted areas.

## Completion Criteria
- Do not mark work complete while known test failures caused by the change remain unresolved.
- If validation cannot run, explicitly state the blocker and the exact commands that still need to run.

## Reporting
- Summarize what changed in tests and why.
- Include verification results and any residual risks.
