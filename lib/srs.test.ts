import { describe, expect, it } from "vitest";
import { gradeAnswer, initConcept, mastery, nextConcept } from "./srs";

describe("srs scheduler", () => {
  it("a fresh concept starts due immediately with zero mastery", () => {
    const now = 1000;
    const c = initConcept("photosynthesis", now);
    expect(c.dueAt).toBe(now);
    expect(mastery(c)).toBe(0);
  });

  it("correct answers push the concept further into the future each time", () => {
    const now = 1000;
    let c = initConcept("mitosis", now);
    c = gradeAnswer(c, true, now);
    const firstDue = c.dueAt;
    c = gradeAnswer(c, true, firstDue);
    const secondDue = c.dueAt;
    expect(secondDue - firstDue).toBeGreaterThan(firstDue - now);
  });

  it("a wrong answer resets streak and schedules a retest soon, not far out", () => {
    const now = 1000;
    let c = initConcept("krebs cycle", now);
    c = gradeAnswer(c, true, now);
    c = gradeAnswer(c, true, c.dueAt);
    expect(c.streak).toBe(2);
    const beforeMiss = c.dueAt;
    c = gradeAnswer(c, false, beforeMiss);
    expect(c.streak).toBe(0);
    expect(c.misses).toBe(1);
    expect(c.dueAt - beforeMiss).toBeLessThan(24 * 60 * 60 * 1000);
  });

  it("nextConcept prioritizes the weakest due concept over a stronger one", () => {
    const now = 1000;
    const weak = gradeAnswer(initConcept("weak", now), false, now); // misses=1, due in 10min
    const strong = { ...initConcept("strong", now), dueAt: now }; // also due now, but fresh (mastery 0 too)
    // make strong actually stronger by giving it streak/ease without changing dueAt
    const strongerBoosted = { ...strong, streak: 3, ease: 2.7 };
    const picked = nextConcept([strongerBoosted, { ...weak, dueAt: now }], now);
    expect(picked?.concept).toBe("weak");
  });

  it("nextConcept returns null for an empty pool", () => {
    expect(nextConcept([])).toBeNull();
  });
});
