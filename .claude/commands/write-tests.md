Write comprehensive tests for: $ARGUMENTS

General conventions:
* Place test files in a __tests__ directory in the same folder as the source file
* Name test files as [filename].test.ts(x)
* Use @/ prefix imports
* Use Vitest as the test runner for both frontend and server files
* Describe blocks should reflect the unit under test; it() descriptions should read as sentences ("returns null when...", "throws when...")
* Avoid testing implementation details — test behaviour and public APIs
* One assertion per test when possible; group related assertions only when they describe a single behaviour

Coverage:
* Test happy paths
* Test edge cases
* Test error states

Testing conventions for frontend:
* Use Vitest with React Testing Library
* Render components with `render()` and query via accessible roles/labels (`getByRole`, `getByLabelText`) over test IDs
* Simulate user interactions with `userEvent` (not `fireEvent`)
* Mock Server Actions with `vi.mock('@/lib/actions')`
* Do not test internal state — assert what the user sees or what callbacks were called

Testing conventions for server files:
* Test Server Actions (`lib/actions.ts`) directly, without HTTP
* Use an in-memory SQLite database for full isolation: `new Database(':memory:')`
* Re-run the DDL from `lib/db.ts` in a `beforeEach` to start each test with a clean schema
* Import the db instance via dependency injection or module mocking — do not hit `progressor.db`
* Clean up with `db.close()` in `afterEach`
* Do not mock the database — test against the real SQLite engine to catch constraint and cascade errors
