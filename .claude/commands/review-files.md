Review the following files or changes for code quality: $ARGUMENTS

If $ARGUMENTS is empty, review the current git diff (staged and unstaged changes).

## What to review

Evaluate the code against these principles:

**Correctness**
- Logic errors, off-by-one, null/undefined access, unhandled promise rejections
- Missing edge cases (empty arrays, zero, negative values, concurrent calls)
- Type safety: unsafe casts, `any`, missing type guards

**Simplicity (KISS)**
- Is this the simplest implementation that works?
- Dead code, redundant conditions, unnecessary abstraction
- Functions that do more than one thing

**Duplication (DRY)**
- Repeated logic that should be extracted
- Copy-paste with minor variations — consider a shared helper

**Cohesion & coupling (SOLID)**
- Does each module/function have a single, clear responsibility?
- Are dependencies injected or hardcoded?
- Would a change in one place force changes in many others?

**Readability**
- Misleading names (variables, functions, files)
- Comments that explain *what* instead of *why*
- Deep nesting or long functions that should be broken up

**Security**
- User input used in SQL, shell commands, or HTML without sanitization
- Secrets hardcoded or logged
- Overly permissive access or missing authorization checks

**Performance (only flag obvious issues)**
- N+1 queries or loops that make repeated DB/network calls
- Heavy computation on the hot path that could be deferred or cached

## Output format

For each issue found:

```
[SEVERITY] file:line — short description
→ Why it matters: ...
→ Suggested fix: ...
```

Severity levels: `ERROR` (correctness/security), `WARN` (quality/maintainability), `INFO` (style/minor).

End with a short summary: total issues by severity and an overall assessment (1–2 sentences).

If no issues are found, say so clearly and briefly.
