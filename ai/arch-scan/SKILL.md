---
name: arch-scan
description: Analyze an architecture markdown file to extract all technology mentions — languages, frameworks, libraries, databases, external services, plugins, and design patterns. Auto-invoke when the user asks to scan, analyze, or audit technologies in a .md or architecture document. Generates an interactive HTML report and opens it in the browser.
---

Analyze the architecture markdown file provided as $ARGUMENTS (or ask which .md file to analyze if none specified).

## Step 1 — Read the file

Read the full content of the target `.md` file.

## Step 2 — Extract technologies

Identify ALL technology mentions grouped into these categories:
- **languages** – TypeScript, Python, Go, SQL, etc.
- **frameworks** – NestJS, Django, Spring Boot, Next.js, etc.
- **libraries** – Axios, Lodash, Pydantic, RxJS, etc.
- **databases** – PostgreSQL, MongoDB, Redis, MySQL, DynamoDB, Elasticsearch, SQLite, Cassandra, etc.
- **services** – AWS S3, Stripe, Twilio, Datadog, etc.
- **plugins** – ESLint plugins, Webpack plugins, IDE extensions, etc.
- **patterns** – CQRS, Event Sourcing, Saga, Repository Pattern, Hexagonal Architecture, etc.

For each technology produce:
- `name` — full name
- `category` — one of the keys above
- `versionMentioned` — version string or `null`
- `missingVersion` — true if no version is anywhere in the doc for this tech
- `abbreviationsFound` — list of abbreviations used without a prior full-name definition
- `hasAbbreviationIssue` — true if abbreviationsFound is non-empty
- `context` — a short quote or note from the doc

## Step 3 — Build the JSON payload

Produce a JSON object with this exact shape (no markdown fences, raw JSON only):

```
{
  "sourceFile": "<filename>",
  "technologies": [ ...items... ],
  "summary": {
    "totalFound": <n>,
    "missingVersionCount": <n>,
    "abbreviationIssueCount": <n>
  }
}
```

## Step 4 — Generate the HTML report

1. Read the file at `{SKILL_PATH}/template.html`
2. Replace the placeholder `__ARCH_SCAN_DATA__` with the raw JSON object (no quotes around it — it must be valid JS)
3. Write the result to `arch-scan-report.html` in the same directory as the analyzed `.md` file

## Step 5 — Open the report

Run the appropriate command to open `arch-scan-report.html` in the default browser:
- macOS: `open arch-scan-report.html`
- Linux: `xdg-open arch-scan-report.html`
- Windows: `start arch-scan-report.html`

## Step 6 — Confirm

Tell the user: how many technologies were found, how many are missing versions, how many have abbreviation issues, and that the report has been opened at `arch-scan-report.html`.
