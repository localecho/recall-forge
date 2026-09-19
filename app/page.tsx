"use client";

import { useMemo, useState } from "react";
import { ConceptState, gradeAnswer, initConcept, mastery, nextConcept } from "@/lib/srs";

type Question = {
  id: string;
  concept: string;
  question: string;
  choices: string[];
  answerIndex: number;
};

export default function Page() {
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [questionsByConcept, setQuestionsByConcept] = useState<Record<string, Question[]>>({});
  const [conceptStates, setConceptStates] = useState<ConceptState[]>([]);
  const [current, setCurrent] = useState<Question | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [regenerating, setRegenerating] = useState(false);
  const [answeredCount, setAnsweredCount] = useState(0);

  const started = conceptStates.length > 0;

  async function generateQuiz() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "generation failed");

      const byConcept: Record<string, Question[]> = {};
      for (const q of data.questions as Question[]) {
        byConcept[q.concept] = byConcept[q.concept] ? [...byConcept[q.concept], q] : [q];
      }
      const states = (data.concepts as string[]).map((c) => initConcept(c));
      setQuestionsByConcept(byConcept);
      setConceptStates(states);
      setAnsweredCount(0);
      const first = nextConcept(states);
      setCurrent(first ? byConcept[first.concept][0] : null);
      setSelected(null);
      setFeedback(null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function answer(choiceIndex: number) {
    if (!current || selected !== null) return;
    setSelected(choiceIndex);
    const correct = choiceIndex === current.answerIndex;
    setFeedback(correct ? "correct" : "wrong");
    setAnsweredCount((n) => n + 1);

    const updatedStates = conceptStates.map((s) =>
      s.concept === current.concept ? gradeAnswer(s, correct) : s
    );
    setConceptStates(updatedStates);

    if (correct) {
      return; // wait for "Next question" click
    }

    // Wrong: immediately forge a targeted follow-up question on the same concept.
    setRegenerating(true);
    try {
      const res = await fetch("/api/followup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes, concept: current.concept, missedQuestion: current.question }),
      });
      const data = await res.json();
      if (res.ok) {
        const newQ: Question = {
          id: `${current.concept}-${Date.now()}`,
          concept: current.concept,
          question: data.question,
          choices: data.choices,
          answerIndex: data.answerIndex,
        };
        setQuestionsByConcept((prev) => ({
          ...prev,
          [current.concept]: [...(prev[current.concept] || []), newQ],
        }));
      }
    } finally {
      setRegenerating(false);
    }
  }

  function nextQuestion() {
    const picked = nextConcept(conceptStates);
    if (!picked) {
      setCurrent(null);
      return;
    }
    const pool = questionsByConcept[picked.concept] || [];
    const q = pool[pool.length - 1] || pool[0];
    setCurrent(q || null);
    setSelected(null);
    setFeedback(null);
  }

  const overallMastery = useMemo(() => {
    if (conceptStates.length === 0) return 0;
    return conceptStates.reduce((sum, s) => sum + mastery(s), 0) / conceptStates.length;
  }, [conceptStates]);

  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "32px 20px 80px" }}>
      <h1 style={{ fontSize: 28, marginBottom: 4 }}>Recall Forge</h1>
      <p style={{ color: "#9aa0ab", marginTop: 0, marginBottom: 24 }}>
        Paste your notes. It builds a quiz, and when you miss a question, it forges a new one
        targeting the exact concept you don&apos;t know yet &mdash; instead of just repeating the
        same card.
      </p>

      {!started && (
        <>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Paste a chapter, a lecture summary, anything you need to learn..."
            rows={10}
            style={{
              width: "100%",
              boxSizing: "border-box",
              background: "#14171f",
              color: "#e8e8ec",
              border: "1px solid #2a2e3a",
              borderRadius: 8,
              padding: 12,
              fontSize: 15,
            }}
          />
          <button
            onClick={generateQuiz}
            disabled={loading || notes.trim().length < 20}
            style={{
              marginTop: 12,
              padding: "10px 20px",
              fontSize: 15,
              borderRadius: 8,
              border: "none",
              background: loading ? "#3a3f4d" : "#5b8def",
              color: "white",
              cursor: loading ? "default" : "pointer",
            }}
          >
            {loading ? "Building your quiz..." : "Generate adaptive quiz"}
          </button>
          {error && <p style={{ color: "#f0665e" }}>{error}</p>}
        </>
      )}

      {started && (
        <div>
          <MasteryBar conceptStates={conceptStates} overall={overallMastery} answeredCount={answeredCount} />

          {current ? (
            <div style={{ marginTop: 24, background: "#14171f", border: "1px solid #2a2e3a", borderRadius: 10, padding: 20 }}>
              <div style={{ fontSize: 12, color: "#7f8794", textTransform: "uppercase", letterSpacing: 0.6 }}>
                {current.concept}
              </div>
              <div style={{ fontSize: 18, margin: "10px 0 16px" }}>{current.question}</div>
              {current.choices.map((choice, i) => {
                const isSelected = selected === i;
                const isAnswerCorrect = i === current.answerIndex;
                let bg = "#1c2030";
                if (selected !== null && isAnswerCorrect) bg = "#1f3d2b";
                else if (isSelected && !isAnswerCorrect) bg = "#3d1f22";
                return (
                  <button
                    key={i}
                    onClick={() => answer(i)}
                    disabled={selected !== null}
                    style={{
                      display: "block",
                      width: "100%",
                      textAlign: "left",
                      marginBottom: 8,
                      padding: "10px 14px",
                      borderRadius: 8,
                      border: "1px solid #2a2e3a",
                      background: bg,
                      color: "#e8e8ec",
                      cursor: selected === null ? "pointer" : "default",
                    }}
                  >
                    {choice}
                  </button>
                );
              })}

              {feedback === "correct" && (
                <p style={{ color: "#5fd08a" }}>
                  Correct.{" "}
                  <button onClick={nextQuestion} style={linkBtn}>
                    Next question →
                  </button>
                </p>
              )}
              {feedback === "wrong" && (
                <p style={{ color: "#f0665e" }}>
                  {regenerating
                    ? "Not quite — forging a follow-up question on this concept..."
                    : "Not quite — a follow-up question just appeared below. Try it now, or:"}{" "}
                  <button onClick={nextQuestion} style={linkBtn}>
                    skip to next →
                  </button>
                </p>
              )}
            </div>
          ) : (
            <p style={{ marginTop: 24, color: "#9aa0ab" }}>No concepts left in the queue — nice work.</p>
          )}
        </div>
      )}
    </main>
  );
}

const linkBtn: React.CSSProperties = {
  background: "none",
  border: "none",
  color: "#5b8def",
  cursor: "pointer",
  fontSize: 14,
  padding: 0,
};

function MasteryBar({
  conceptStates,
  overall,
  answeredCount,
}: {
  conceptStates: ConceptState[];
  overall: number;
  answeredCount: number;
}) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#9aa0ab" }}>
        <span>Mastery: {Math.round(overall * 100)}%</span>
        <span>{answeredCount} answered</span>
      </div>
      <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
        {conceptStates.map((s) => (
          <div key={s.concept} title={`${s.concept}: ${Math.round(mastery(s) * 100)}%`} style={{ flex: 1 }}>
            <div style={{ height: 8, borderRadius: 4, background: "#2a2e3a", overflow: "hidden" }}>
              <div
                style={{
                  height: "100%",
                  width: `${Math.round(mastery(s) * 100)}%`,
                  background: mastery(s) > 0.6 ? "#5fd08a" : mastery(s) > 0.25 ? "#e8c15a" : "#f0665e",
                }}
              />
            </div>
            <div style={{ fontSize: 10, color: "#7f8794", marginTop: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {s.concept}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
