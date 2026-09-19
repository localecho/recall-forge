import { NextRequest, NextResponse } from "next/server";
import { callModelForJSON } from "@/lib/llm";

type GenerateResponse = {
  concepts: string[];
  questions: {
    id: string;
    concept: string;
    question: string;
    choices: string[];
    answerIndex: number;
  }[];
};

export async function POST(req: NextRequest) {
  const { notes } = await req.json();
  if (!notes || typeof notes !== "string" || notes.trim().length < 20) {
    return NextResponse.json({ error: "Paste at least a few sentences of notes." }, { status: 400 });
  }

  const system = `You are a study-quiz generator. Given a student's notes, extract 4-8 distinct
testable CONCEPTS (short noun phrases, not full sentences), then write one multiple-choice
question per concept. Each question has exactly 4 choices and one correct answerIndex (0-3).
Return ONLY JSON matching this shape, no prose, no markdown fences:
{"concepts": string[], "questions": [{"id": string, "concept": string, "question": string, "choices": [string,string,string,string], "answerIndex": number}]}`;

  const user = `NOTES:\n${notes.slice(0, 8000)}`;

  try {
    const result = await callModelForJSON<GenerateResponse>(system, user);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "generation failed" }, { status: 500 });
  }
}
