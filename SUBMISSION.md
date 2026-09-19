# Devpost submission draft — General Learning Hacks

Paste-ready. Fill in the `[ ]` brackets before submitting (team name, your name,
registration confirmation) — everything else is ready as-is.

---

## Project name

Recall Forge

## Elevator pitch (one line)

Paste your notes, get a quiz that diagnoses *why* you got something wrong and forges
a new question to test that exact gap — instead of repeating the same flashcard.

## What it does

Recall Forge turns any block of notes — a textbook chapter, a lecture summary, a slide
deck dump — into an adaptive multiple-choice quiz. It extracts the distinct testable
concepts, writes one question per concept, and schedules them with a spaced-repetition
algorithm so weaker concepts resurface sooner.

The part that makes it different: when you get a question wrong, Recall Forge doesn't
just show you the answer and move on, and it doesn't re-ask the same question later
hoping you memorized it. It immediately asks the model to write a **new** question on
that same concept, from a different angle than the one you missed — the angle most
likely to reveal whether you actually misunderstood the idea or just picked the wrong
button. You get tested on your actual gap, in the moment, not a rehearsed answer.

A live mastery bar shows per-concept progress as you go, backed by a deterministic
SM-2-style scheduler — the "what should I be asked next" logic is not a black box the
model reinvents every time; it's inspectable, unit-tested code.

## How we built it

- **Frontend**: Next.js 14 (App Router), React, no external UI framework — kept the
  bundle small and the demo fast to load.
- **Model calls**: three isolated LLM calls via OpenRouter — concept extraction +
  question generation, and targeted follow-up generation on a miss. All routed through
  one function (`lib/llm.ts`) so there's exactly one place in the codebase that talks
  to a model.
- **Scheduling**: a pure, deterministic spaced-repetition module (`lib/srs.ts`,
  SM-2-style) with its own unit test suite — the only part of the system that decides
  "what's due next" is not model output.
- **Deploy**: Vercel, GitHub-connected, auto-deploys on push.
- **Review process**: before shipping, we ran an adversarial code review pass with a
  second model (GPT-5-class, via OpenRouter) specifically looking for correctness bugs,
  not style nits. It caught three real ones pre-submission: the core "miss → follow-up
  question" flow silently failing to swap the visible question, an unvalidated model
  response able to crash the UI, and a prototype-pollution edge case from a
  model-chosen concept string like `"constructor"`. All three are fixed and covered.

## Challenges we ran into

- Getting the "miss triggers a genuinely different question, not a reworded one" loop
  to actually swap what's on screen — our first implementation generated the follow-up
  question correctly but never re-rendered it, so the promised behavior silently didn't
  happen. Caught by an adversarial review pass, not by us playing with it.
- Deciding how much of the scheduling logic to hand to the model vs. keep
  deterministic. We chose to keep "what's due next" as plain, testable code and use the
  model only for content generation — easier to reason about, easier to demo, and it
  means judges can read `lib/srs.ts` and verify the claims instead of trusting a prompt.

## Accomplishments we're proud of

Ships a real diagnose-and-regenerate loop, not just a flashcard generator with an LLM
label on it — and the one piece that has to be reliable (the scheduler) is the one
piece that's actually tested and provably deterministic.

## What we learned

An adversarial second-model review pass on a rushed build is cheap and catches exactly
the kind of "looks done, demo would have broken live" bug that's easy to miss when
you're the one who wrote the happy path.

## What's next for Recall Forge

- Persist quiz history server-side (currently per-browser localStorage only) so
  spaced-repetition schedules survive across devices.
- Support PDF/image upload for notes, not just pasted text.
- Real per-user rate limiting (current guard is a demo-grade in-memory limiter, not a
  substitute for a real store under real traffic).

## Built with

`nextjs` `react` `typescript` `vercel` `openrouter` `llm` `spaced-repetition`

## Links

- Live app: https://recall-forge-kappa.vercel.app
- GitHub (public): https://github.com/localecho/recall-forge
