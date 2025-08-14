import { type NextRequest, NextResponse } from "next/server"
import { saveUserAnswer } from "@/app/db/queries"

export async function POST(request: NextRequest) {
  try {
    const { userId, sessionId, questionId, selectedAnswer, isCorrect, responseTime } = await request.json()

    const answer = await saveUserAnswer(userId, sessionId, questionId, selectedAnswer, isCorrect, responseTime)

    return NextResponse.json(answer, { status: 201 })
  } catch (error) {
    console.error("Error saving user answer:", error)
    return NextResponse.json({ error: "Failed to save user answer" }, { status: 500 })
  }
}
