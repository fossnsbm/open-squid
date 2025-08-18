// import { NextResponse } from "next/server"
// import { getActivePromptSession, getPromptParticipants } from "@/app/db/queries"

// export async function GET() {
//   try {
//     const activeSession = await getActivePromptSession()
    
//     if (activeSession) {
//       // Get participant count
//       const participants = await getPromptParticipants(activeSession.id)
//       return NextResponse.json({
//         ...activeSession,
//         participant_count: participants.length,
//       })
//     } else {
//       return NextResponse.json(null)
//     }
//   } catch (error) {
//     console.error("Error fetching active quiz session:", error)
//     return NextResponse.json({ error: "Failed to fetch active quiz session" }, { status: 500 })
//   }
// }