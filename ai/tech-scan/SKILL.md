---
name: tech-scan
description: Scan an entire project/repository codebase to discover all technologies in use — languages, frameworks, libraries, databases, services, tools, and protocols. Auto-invoke when the user asks to "scan the project", "analyze the tech stack", "what technologies does this project use", "audit the codebase", "list all dependencies", "tech stack report", or "study the repository". Generates an interactive HTML report and a JSON data file.
---

Scan the current project directory (or the path provided as `$ARGUMENTS`) to discover every technology in use across the codebase. This skill reads actual source files, dependency manifests, config files, and infrastructure definitions — not documentation.

**Consistency rule:** The output must be deterministic and complete. Follow every checklist item below. Do not skip sources or rely on sampling alone. If a dependency is declared in a manifest, it **must** appear in the output even if no import is found in source code.

## Step 1 — Systematic discovery (read ALL sources)

Identify the project root. Then read **every** applicable file from the lists below. Do not skip files that exist. Check each group in order.

### 1a — Dependency manifests (MUST read all that exist)

Glob for and read every one of these. Extract **all** dependencies, devDependencies, peerDependencies, and optional dependencies with their versions:

- **JS/TS:** `package.json`, `package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`, `deno.json`, `bun.lockb`
- **Python:** `requirements.txt`, `requirements*.txt`, `Pipfile`, `Pipfile.lock`, `pyproject.toml`, `setup.py`, `setup.cfg`, `conda.yml`, `environment.yml`
- **Ruby:** `Gemfile`, `Gemfile.lock`
- **Go:** `go.mod`, `go.sum`
- **Rust:** `Cargo.toml`, `Cargo.lock`
- **Java/Kotlin:** `pom.xml`, `build.gradle`, `build.gradle.kts`, `settings.gradle*`
- **PHP:** `composer.json`, `composer.lock`
- **Elixir:** `mix.exs`, `mix.lock`
- **Dart/Flutter:** `pubspec.yaml`, `pubspec.lock`
- **.NET:** `*.csproj`, `*.fsproj`, `Directory.Build.props`, `*.sln`, `nuget.config`, `packages.config`
- **C/C++:** `CMakeLists.txt`, `conanfile.txt`, `vcpkg.json`
- **Swift:** `Package.swift`

### 1b — Configuration & infrastructure files

- **Containers:** `Dockerfile*`, `docker-compose.yml`, `docker-compose.yaml`, `docker-compose.*.yml`, `.dockerignore`
- **CI/CD:** `.github/workflows/*.yml`, `.gitlab-ci.yml`, `Jenkinsfile`, `bitbucket-pipelines.yml`, `.circleci/config.yml`, `azure-pipelines.yml`, `.travis.yml`, `cloudbuild.yaml`, `appspec.yml`, `.buildkite/*.yml`
- **IaC:** `terraform/*.tf`, `*.tf`, `serverless.yml`, `serverless.ts`, `k8s/*.yaml`, `helm/Chart.yaml`, `helm/values.yaml`, `ansible/*.yml`, `pulumi/*.ts`, `cdk/*.ts`
- **Other infra:** `Makefile`, `Procfile`, `Vagrantfile`, `fly.toml`, `vercel.json`, `netlify.toml`, `render.yaml`, `railway.json`, `heroku.yml`

### 1c — Tool & build config files

`tsconfig.json`, `jsconfig.json`, `.babelrc`, `babel.config.*`, `webpack.config.*`, `vite.config.*`, `rollup.config.*`, `esbuild.*`, `swc.config.*`, `.swcrc`, `.eslintrc*`, `eslint.config.*`, `.prettierrc*`, `prettier.config.*`, `jest.config.*`, `vitest.config.*`, `.storybook/main.*`, `cypress.config.*`, `playwright.config.*`, `pytest.ini`, `pyproject.toml`, `tox.ini`, `.flake8`, `ruff.toml`, `.rubocop.yml`, `.env.example`, `.env.sample`, `nginx.conf`, `apache.conf`, `.editorconfig`, `turbo.json`, `nx.json`, `lerna.json`, `.husky/*`, `lint-staged.config.*`, `commitlint.config.*`, `.releaserc*`, `tailwind.config.*`, `postcss.config.*`

### 1d — Source code analysis (thorough, not sampling)

