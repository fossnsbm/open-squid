import { type NextRequest, NextResponse } from "next/server"
import { createQuizSession, getQuizSessions  } from "@/app/db/queries"

export async function POST(request: NextRequest) {
  try {
    const { title, timePerQuestion } = await request.json()
    const session = await createQuizSession(title, timePerQuestion)
    return NextResponse.json(session, { status: 201 })
  } catch (error) {
    console.error("Error creating quiz session:", error)
    return NextResponse.json({ error: "Failed to create quiz session" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const questions = await getQuizSessions()
    return NextResponse.json(questions)
  } catch (error) {
    console.error("Error fetching questions:", error)
    return NextResponse.json(
      { error: "Failed to fetch questions", details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    )
  }
}
