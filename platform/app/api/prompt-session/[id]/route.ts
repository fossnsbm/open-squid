import { type NextRequest, NextResponse } from "next/server"
import { updatePromptSessionStatus } from "@/app/db/queries"

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { action } = await request.json()
    await updatePromptSessionStatus(id, action )
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating quiz session:", error)
    return NextResponse.json({ error: "Failed to update quiz session" }, { status: 500 })
  }
}