import { type NextRequest, NextResponse } from "next/server"
import { createQuizSession } from "@/app/db/queries"

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