1. **Glob all source directories:** `src/`, `lib/`, `app/`, `cmd/`, `internal/`, `pkg/`, `server/`, `client/`, `api/`, `services/`, `modules/`, `components/`, `pages/`, `routes/`, `controllers/`, `models/`, `utils/`, `helpers/`, `config/`, `scripts/`, `test/`, `tests/`, `spec/`, `__tests__/`
2. **Read a broad sample** — at least **40–50 files** across different directories and file types. Prioritize:
   - Entry points (`index.*`, `main.*`, `app.*`, `server.*`)
   - Config/setup files (`config/*`, `setup.*`, `bootstrap.*`)
   - Database files (models, migrations, seeds, schema files)
   - Route/controller files
   - Test files (to find test frameworks)
   - Files with many imports (typically integration points)
3. **Extract from source code:**
   - All `import`/`require`/`use`/`include`/`from`/`using` statements → map to libraries
   - Database drivers, ORM model definitions, query builders
   - API client instantiations (HTTP clients, SDK inits)
   - Protocol markers (gRPC proto imports, GraphQL schema/resolvers, WebSocket handlers)
   - Middleware, plugin, and decorator registrations
   - Environment variable references (often reveal services: `DATABASE_URL`, `REDIS_URL`, `STRIPE_KEY`, `AWS_*`, etc.)

### 1e — Cross-check: file extensions inventory

Run a glob for all file extensions in the project (`**/*.*`) and note any that reveal technologies not yet captured:
- `.proto` → gRPC/Protocol Buffers
- `.graphql` / `.gql` → GraphQL
- `.sql` → SQL scripts
- `.hbs` / `.ejs` / `.pug` / `.jinja2` → Template engines
- `.scss` / `.less` / `.styl` → CSS preprocessors
- `.wasm` → WebAssembly
- `.tf` → Terraform
- `.prisma` → Prisma ORM
- `.svelte` / `.vue` / `.astro` → Frontend frameworks

## Step 2 — Extract and classify technologies

For **every** technology discovered (including ALL dependencies from manifests), classify it into one of these categories:

| Category       | Examples                                                    |
|----------------|-------------------------------------------------------------|
| `language`     | TypeScript, Python, Go, Rust, Java, Ruby, PHP, C#, SQL     |
| `framework`    | Next.js, Django, Spring Boot, Rails, Express, FastAPI, Gin  |
| `library`      | React, Lodash, Pydantic, RxJS, Axios, NumPy, SQLAlchemy    |
| `database`     | PostgreSQL, MongoDB, Redis, MySQL, DynamoDB, SQLite, Elasticsearch |
| `service`      | AWS S3, Stripe, Twilio, Datadog, Auth0, SendGrid, Firebase |
| `tool`         | Docker, Webpack, ESLint, Terraform, GitHub Actions, Jest    |
| `protocol`     | REST, gRPC, GraphQL, WebSocket, AMQP, MQTT, HTTP/2, OAuth  |
| `platform`     | AWS, GCP, Azure, Vercel, Heroku, Kubernetes, Linux          |

For each technology produce:
- `name` — full canonical name
- `category` — one of the keys above
- `version` — version string from manifests/lock files, or `null` if not found
- `purpose` — one-sentence description: what this technology **is** and what it is generally used for
- `usedFor` — one-sentence description of how it is specifically used **in this project** (inferred from file context, imports, config)
- `sourceFiles` — array of 1–3 file paths where this technology was detected (for traceability)

**Important:** Do NOT silently omit dependencies. If `package.json` lists 40 dependencies, all 40 must be in the output. For devDependencies that are standard tools (testing libs, linters, bundlers), include them as `tool` category.

## Step 3 — Deep-dive feature analysis per technology

This is the **most important step**. For each technology, analyze its usage across the codebase and produce a `features` array of **rich feature objects**. Each feature must explain **what** it is, **how** it works, and **why** the project uses it.

Each feature object has four fields:

| Field         | Description                                                                                         |
|---------------|-----------------------------------------------------------------------------------------------------|
| `name`        | Short label for the feature (2–5 words)                                                             |
| `description` | What this feature **is** and how it works — explain it as if teaching someone who knows the technology but hasn't seen this codebase. Include concrete details: mention specific files, patterns, config values, or code constructs observed. (2–4 sentences) |
| `why`         | Why this feature is used **in this project** — what problem does it solve, what benefit does it provide, what would happen without it. Connect it to the project's domain or architecture. (1–2 sentences) |
| `codeExample` | **(optional, but strongly encouraged for code-related features)** A short, real code snippet extracted or adapted from the codebase that demonstrates this feature in action. Use the actual code found in the project — not generic documentation examples. Keep it concise (3–15 lines). Set to `null` for non-code features (e.g., infrastructure config, design patterns without a single snippet). |

