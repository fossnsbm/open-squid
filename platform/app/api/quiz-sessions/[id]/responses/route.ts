import { db } from "@/app/db";
import { userAnswers } from "@/app/db/schema";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionId = params.id;
    const url = new URL(request.url);
    const questionIndex = url.searchParams.get("questionIndex");

    // Get question IDs for this session
    const questionsRes = await fetch(`${url.origin}/api/questions`);
    if (!questionsRes.ok) {
      return NextResponse.json(
        { error: "Failed to fetch questions" },
        { status: 500 }
      );
    }

    const questions = await questionsRes.json();
    
    // If there's a questionIndex parameter, get the specific question
    let targetQuestionId;
    if (questionIndex !== null) {
      const index = parseInt(questionIndex as string, 10);
      targetQuestionId = questions[index]?.id;
    }

    // Get all responses for the current question in this session
    const responses = await db
      .select()
      .from(userAnswers)
      .where(
        and(
          eq(userAnswers.quizSessionId, sessionId),
          targetQuestionId ? eq(userAnswers.questionId, targetQuestionId) : undefined
        )
      );

    return NextResponse.json(responses);
  } catch (error) {
    console.error("Error fetching responses:", error);
    return NextResponse.json(
      { error: "Failed to fetch responses" },
      { status: 500 }
    );
  }
}
