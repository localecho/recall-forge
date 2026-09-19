import { NextRequest, NextResponse } from "next/server";
import { callModelForJSON } from "@/lib/llm";
import { clientKey, isRateLimited } from "@/lib/rateLimit";

type FollowupResponse = {
  question: string;
  choices: [string, string, string, string];
  answerIndex: number;
};

export async function POST(req: NextRequest) {
  if (isRateLimited(clientKey(req))) {
    return NextResponse.json({ error: "Too many requests — wait a minute and try again." }, { status: 429 });
  }

  const { notes, concept, missedQuestion } = await req.json();
  if (!notes || !concept || !missedQuestion) {
    return NextResponse.json({ error: "notes, concept, and missedQuestion are required" }, { status: 400 });
  }

  const system = `You are a study-quiz generator diagnosing a student's gap. The student just got
a question wrong on the concept below. Write ONE new multiple-choice question testing the SAME
concept from a different angle than the missed question (don't just reword it) — pick the angle
most likely to reveal the actual misunderstanding. Return ONLY JSON, no prose:
{"question": string, "choices": [string,string,string,string], "answerIndex": number}`;

  const user = `NOTES:\n${String(notes).slice(0, 8000)}\n\nCONCEPT: ${String(concept).slice(
    0,
    200
  )}\n\nMISSED QUESTION: ${String(missedQuestion).slice(0, 500)}`;

  try {
    const result = await callModelForJSON<FollowupResponse>(system, user);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "generation failed" }, { status: 500 });
  }
}