### Examples

**Database (PostgreSQL):**
```json
[
  {
    "name": "JSON column types",
    "description": "The schema uses JSONB columns to store flexible metadata on the `orders` and `user_preferences` tables. This allows storing semi-structured data (like shipping options, filter configs) without needing separate relational tables for every variation.",
    "why": "The product has many user-configurable options that vary per tenant — JSONB avoids an explosion of nullable columns or EAV patterns while still supporting indexed queries on the JSON fields.",
    "codeExample": "model Order {\n  id        String @id @default(uuid())\n  metadata  Json   @db.JsonB\n  shipping  Json   @db.JsonB\n}"
  },
  {
    "name": "Database migrations via Prisma",
    "description": "Schema changes are managed through Prisma Migrate, with migration files stored in `prisma/migrations/`. Each migration is a timestamped SQL file auto-generated from changes to `schema.prisma`.",
    "why": "Ensures all environments (dev, staging, prod) evolve their schema in lockstep and changes are version-controlled and reviewable in PRs.",
    "codeExample": null
  }
]
```

**Framework (Next.js):**
```json
[
  {
    "name": "App Router",
    "description": "The project uses the Next.js 14 App Router (`app/` directory) with nested layouts, loading states, and error boundaries. Routes are organized by feature domain: `app/(dashboard)/`, `app/(auth)/`, `app/api/`.",
    "why": "The App Router enables per-route layouts (e.g., dashboard shell vs. auth pages) and React Server Components by default, reducing client-side JS bundle size for data-heavy pages.",
    "codeExample": "// app/(dashboard)/layout.tsx\nexport default function DashboardLayout({ children }) {\n  return (\n    <Shell sidebar={<Sidebar />}>\n      {children}\n    </Shell>\n  );\n}"
  },
  {
    "name": "Server Actions",
    "description": "Form mutations (create project, update settings) are handled via Server Actions marked with `'use server'` instead of dedicated API route handlers. Found in `app/(dashboard)/actions.ts`.",
    "why": "Eliminates boilerplate API routes for simple mutations, provides built-in progressive enhancement (forms work without JS), and colocates the mutation logic with the UI that triggers it.",
    "codeExample": "'use server';\n\nexport async function createProject(formData: FormData) {\n  const name = formData.get('name') as string;\n  const project = await db.project.create({ data: { name } });\n  revalidatePath('/dashboard');\n  return project;\n}"
  }
]
```

**Library (Axios):**
```json
[
  {
    "name": "Request interceptors",
    "description": "A global Axios instance in `lib/api-client.ts` attaches a request interceptor that injects the Bearer token from the auth store into every outgoing request's Authorization header.",
    "why": "Centralizes auth token injection so individual API calls don't need to manually handle authentication, reducing boilerplate and preventing accidental unauthenticated requests.",
    "codeExample": "const api = axios.create({ baseURL: '/api/v1' });\n\napi.interceptors.request.use((config) => {\n  const token = useAuthStore.getState().token;\n  if (token) config.headers.Authorization = `Bearer ${token}`;\n  return config;\n});"
  }
]
```

**Tool (Docker):**
```json
[
  {
    "name": "Multi-stage build",
    "description": "The Dockerfile uses a two-stage build: a `builder` stage that compiles TypeScript and installs all dependencies, and a `runner` stage that copies only the compiled output and production dependencies into a slim Node.js Alpine image.",
    "why": "Keeps the production image small (~150MB vs ~800MB) by excluding devDependencies, source TypeScript files, and build tooling — reduces deployment time and attack surface.",
    "codeExample": "FROM node:20-alpine AS builder\nWORKDIR /app\nCOPY . .\nRUN npm ci && npm run build\n\nFROM node:20-alpine AS runner\nCOPY --from=builder /app/dist ./dist\nCOPY --from=builder /app/node_modules ./node_modules\nCMD [\"node\", \"dist/main.js\"]"
  }
]
```

### Guidelines
- Target **3–8 features** per technology. More for core technologies (main language, primary framework, database), fewer for peripheral tools.
- Only list features that are **evidenced in the code** — do not speculate.
- Be **specific**: mention file paths, config keys, function names, or patterns you observed.
- Write descriptions that **teach** — someone reading the report should understand the feature well enough to discuss it in a code review.
- **Code examples are strongly encouraged** for any feature involving code (libraries, frameworks, languages, database queries, config files). Extract real snippets from the project — do not invent generic examples. Keep them short (3–15 lines) and focused on the feature being described. Use `null` only for non-code features (e.g., "uses connection pooling" where the config is just a flag).

