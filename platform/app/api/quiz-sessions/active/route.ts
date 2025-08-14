import { NextResponse } from "next/server"
import { getActiveQuizSession, getQuizParticipants } from "@/app/db/queries"

export async function GET() {
  try {
    const activeSession = await getActiveQuizSession()
    
    if (activeSession) {
      // Get participant count
      const participants = await getQuizParticipants(activeSession.id)
      return NextResponse.json({
        ...activeSession,
        participant_count: participants.length,
      })
    } else {
      return NextResponse.json(null)
    }
  } catch (error) {
    console.error("Error fetching active quiz session:", error)
    return NextResponse.json({ error: "Failed to fetch active quiz session" }, { status: 500 })
  }
}
