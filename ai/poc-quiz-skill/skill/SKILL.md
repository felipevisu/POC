---
name: poc-quiz
description: Study a POC (proof-of-concept) project by reading its codebase, summarizing the features/concepts/technologies it demonstrates, and generating an interactive self-assessment quiz that evaluates how much you learned from it. Auto-invoke when the user asks to "make a quiz for this POC", "quiz me on this project", "test what I learned", "study this POC", or "generate a learning quiz". Works for any topic — language, algorithm, design pattern, framework, frontend, backend, AI. Outputs an HTML quiz to a /quiz folder inside the POC.
---

Turn the current POC project into a learning quiz. Read the actual code, understand what it teaches, then generate an interactive HTML quiz that evaluates how well the user understood the POC.

The POC can be about anything: a language feature, an algorithm, a design pattern, a technology, a framework, an AI technique, frontend, or backend. Adapt the questions to whatever the POC actually demonstrates.

## Inputs

- **Quiz folder:** always `./quiz` inside the current POC directory (or `$ARGUMENTS` path if given).
- **Question count:** default **10**. If the user's prompt names a number ("make 20 questions", "15 question quiz"), use that instead. Minimum 5.

## Step 1 — Read and understand the POC

Explore the project root. Read the **real source files**, not just docs. Build a genuine understanding of what the POC demonstrates:

1. Read `README*`, top-level docs, and any `*.md` that explains intent.
2. Read dependency manifests (`package.json`, `go.mod`, `requirements.txt`, `pom.xml`, `Cargo.toml`, etc.) to identify the stack.
3. Read the main source files — entry points, core modules, the files that carry the actual demonstration. Follow the important code paths.
4. Note: language(s), frameworks/libraries, the central concept(s), algorithms or patterns used, notable APIs or syntax, and any non-obvious design decisions or trade-offs.

Do not sample shallowly. The quiz quality depends on real comprehension of the code.

## Step 2 — Summarize

Produce a short written summary (show it to the user in chat) covering:

- **What the POC does** — one or two sentences.
- **Tech stack** — languages, frameworks, key libraries.
- **Core concepts** — the ideas/patterns/algorithms it teaches.
- **Notable details** — specific implementation choices worth understanding.

## Step 3 — Generate questions

Write `N` questions (default 10) that **evaluate learning**, not trivia. Mix these kinds:

- **Conceptual** — "Why is X used here?", "What problem does pattern Y solve?"
- **Code comprehension** — point at what a specific function/snippet from the POC does.
- **Cause/effect** — "What happens if you change/remove X?"
- **Comparison** — "Why this approach over the alternative?"
- **Stack/API** — specific library, syntax, or API the POC relies on.

Rules:
- Every question has exactly **4 alternatives**, one correct.
- Questions must be answerable by someone who studied **this** POC — reference real names, files, functions, and behavior from the code.
- Each question includes a `comment` that teaches: explain why the answer is right (and ideally why the tempting wrong one is wrong).
- Vary the `correctIndex` (don't always put the answer in the same slot).
- Order roughly easy → hard.

## Step 4 — Write the quiz files

Create the `./quiz` folder. Copy the three template files from this skill's `assets/` directory verbatim:

- `assets/index.html` → `quiz/index.html`
- `assets/style.css`  → `quiz/style.css`
- `assets/app.js`     → `quiz/app.js`

Then write `quiz/questions.json` using this schema:

```json
{
  "title": "<POC name> — Learning Quiz",
  "summary": "One-paragraph recap of what this POC teaches. Shown on the start screen.",
  "questions": [
    {
      "question": "Question text referencing the POC.",
      "alternatives": ["A", "B", "C", "D"],
      "correctIndex": 2,
      "comment": "Why the answer is correct and what concept it reinforces."
    }
  ]
}
```

Only `questions.json` changes per POC — the HTML/CSS/JS are static templates. Do not edit them.

## Step 5 — Tell the user how to run

The quiz uses `fetch`, so it needs an HTTP server (not `file://`). Tell the user:

```
cd <poc>/quiz
python3 -m http.server 8000
# open http://localhost:8000
```

Report: number of questions generated, the concepts covered, and the run command.