## Step 4 — Self-review: verify completeness

Before producing output, run this verification checklist. Go back and fix anything that is missing.

### 4a — Manifest cross-check
Re-read each dependency manifest found in Step 1a. Count the total number of declared dependencies (deps + devDeps + peer). Compare that count to the number of technologies in your output that came from that manifest. **Every declared dependency must appear.** If any are missing, add them now.

### 4b — Category coverage check
Verify that you have at least considered each category. If a category has 0 entries, confirm that is genuinely correct for this project (e.g., a CLI tool may have no `database` or `service`).

### 4c — Implicit technology check
Many technologies are **used but never declared as a dependency**. Verify you have captured:
- The **programming language(s)** themselves (from file extensions and configs)
- The **runtime** (Node.js, Python, JVM, .NET, etc.)
- **CSS preprocessors or frameworks** (Tailwind, SCSS, etc.) — check config files and imports
- **Testing frameworks** — check test files and config
- **CI/CD platform** — check pipeline files
- **Hosting/deploy platform** — check deploy configs, Procfile, vercel.json, fly.toml, etc.
- **Database** — check connection strings in env examples, ORM configs, docker-compose services
- **Protocols** — check for GraphQL schemas, proto files, WebSocket handlers

### 4d — Source file evidence check
For each technology, verify the `sourceFiles` array has at least one real file path. If a technology was only inferred (e.g., "probably uses PostgreSQL because of Prisma") mark it clearly in `usedFor`.

## Step 5 — Build the JSON payload

Produce a JSON object with this exact shape (raw JSON, no markdown fences):

```
{
  "projectName": "<directory name or repo name>",
  "scannedAt": "<ISO 8601 timestamp>",
  "technologies": [
    {
      "name": "Technology Name",
      "category": "language|framework|library|database|service|tool|protocol|platform",
      "version": "1.2.3" | null,
      "purpose": "General purpose description",
      "usedFor": "How it is used in this specific project",
      "sourceFiles": ["path/to/file1", "path/to/file2"],
      "features": [
        {
          "name": "Short feature label",
          "description": "What this feature is and how it works in the codebase (2-4 sentences with specific details)",
          "why": "Why the project uses this feature — what problem it solves (1-2 sentences)",
          "codeExample": "// real snippet from the codebase\nconst example = 'actual code';" | null
        }
      ]
    }
  ],
  "summary": {
    "totalTechnologies": <n>,
    "byCategory": {
      "language": <n>,
      "framework": <n>,
      "library": <n>,
      "database": <n>,
      "service": <n>,
      "tool": <n>,
      "protocol": <n>,
      "platform": <n>
    },
    "totalFeatures": <n>,
    "totalCodeExamples": <n>,
    "manifestDependencyCount": <n>,
    "filesScanned": <n>
  },
  "review": {
    "manifestsRead": ["package.json", "go.mod"],
    "declaredDepsCount": <n>,
    "capturedDepsCount": <n>,
    "missingDeps": [],
    "categoriesWithZeroEntries": ["service"],
    "notes": "Any observations about the scan — e.g., 'monorepo with 3 sub-packages, all scanned' or 'no lock file found, versions may be imprecise'"
  }
}
```

## Step 6 — Save the JSON file

Write the full JSON payload to `tech-scan-data.json` in the project root directory. This is the **canonical output** — the HTML report is derived from it.

## Step 7 — Generate the HTML report

1. Read the file at `{SKILL_PATH}/template.html`
2. Replace the placeholder `__TECH_SCAN_DATA__` with the raw JSON object (no quotes — it must be valid JS)
3. Write the result to `tech-scan-report.html` in the project root directory

## Step 8 — Open the report

Run the appropriate command to open `tech-scan-report.html` in the default browser:
- macOS: `open tech-scan-report.html`
- Linux: `xdg-open tech-scan-report.html`
- Windows: `start tech-scan-report.html`

## Step 9 — Report to user with review summary

Tell the user:
1. Total technologies found and breakdown by category
2. The **review results**: how many manifest dependencies were declared vs. captured, any missing deps, any categories with zero entries, and any notes
3. File paths: `tech-scan-data.json` (data) and `tech-scan-report.html` (visual report)
4. If there are any concerns about completeness, flag them explicitly
