# Testing Guidelines

This document provides agents with strict rules for writing and maintaining tests in this repository.

## General Rules
- **Framework:** All tests use [Vitest](https://vitest.dev/).
- **Coverage Target:** Every `core.ts` file must have >90% code coverage.
- **Test Location:** Tests live in `src/modules/<feature>/__tests__/core.test.ts`.
- **Run Tests:** `npm run test` (single run) or `npm run test:watch` (watch mode).

## What to Test
- **Only test `core.ts` files.** These contain pure, side-effect-free functions that accept inputs and return outputs. They are the only files that should be unit tested.
- Test edge cases: empty inputs, boundary values, large inputs, and invalid arguments.
- Test return types and data structures, not string formatting or visual output.

## What NOT to Test
- **Never write tests for `runner.ts` files.** Runners handle interactive I/O (`readline`), terminal rendering (`chalk`, `boxen`), and animation loops. These are side-effect-heavy and not suitable for unit testing.
- Do not test `console.log` output or terminal styling.
- Do not test the main menu router in `src/index.ts`.

## Mocking
- If a `core.ts` function relies on `Math.random()`, mock it with `vi.spyOn(Math, 'random')` to produce deterministic results.
- If a `core.ts` function reads from the filesystem (e.g., the Morse WAV exporter), mock `fs` operations rather than writing real files during tests.
- Keep mocks minimal. If you find yourself mocking heavily, the function may not be pure and should be refactored.

## Test Structure
- Use `describe` blocks grouped by function name.
- Use clear, descriptive `it` or `test` labels (e.g., `it('returns empty array for zero-length input')`).
- Prefer `expect(...).toEqual(...)` for deep object comparisons and `expect(...).toBe(...)` for primitives.
