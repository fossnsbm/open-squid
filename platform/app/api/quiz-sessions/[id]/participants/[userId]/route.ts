import { type NextRequest, NextResponse } from "next/server"
import { updateParticipantScore } from "@/app/db/queries"

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string; userId: string }> }) {
  try {
    const { id, userId } = await params
    const { score } = await request.json()
    await updateParticipantScore(id, userId, score)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating participant score:", error)
    return NextResponse.json({ error: "Failed to update participant score" }, { status: 500 })
  }
}
