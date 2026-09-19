# Recall Forge

Paste your notes → get an adaptive quiz that hunts down exactly what you don't know yet.

Built for General Learning Hacks (Sep 2026).

## What it does differently

Most AI study tools generate a static flashcard deck. Recall Forge treats a wrong answer as a
diagnostic signal: the moment you miss a question, it asks the model to write a **new** question
on that same concept from a different angle — not a reworded copy — to pressure-test whether you
actually understood the idea or just guessed right last time. A deterministic spaced-repetition
scheduler (`lib/srs.ts`, SM-2 style, unit tested) decides which concept comes up next, so the
"what to ask" logic is inspectable and doesn't depend on the model behaving consistently run to
run.

## Judging-criteria map

- **Novelty**: diagnose-and-regenerate on miss, not fixed flashcards.
- **AI/ML use**: three real model calls — concept extraction, question generation, targeted
  follow-up generation — not a thin wrapper around a single prompt.
- **Impact**: works on any subject, any notes, no setup.
- **Technical implementation**: the scheduling logic is pure, deterministic, and unit tested
  (`lib/srs.test.ts`); LLM calls are isolated to one function (`lib/llm.ts`) behind two API
  routes.
- **Presentation**: 2-minute demo is paste → quiz → miss one → watch the follow-up question
  appear targeting that exact gap → mastery bars update live.

## Run it

```bash
npm install
OPENROUTER_API_KEY=... npm run dev
```

Tests:

```bash
npm test
```

Deploy: Vercel, with `OPENROUTER_API_KEY` set as a project environment variable. Optional
`RECALL_FORGE_MODEL` env var overrides the default model (`openai/gpt-4o-mini`).
