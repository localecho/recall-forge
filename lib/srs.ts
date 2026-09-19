// Deterministic spaced-repetition scheduler (SM-2 style, simplified).
// Pure functions only — no LLM calls in here, so it's the one part of the
// app that's actually unit-testable and judge-inspectable.

export type ConceptState = {
  concept: string;
  ease: number; // 1.3 (hard) .. 2.8 (easy)
  intervalDays: number;
  dueAt: number; // epoch ms
  streak: number; // consecutive correct
  misses: number; // total wrong answers ever
};

const MIN_EASE = 1.3;
const MAX_EASE = 2.8;

export function initConcept(concept: string, now: number = Date.now()): ConceptState {
  return { concept, ease: 2.5, intervalDays: 0, dueAt: now, streak: 0, misses: 0 };
}

export function gradeAnswer(
  state: ConceptState,
  correct: boolean,
  now: number = Date.now()
): ConceptState {
  if (correct) {
    const streak = state.streak + 1;
    const ease = Math.min(MAX_EASE, state.ease + 0.1);
    const intervalDays =
      state.intervalDays === 0 ? 1 : state.intervalDays === 1 ? 3 : Math.round(state.intervalDays * ease);
    return {
      ...state,
      ease,
      streak,
      intervalDays,
      dueAt: now + intervalDays * 24 * 60 * 60 * 1000,
    };
  }
  // Wrong answer: reset progress on this concept, drop ease, retest soon (10 min).
  return {
    ...state,
    ease: Math.max(MIN_EASE, state.ease - 0.3),
    streak: 0,
    intervalDays: 0,
    misses: state.misses + 1,
    dueAt: now + 10 * 60 * 1000,
  };
}

// Mastery in [0,1]: 0 = never answered right, 1 = fully consolidated (streak>=4, high ease).
export function mastery(state: ConceptState): number {
  const streakScore = Math.min(1, state.streak / 4);
  const easeScore = (state.ease - MIN_EASE) / (MAX_EASE - MIN_EASE);
  // Ease only contributes once there's an actual correct streak — a never-attempted
  // (or just-missed) concept must read as 0, not "0.24 because default ease is mid-range."
  return Math.max(0, Math.min(1, streakScore * (0.7 + 0.3 * easeScore)));
}

// Which concept should the next question target? Earliest-due wins; ties
// broken by lowest mastery (weakest concept first).
export function nextConcept(states: ConceptState[], now: number = Date.now()): ConceptState | null {
  const due = states.filter((s) => s.dueAt <= now);
  const pool = due.length > 0 ? due : states;
  if (pool.length === 0) return null;
  return [...pool].sort((a, b) => {
    if (a.dueAt !== b.dueAt) return a.dueAt - b.dueAt;
    return mastery(a) - mastery(b);
  })[0];
}
