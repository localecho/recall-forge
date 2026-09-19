# 2-minute demo video script

Screen-record https://recall-forge-kappa.vercel.app (already deployed, no localhost
needed). Read the bracketed narration lines as you go; the actions are what to click.

Suggested notes to paste live (biology, reliably produces 6-8 clean concepts):

```
Mitochondria are the powerhouse of the cell. They perform cellular respiration,
converting glucose and oxygen into ATP, carbon dioxide, and water. Mitochondria
have their own DNA (mtDNA), inherited maternally, and are believed to have
originated from ancient bacteria via endosymbiosis.
```

---

**0:00–0:15 — Problem**
> "Most AI study tools are flashcards with a chatbot label. They test whether you
> memorized an answer, not whether you understood the idea. Recall Forge does
> something different: when you get a question wrong, it doesn't move on — it
> immediately writes a new question on that exact concept, from a different angle,
> to find out if you actually understood it."

**0:15–0:30 — Paste notes, generate**
[Paste the notes above into the textarea. Click "Generate adaptive quiz."]
> "Paste any notes — a chapter, a lecture, slides. It extracts the testable concepts
> and builds a question for each one."

**0:30–0:55 — Answer correctly, show mastery bar**
[Answer the first question correctly.]
> "Each concept has its own mastery bar, tracked by a deterministic spaced-repetition
> scheduler — not the model guessing, actual tested code deciding what's due next."
[Click "Next question →."]

**0:55–1:30 — Answer wrong, show the regenerate**
[Deliberately pick a wrong answer.]
> "Now watch — I get this one wrong."
[Wait ~2-3s for regeneration.]
> "It's not showing me the same question again later hoping I memorized it. It just
> forged a brand new question on the same concept — mitochondrial DNA inheritance —
> from a different angle, right now, to actually test whether I understood it or just
> guessed wrong."
[Answer the new follow-up question — correctly this time.]

**1:30–1:50 — Code / architecture**
[Cut to the GitHub repo, scroll to `lib/srs.ts` and its test file.]
> "The scheduling logic is a plain, deterministic, unit-tested module — five tests,
> all passing — so the 'what should you be asked next' decision doesn't depend on the
> model behaving consistently run to run. The three LLM calls — extraction, question
> generation, follow-up generation — are isolated to one function. And before shipping,
> we ran an adversarial review pass with a second model that caught three real bugs,
> including one where the follow-up question wasn't actually being shown — fixed and
> covered."

**1:50–2:00 — Close**
> "Recall Forge: paste your notes, get tested on what you actually don't know yet.
> Live at recall-forge-kappa.vercel.app, code's public on GitHub."

---

## Recording notes
- Use a clean browser profile / incognito-ish window so no stray extensions show.
- If the model returns a weird/malformed concept split live, that's fine to reroll —
  hit "Start over with new notes" and regenerate before recording final take.
- Keep an eye on the mastery bar color change (red → yellow → green) as a visual beat.
