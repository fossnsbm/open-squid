// import { type NextRequest, NextResponse } from "next/server"
// import { addQuizParticipant, getQuizParticipants } from "@/lib/db/queries"

// export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
//   try {
//     const { id } = await params
//     const participants = await getQuizParticipants(id)
//     return NextResponse.json(participants)
//   } catch (error) {
//     console.error("Error fetching participants:", error)
//     return NextResponse.json({ error: "Failed to fetch participants" }, { status: 500 })
//   }
// }

// export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
//   try {
//     const { id } = await params
//     const { userId } = await request.json()
//     const participant = await addQuizParticipant(id, userId)
//     return NextResponse.json(participant, { status: 201 })
//   } catch (error) {
//     console.error("Error adding participant:", error)
//     return NextResponse.json({ error: "Failed to add participant" }, { status: 500 })
//   }
// }
