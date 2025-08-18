import { type NextRequest, NextResponse } from "next/server"
import { updateQuizSessionStatus } from "@/app/db/queries"

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { status, currentQuestionIndex } = await request.json()
    await updateQuizSessionStatus(id, status, currentQuestionIndex)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating quiz session:", error)
    return NextResponse.json({ error: "Failed to update quiz session" }, { status: 500 })
  }
}
