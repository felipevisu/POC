# poc-quiz

A [Claude Code](https://claude.com/claude-code) skill that turns any proof-of-concept project into an interactive learning quiz.

Run it inside a POC folder. It reads the codebase, figures out what the POC actually teaches, and generates a self-assessment quiz — so you can measure how much you really learned, not just whether the code runs.

Works for any topic: a language feature, an algorithm, a design pattern, a framework, an AI technique, frontend, or backend.

## What it does

1. **Reads the POC** — real source files, dependency manifests, and docs (not just the README).
2. **Summarizes** — what the POC does, its tech stack, the core concepts, and notable implementation details.
3. **Generates a quiz** — 10 questions by default, each with 4 alternatives, one correct answer, and a teaching comment. Questions reference the actual files, functions, and behavior of *your* POC.
4. **Writes it to `./quiz`** — a self-contained HTML/CSS/JS app you open in the browser.

The quiz evaluates understanding, not trivia: conceptual "why", code comprehension, cause/effect, and design trade-off questions.

## Install

```bash
git clone https://github.com/<you>/poc-quiz-skill.git
cd poc-quiz-skill
./install.sh
```

This copies the skill to `~/.claude/skills/poc-quiz`. Start a new Claude Code session to pick it up.

Uninstall:

```bash
./install.sh --uninstall
```

## Usage

Inside any POC project, ask Claude Code:

```
/poc-quiz
```

or in natural language:

- "make a quiz for this POC"
- "test what I learned from this project"
- "study this POC and quiz me"

**More questions** — say the number in your prompt:

```
make a 20 question quiz for this POC
```

(Default 10, minimum 5.)

### Running the generated quiz

The quiz uses `fetch`, so it needs an HTTP server (not `file://`):

```bash
cd quiz
python3 -m http.server 8000
# open http://localhost:8000
```

You'll get a start screen with the POC summary, one question at a time with a progress bar, instant feedback + explanation after each answer, a final score framed around POC mastery, a per-question review, and a retry button.

## Repository layout

```
poc-quiz-skill/
├── install.sh          # copies skill/ into ~/.claude/skills/poc-quiz
├── skill/
│   ├── SKILL.md        # the skill instructions Claude follows
│   └── assets/         # quiz app template (copied into each POC's /quiz)
│       ├── index.html
│       ├── style.css
│       └── app.js
└── demo/               # example generated quiz (general-knowledge sample)
    ├── index.html
    ├── style.css
    ├── app.js
    └── questions.json
```

Only `questions.json` is generated per POC — the HTML/CSS/JS are static templates.

## How it works

The skill ships a static quiz front-end. When invoked, Claude reads your POC, copies the template into `<poc>/quiz/`, and writes a `questions.json` tailored to what the code demonstrates. The front-end loads that JSON and runs the quiz.

## License

MIT
